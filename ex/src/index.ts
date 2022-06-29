import * as fs from "fs/promises";
import unified from "unified";
import remarkStringify from "remark-stringify";
import remarkParse from "remark-parse";
import type { Code } from "mdast";
import { Parent, Node, Data } from "unist";
import { format } from "sql-formatter";
import { Plugin } from "unified";
import { spawnSync } from "child_process";
import { Ast, parseCommand } from "./command";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as prettier from "prettier";
import * as path from "path";
import { argv } from "node:process";
const isCode = (it: Parent): it is Code & Parent => it.type === "code";
const isTsCode = (it: Parent): it is Code & Parent =>
    isCode(it) && it.lang === "ts";

const flatMap = (
    ast: Parent,
    fn: (
        it: Parent,
        index: number,
        parent: Parent | null
    ) => (Parent | Node<Data>)[]
): Node<Data> => {
    const transform = (node: Parent, index: number, parent: Parent | null) => {
        if (node.children) {
            const out: (Node<Data> | Parent<Node<Data>, Data>)[] = [];
            for (let i = 0, n = node.children.length; i < n; i++) {
                //@ts-ignore
                const xs = transform(node.children[i], i, node);
                if (xs) {
                    for (let j = 0, m = xs.length; j < m; j++) {
                        out.push(xs[j]);
                    }
                }
            }
            node.children = out;
        }

        return fn(node, index, parent);
    };

    return transform(ast, 0, null)[0];
};

function visitNode(node: any, fn: any) {
    if (Array.isArray(node)) {
        // As of Node.js 16 using raw for loop over Array.entries provides a
        // measurable difference in performance. Array.entries returns an iterator
        // of arrays.
        for (let i = 0; i < node.length; i++) {
            node[i] = visitNode(node[i], fn);
        }
        return node;
    }
    if (node && typeof node === "object" && typeof node.type === "string") {
        // As of Node.js 16 this is benchmarked to be faster over Object.entries.
        // Object.entries returns an array of arrays. There are multiple ways to
        // iterate over objects but the Object.keys combined with a for loop
        // benchmarks well.
        const keys = Object.keys(node);
        for (let i = 0; i < keys.length; i++) {
            node[keys[i]] = visitNode(node[keys[i]], fn);
        }
        return fn(node) || node;
    }
    return node;
}

const removeYield = (code: string): string =>
    prettier
        .format(code, {
            filepath: "it.ts",
            parser: (text, cfg) => {
                const ast = cfg.typescript(text);

                const body = visitNode(ast.body, (node: any) => {
                    if (node.type === "YieldExpression") {
                        return node.argument;
                    }
                    return node;
                });
                const newAst = { ...ast, body };

                return newAst;
            },
        })
        .trimEnd();

const isYieldBlock = (code: string, cmd: Ast) => {
    const hasArg = cmd.args.named["yield"] != null;
    const isByCode = isYieldBlockByCount(code);
    if (hasArg || isByCode) {
        if (!isByCode || !hasArg) {
            // both should be true
            throw new Error(
                "eval and yield conflicting" +
                    "\ncode:\n" +
                    code +
                    "\ncmd:\n" +
                    JSON.stringify(cmd)
            );
        }
        return true;
    }
    return false;
};
const isYieldBlockByCount = (code: string) => {
    let yieldCount = 0;

    prettier.format(code, {
        filepath: "it.ts",
        parser: (text, cfg) => {
            const ast = cfg.typescript(text);

            visitNode(ast.body, (node: any) => {
                if (node.type === "YieldExpression") {
                    yieldCount++;
                }
                return node;
            });

            return ast;
        },
    });

    if (yieldCount === 0) {
        return false;
    }
    if (yieldCount === 1) {
        return true;
    }
    throw new Error("yield count is not 1 or 0: " + yieldCount);
};
const getFormattedCode = (cmd: Ast, result: string) => {
    if (cmd.args.named["yield"] === "sql") {
        return {
            type: "code",
            value: format(result),
            lang: "sql",
        };
    }
    if (cmd.args.named["yield"] === "json") {
        return {
            type: "code",
            value: prettier
                .format(JSON.stringify(result), { parser: "json" })
                .trim(),
            lang: "json",
        };
    }
    throw new Error("not known meta: " + JSON.stringify(cmd));
};
const cmdParser = (source: string) =>
    pipe(
        source,
        parseCommand("eval", (c) => `command not found: ${c}`),
        E.fold(
            (it) => null,
            (it) => it
        )
    );
