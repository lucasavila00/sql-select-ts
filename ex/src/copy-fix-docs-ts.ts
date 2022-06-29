import * as path from "path";
import * as fs from "fs/promises";
import unified from "unified";
import remarkStringify from "remark-stringify";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import { Plugin } from "unified";
import { flatMap } from "./flat-map";
import { Parent } from "unist";
import type { Code } from "mdast";
import yaml from "js-yaml";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

const isYaml = (it: Parent): it is Code & Parent => it.type === "yaml";

const fixFrontMatter = (
    content: any,
    parent: string,
    grand_parent: string | null
): any => {
    const ctt = { ...content, layout: "default", parent, grand_parent };
    if (grand_parent == null) {
        delete ctt["grand_parent"];
    }
    return ctt;
};

const fixHeader = (
    content: string,
    parent: string,
    grand_parent: string | null
): string => {
    const vs = yaml.load(content);
    const mod = fixFrontMatter(vs, parent, grand_parent);
    return yaml.dump(mod);
};

const fixFrontmatter =
    (parent: string, grand_parent: string | null): Plugin =>
    () =>
    async (tree) => {
        let found = false;
        flatMap(tree as Parent, (node) => {
            if (isYaml(node)) {
                if (!found) {
                    found = true;
                    return [
                        {
                            ...node,
                            value: fixHeader(node.value, parent, grand_parent),
                        },
                    ];
                }

                return [];
            }

            return [node];
        });
    };

const process = async (
    content: string,
    parent: string,
    grand_parent: string | null
): Promise<string> => {
    const file = await unified()
        .use(remarkParse)
        .use(remarkFrontmatter, [
            {
                type: "yaml",
                fence: { open: "---", close: "---" },
                anywhere: true,
            },
        ])
        .use(fixFrontmatter(parent, grand_parent))
        .use(remarkStringify)
        .process(content);

    return String(file);
};

const copyFile = async (
    src: string,
    dest: string,
    parent: string,
    grand_parent: string | null
) => {
    if (src.endsWith(".ts.md") && dest.endsWith(".ts.md")) {
        const content = await fs.readFile(src, "utf-8");

        const processed = await process(content, parent, grand_parent);
        await fs.writeFile(dest, processed);
    }
};

const copyRecursive = async (src: string, dest: string, startDest: string) => {
    const isDirectory = await fs.stat(src).then((it) => it.isDirectory());

    if (isDirectory) {
        await fs.mkdir(dest).catch((_) => void 0);

        const content = await fs.readdir(src);

        for (const childItemName of content) {
            await copyRecursive(
                path.join(src, childItemName),
                path.join(dest, childItemName),
                startDest
            );
        }
    } else {
        const parent = pipe(
            dest.replace(startDest, "").split("/"),
            (it) => it[it.length - 2],
            (it) => it.charAt(0).toUpperCase() + it.slice(1)
        );
        const grand_parent = pipe(
            dest.replace(startDest, "").split("/"),
            (it) => O.fromNullable(it[it.length - 3]),
            O.chain((it) => (it.length > 0 ? O.some(it) : O.none)),
            O.map((it) => it.charAt(0).toUpperCase() + it.slice(1)),
            O.fold(
                () => null,
                (it) => it
            )
        );
        await copyFile(src, dest, parent, grand_parent);
    }
};

export const main = async () => {
    const inFolder = path.join(__dirname, "../../lib/docs-ts-out/modules");
    const outFolder = path.join(__dirname, "../../docs/api");
    const startDest = path.join(__dirname, "../../docs");

    await copyRecursive(inFolder, outFolder, startDest);
};
main();
