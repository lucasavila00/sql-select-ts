import * as path from "path";
import * as fs from "fs/promises";
import * as fsSync from "fs";

const copyRecursive = async (src: string, dest: string) => {
    const isDirectory = await fs.stat(src).then((it) => it.isDirectory());

    if (isDirectory) {
        await fs.mkdir(dest).catch((_) => void 0);

        const content = await fs.readdir(src);

        for (const childItemName of content) {
            await copyRecursive(
                path.join(src, childItemName),
                path.join(dest, childItemName)
            );
        }
    } else {
        await fs.copyFile(src, dest);
    }
};

export const main = async () => {
    const inFolder = path.join(__dirname, "../../lib/docs-ts-out/modules");
    const outFolder = path.join(__dirname, "../../docs/api");

    await copyRecursive(inFolder, outFolder);
};
main();
