import * as fs from "fs/promises";
import * as path from "path";
import * as prettier from "prettier";

const main = async () => {
    const file = await fs.readFile(path.join(__dirname, "./code.txt"), "utf-8");

    const fmt = prettier
        .format(file, {
            filepath: "it.ts",
            parser: (text, cfg) => {
                const ast: any = cfg.typescript(text);

                const body = ast.body.map((it: any) => {
                    if (
                        it.type !== "ExportNamedDeclaration" &&
                        it.declaration.type !== "TSDeclareFunction"
                    ) {
                        throw new Error("...");
                    }
                    // eslint-disable-next-line no-console
                    console.log(it.declaration);
                    return {
                        ...it,
                        declaration: {
                            ...it.declaration,
                            params: it.declaration.params.reverse(),
                        },
                    };
                });
                const newAst = { ...ast, body };

                return newAst;
            },
        })
        .trimEnd();

    await fs.writeFile(path.join(__dirname, "./code2.txt"), fmt, "utf-8");
};
main();
