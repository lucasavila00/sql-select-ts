import { fromStringifiedSelectStatement, dsql } from "../src";
import { configureSqlite } from "./utils";

describe("StringifiedSelectStatement", () => {
    const { run } = configureSqlite();

    it("works", async () => {
        const q = fromStringifiedSelectStatement(dsql`SELECT 10 AS a`);
        expect(q.stringify()).toMatchInlineSnapshot(`"SELECT 10 AS a"`);
        expect(await run(q.stringify())).toMatchInlineSnapshot(`
            Array [
              Object {
                "a": 10,
              },
            ]
        `);
    });

    it("append select qualified", async () => {
        const q = fromStringifiedSelectStatement<"a" | "b" | "c">(
            dsql`SELECT 10 AS a, 11 as b, 12 as c`
        );
        const q2 = q
            .as("t2")
            .select((f) => ({ a: f.t2.a }))
            .appendSelect((f) => ({ b: f.t2.b }))
            .appendSelect((f) => ({ c: f.t2.c }))
            .stringify();
        expect(q.stringify()).toMatchInlineSnapshot(
            `"SELECT 10 AS a, 11 as b, 12 as c"`
        );
        expect(q2).toMatchInlineSnapshot(
            `"SELECT \`t2\`.\`a\` AS \`a\`, \`t2\`.\`b\` AS \`b\`, \`t2\`.\`c\` AS \`c\` FROM (SELECT 10 AS a, 11 as b, 12 as c) AS \`t2\`"`
        );
    });

    it("works wrapped", async () => {
        const q = fromStringifiedSelectStatement<"a">(
            dsql`SELECT 10 AS a`
        ).select((f) => ({ a: f.a }));
        expect(q.stringify()).toMatchInlineSnapshot(
            `"SELECT \`a\` AS \`a\` FROM (SELECT 10 AS a)"`
        );
        expect(await run(q.stringify())).toMatchInlineSnapshot(`
            Array [
              Object {
                "a": 10,
              },
            ]
        `);
    });
    it("works wrapped without parens", async () => {
        const q = fromStringifiedSelectStatement<"a">(
            dsql`SELECT 10 AS a`,
            false
        ).select((f) => ({ a: f.a }));
        expect(q.stringify()).toMatchInlineSnapshot(
            `"SELECT \`a\` AS \`a\` FROM SELECT 10 AS a"`
        );
    });
    it("works wrapped2", async () => {
        const q = fromStringifiedSelectStatement<"a">(
            dsql`SELECT 10 AS a`
        ).selectStar();
        expect(q.stringify()).toMatchInlineSnapshot(
            `"SELECT * FROM (SELECT 10 AS a)"`
        );
        expect(await run(q.stringify())).toMatchInlineSnapshot(`
            Array [
              Object {
                "a": 10,
              },
            ]
        `);
    });
});
