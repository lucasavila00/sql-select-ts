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