const recreateMarkdown =
    (jsonFile: string): Plugin =>
    () =>
    async (tree) => {
        const vs = await fs.readFile(jsonFile, "utf8");
        const values = JSON.parse(vs);
        let idx = 0;

        flatMap(tree as Parent, (node) => {
            if (isTsCode(node)) {
                const cmd = cmdParser(String(node.meta));
                if (cmd != null) {
                    if (isYieldBlock(node.value, cmd)) {
                        const it = values[idx];
                        idx++;
                        return [
                            {
                                ...node,
                                meta: null,
                                value: removeYield(node.value),
                            },
                            getFormattedCode(cmd, it),
                        ];
                    }
                    return [{ ...node, meta: null }];
                }
            }

            return [node];
        });
    };
const executeTypescript =
    (tsFile: string, jsonFile: string, extraFlags: string[]): Plugin =>
    () =>
    async (tree) => {
        let beforeFirstYield = "";
        let code = "";
        let hasYield = false;
        flatMap(tree as Parent, (node) => {
            if (isTsCode(node)) {
                const cmd = cmdParser(String(node.meta));
                if (cmd != null) {
                    if (isYieldBlock(node.value, cmd)) {
                        hasYield = true;
                    }
                    if (hasYield) {
                        code += node.value;
                        code += "\n";
                    } else {
                        beforeFirstYield += node.value;
                        beforeFirstYield += "\n";
                    }
                }
            }

            return [node];
        });

        let final = "import * as fs from 'fs';\n";

        final += beforeFirstYield;
        final += `\nasync function* generator() {\n`;
        final += code;
        final += `\
\n}

const main = async () => {
    const gen = generator();
    let collected : any[]= []
    for await (const iterator of gen) {
        collected.push(iterator);
    }
    fs.writeFileSync("${jsonFile}", JSON.stringify(collected));
}
main()

`;

        await fs.writeFile(
            tsFile,
            prettier.format(final, { filepath: "it.ts" })
        );
        const it = spawnSync("ts-node", [...extraFlags, tsFile], {
            stdio: "pipe",
            encoding: "utf8",
        });
        if (it.status !== 0) {
            throw new Error(it.stderr);
        }
    };
const convertOriginalFile = (originalFile: string, newExt: string): string =>
    pipe(originalFile.split("."), (arr) =>
        arr.slice(0, -1).concat(newExt).join(".")
    );

const processFile = async (
    inFolder: string,
    outFolder: string,
    f: string,
    transpileOnly: boolean
) => {
    const originalMarkdownFile = path.join(__dirname, inFolder, f);

    const ouputFile = path.join(__dirname, outFolder, f);

    const tsFile = convertOriginalFile(originalMarkdownFile, "exec.ts");
    const jsonFile = convertOriginalFile(originalMarkdownFile, "exec.json");

    const doc = await fs.readFile(originalMarkdownFile);
    const file = await unified()
        .use(remarkParse)
        .use(
            executeTypescript(
                tsFile,
                jsonFile,
                transpileOnly ? ["--transpileOnly"] : []
            )
        )
        .use(recreateMarkdown(jsonFile))
        .use(remarkStringify)
        .process(doc);

    await fs.writeFile(ouputFile, String(file));
};
async function main() {
    const transpileOnly = argv.some((it) => it.includes("--transpileOnly"));
    const inFolder = "../../lib/docs-eval";
    const outFolder = "../../lib/docs/examples";
    const files = (await fs.readdir(path.join(__dirname, inFolder))).filter(
        (it) => path.extname(it) === ".md"
    );
    await Promise.all(
        files.map((f) => processFile(inFolder, outFolder, f, transpileOnly))
    );
}
main();
