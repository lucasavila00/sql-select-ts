import { table } from "../src";
import { configureSqlite } from "./utils";
import { addSimpleStringSerializer } from "./utils";
addSimpleStringSerializer();

describe("identifiers", () => {
    const test1 = table(["f1", "f2"], "test1");
    const { run } = configureSqlite();
    beforeAll(async () => {
        await run(`CREATE TABLE test1(f1 int, f2 int)`);
        await run(`INSERT INTO test1(f1,f2) VALUES(11,22)`);
    });

    it("1", async () => {
        const q = test1
            .select((f) => ({
                //
                a: f.f1,
                [" a"]: f.f1,
                ["` a"]: f.f1,
                ["`. a"]: f.f1,
                ["0123"]: f.f1,
            }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT f1 AS \`a\`, f1 AS \` a\`, f1 AS \`\`\` a\`, f1 AS \`\`\`. a\`, f1 AS \`0123\` FROM \`test1\``
        );
        await run(q);
    });
});
