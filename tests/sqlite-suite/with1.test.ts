import { table, with_ } from "../../src";
import { sql } from "../../src/safe-string";
import { configureSqlite } from "../utils";
import { addSimpleStringSerializer } from "../utils";
addSimpleStringSerializer();

// mostly from https://github.com/sqlite/sqlite/blob/master/test/with1.test

describe("sqlite with", () => {
    const t0 = table(["x", "y"], "t0");

    const { run } = configureSqlite();

    beforeAll(async () => {
        await run(`CREATE TABLE t0(x INTEGER, y INTEGER)`);
    });

    it("with1-1.0", async () => {
        const q = with_(
            //
            t0.selectStar(),
            "x",
            ["a", "b"]
        )
            .select((_f) => ({ it: sql(10) }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `WITH x(a, b) AS (SELECT * FROM \`t0\`) SELECT 10 AS \`it\` FROM x`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("with1-1.0 - 2", async () => {
        const q = with_(
            //
            t0.selectStar(),
            "x",
            ["a", "b"]
        )
            .selectStar()
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `WITH x(a, b) AS (SELECT * FROM \`t0\`) SELECT * FROM x`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("with1-1.0 -- no columns", async () => {
        const q = with_(
            //
            t0.selectStar(),
            "x",
            []
        )
            .select((_f) => ({ it: sql(10) }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `WITH x AS (SELECT * FROM \`t0\`) SELECT 10 AS \`it\` FROM x`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("with1-1.0 -- no columns2", async () => {
        const q = with_(
            //
            t0.selectStar(),
            "x"
        )
            .select((_f) => ({ it: sql(10) }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `WITH x AS (SELECT * FROM \`t0\`) SELECT 10 AS \`it\` FROM x`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("with1-1.0 -- use alias", async () => {
        const q = with_(
            //
            t0.selectStar(),
            "x",
            ["a", "b"]
        )
            .select((f) => ({ it: f.a }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `WITH x(a, b) AS (SELECT * FROM \`t0\`) SELECT \`a\` AS \`it\` FROM x`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("with1-1.0 -- use alias2", async () => {
        const q = with_(
            //
            t0.selectStar(),
            "x",
            ["a", "b"]
        )
            .select((f) => ({ it: f["x.a"] }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `WITH x(a, b) AS (SELECT * FROM \`t0\`) SELECT \`x\`.\`a\` AS \`it\` FROM x`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("with1-1.1", async () => {
        const q = with_(
            //
            t0.selectStar(),
            "x",
            ["a", "b"]
        )
            .select((_f) => ({ it: sql(10) }))
            .selectStar()
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (WITH x(a, b) AS (SELECT * FROM \`t0\`) SELECT 10 AS \`it\` FROM x)`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
});
