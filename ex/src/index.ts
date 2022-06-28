import * as fs from "fs/promises";
import unified from "unified";
import remarkStringify from "remark-stringify";
import remarkParse from "remark-parse";
import type { Code } from "mdast";
import { Parent, Node, Data } from "unist";
import { format } from "sql-formatter";
import * as Babel from "@babel/standalone";
import { Plugin } from "unified";

import {
    SafeString,
    sql as _sql,
    table as _table,
    unionAll as _unionAll,
    castSafe as _castSafe,
    fromNothing as _fromNothing,
} from "../../lib/src";

const table = _table;
const sql = _sql;
const unionAll = _unionAll;
const castSafe = _castSafe;
const fromNothing = _fromNothing;

const users = table(
    /* columns: */ ["id", "age", "name"],
    /* db-name & alias: */ "users"
);

const admins = table(
    /* columns: */ ["id", "age", "name"],
    /* alias: */ "adm",
    /* db-name: */ "admins"
);

const analytics = table(
    /* columns: */ ["id", "clicks"],
    /* db-name & alias: */ "analytics"
);

const equals = (
    a: SafeString | number | string,
    b: SafeString | number | string
): SafeString => sql`${a} = ${b}`;

const OR = (cases: SafeString[]): SafeString => {
    const j = cases.map((it) => it.content).join(" OR ");
    return castSafe(`(${j})`);
};

const isCode = (it: Parent): it is Code & Parent => it.type === "code";

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
                //@ts-expect-error
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

const execTypescriptCode: Plugin = () => async (tree) => {
    flatMap(tree as Parent, (node) => {
        if (
            isCode(node) &&
            node.lang === "ts" &&
            String(node.meta).split(" ").includes("eval-sql")
        ) {
            const jsCode = Babel.transform(node.value, {
                filename: "any.ts",
                presets: ["typescript"],
            }).code;

            return [
                { ...node, meta: null },
                {
                    type: "code",
                    value: String(format(eval(jsCode!))),
                    lang: "sql",
                },
            ];
        }

        return [node];
    });
};
const collectTypescriptCode: Plugin = () => async (tree) => {
    flatMap(tree as Parent, (node) => {
        if (
            isCode(node) &&
            node.lang === "ts" &&
            String(node.meta).split(" ").includes("eval")
        ) {
            console.error(node.value);
        }

        return [node];
    });
};
async function main() {
    const doc = await fs.readFile("./join.md");

    const file = await unified()
        .use(remarkParse)
        .use(collectTypescriptCode)
        .use(execTypescriptCode)
        .use(remarkStringify)
        .process(doc);

    // console.log(String(file));
}
main();
