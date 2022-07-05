import { table, with_ } from "../../src";
import { dsql as sql } from "../../src/safe-string";
import { configureClickhouse } from "../utils";
import { addSimpleStringSerializer } from "../utils";
addSimpleStringSerializer();

// mostly from https://github.com/sqlite/sqlite/blob/master/test/with1.test

describe("clickhouse cte", () => {
    const t0 = table(["x", "y"], "t15_clickhouse");

    const { run } = configureClickhouse();
    beforeAll(async () => {
        await run(`DROP TABLE IF EXISTS t15_clickhouse`);
        await run(
            `CREATE TABLE IF NOT EXISTS t15_clickhouse(x Int64, y Int64) ENGINE = AggregatingMergeTree() ORDER BY y`
        );
    });
    it("basic", async () => {
        const q = with_(
            //
            t0.selectStar(),
            "t0_alias"
        )
            .selectThis((_f) => ({ it: sql(10) }), "t0_alias")
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `WITH \`t0_alias\` AS (SELECT * FROM \`t15_clickhouse\`) SELECT 10 AS \`it\` FROM \`t0_alias\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("1 with call", async () => {
        const q = with_(
            //
            t0.selectStar(),
            "t0_alias"
        )
            .selectThis((_f) => ({ it: sql(10) }), "t0_alias")
            .appendSelect((f) => ({ it2: f["t0_alias.x"] }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `WITH \`t0_alias\` AS (SELECT * FROM \`t15_clickhouse\`) SELECT 10 AS \`it\`, \`t0_alias\`.\`x\` AS \`it2\` FROM \`t0_alias\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("2 with calls", async () => {
        const q = with_(
            //
            t0.selectStar(),
            "t0_alias"
        )
            .with_(
                //
                () => t0.selectStar(),
                "t1_alias"
            )
            .selectThis((_f) => ({ it: sql(10) }), "t1_alias")
            .appendSelect((f) => ({ it2: f["t1_alias.y"] }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `WITH \`t0_alias\` AS (SELECT * FROM \`t15_clickhouse\`), \`t1_alias\` AS (SELECT * FROM \`t15_clickhouse\`) SELECT 10 AS \`it\`, \`t1_alias\`.\`y\` AS \`it2\` FROM \`t1_alias\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("with1-1.0", async () => {
        const q = with_(
            //
            t0.selectStar(),
            "x"
        )
            .selectThis((_f) => ({ it: sql(10) }), "x")
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `WITH \`x\` AS (SELECT * FROM \`t15_clickhouse\`) SELECT 10 AS \`it\` FROM \`x\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("with1-1.0 -- no columns2", async () => {
        const q = with_(
            //
            t0.selectStar(),
            "x"
        )
            .selectThis((_f) => ({ it: sql(10) }), "x")
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `WITH \`x\` AS (SELECT * FROM \`t15_clickhouse\`) SELECT 10 AS \`it\` FROM \`x\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("with1-1.0 -- use alias", async () => {
        const q = with_(
            //
            t0.selectStar(),
            "x"
        )
            .selectThis((f) => ({ it: f.y }), "x")
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `WITH \`x\` AS (SELECT * FROM \`t15_clickhouse\`) SELECT \`y\` AS \`it\` FROM \`x\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("with1-1.0 -- use alias2", async () => {
        const q = with_(
            //
            t0.selectStar(),
            "x"
        )
            .selectThis((f) => ({ it: f["x.x"] }), "x")
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `WITH \`x\` AS (SELECT * FROM \`t15_clickhouse\`) SELECT \`x\`.\`x\` AS \`it\` FROM \`x\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("with1-1.1", async () => {
        const q = with_(
            //
            t0.selectStar(),
            "x"
        )
            .selectThis((_f) => ({ it: sql(10) }), "x")
            .selectStar()
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (WITH \`x\` AS (SELECT * FROM \`t15_clickhouse\`) SELECT 10 AS \`it\` FROM \`x\`)`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
});
