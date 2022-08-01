import { table, with_, select } from "../../src";
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

    it("type checks", async () => {
        with_(t0.selectStar().as("t0_alias"))
            .do((acc) =>
                select(
                    (f) => ({
                        //@ts-expect-error
                        it: f.abc,
                    }),
                    acc.t0_alias
                )
            )
            .stringify();
        try {
            with_(t0.selectStar().as("t0_alias"))
                //@ts-expect-error
                .do((acc) => select((_f) => ({ it: sql(10) }), acc.t5_alias))
                .stringify();

            with_(t0.selectStar().as("t0_alias"))
                .with_(
                    //@ts-expect-error
                    (acc) => acc.abc.selectStar().as("t1_alias")
                )
                .do((acc) => select((_f) => ({ it: sql(10) }), acc.t0_alias))
                .stringify();
        } catch (e) {
            //
        }
        expect(1).toBe(1);
    });

    it("basic", async () => {
        const q = with_(t0.selectStar().as("t0_alias"))
            .do((acc) => select((_f) => ({ it: sql(10) }), acc.t0_alias))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `WITH \`t0_alias\` AS (SELECT * FROM \`t15_clickhouse\`) SELECT 10 AS \`it\` FROM \`t0_alias\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("1 with call", async () => {
        const q = with_(t0.selectStar().as("t0_alias"))
            .do((acc) => select((_f) => ({ it: sql(10) }), acc.t0_alias))

            .appendSelect((f) => ({ it2: f.t0_alias.x }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `WITH \`t0_alias\` AS (SELECT * FROM \`t15_clickhouse\`) SELECT 10 AS \`it\`, \`t0_alias\`.\`x\` AS \`it2\` FROM \`t0_alias\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("2 with calls", async () => {
        const q = with_(t0.selectStar().as("t0_alias"))
            .with_(() => t0.selectStar().as("t1_alias"))
            .do((acc) => select((_f) => ({ it: sql(10) }), acc.t1_alias))
            .appendSelect((f) => ({ it2: f.t1_alias.y }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `WITH \`t0_alias\` AS (SELECT * FROM \`t15_clickhouse\`), \`t1_alias\` AS (SELECT * FROM \`t15_clickhouse\`) SELECT 10 AS \`it\`, \`t1_alias\`.\`y\` AS \`it2\` FROM \`t1_alias\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("with1-1.0", async () => {
        const q = with_(t0.selectStar().as("x"))
            .do((acc) => select((_f) => ({ it: sql(10) }), acc.x))
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `WITH \`x\` AS (SELECT * FROM \`t15_clickhouse\`) SELECT 10 AS \`it\` FROM \`x\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("with1-1.0 -- no columns2", async () => {
        const q = with_(t0.selectStar().as("x"))
            .do((acc) => select((_f) => ({ it: sql(10) }), acc.x))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `WITH \`x\` AS (SELECT * FROM \`t15_clickhouse\`) SELECT 10 AS \`it\` FROM \`x\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("with1-1.0 -- use alias", async () => {
        const q = with_(t0.selectStar().as("x"))
            .do((acc) => select((f) => ({ it: f.y }), acc.x))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `WITH \`x\` AS (SELECT * FROM \`t15_clickhouse\`) SELECT \`y\` AS \`it\` FROM \`x\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("with1-1.0 -- use alias2", async () => {
        const q = with_(t0.selectStar().as("x"))
            .do((acc) => select((f) => ({ it: f.x.x }), acc.x))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `WITH \`x\` AS (SELECT * FROM \`t15_clickhouse\`) SELECT \`x\`.\`x\` AS \`it\` FROM \`x\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("with1-1.1", async () => {
        const q = with_(t0.selectStar().as("x"))
            .do((acc) => select((_f) => ({ it: sql(10) }), acc.x))
            .selectStar()
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (WITH \`x\` AS (SELECT * FROM \`t15_clickhouse\`) SELECT 10 AS \`it\` FROM \`x\`)`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
});
