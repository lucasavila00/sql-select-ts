import { sql, table } from "../../src";
import { configureClickhouse } from "../utils";

describe("clickhouse replace", () => {
    const t1 = table(["x", "y"], "t1_clickhouse");
    const { run } = configureClickhouse();

    beforeAll(async () => {
        await run(`DROP TABLE IF EXISTS t1_clickhouse`);
        await run(
            `CREATE TABLE IF NOT EXISTS t1_clickhouse(x Int64, y Int64) ENGINE = AggregatingMergeTree() ORDER BY y`
        );
    });

    it("it works", async () => {
        const q = t1
            .selectStar()
            .clickhouse.replace((f) => [["x", sql`${f.y}+1`]])
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * REPLACE (y+1 AS x) FROM t1_clickhouse"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("it works with safe strings", async () => {
        const q = t1
            .selectStar()
            .clickhouse.replace((f) => [["x", sql`${f.y}+1`]])
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * REPLACE (y+1 AS x) FROM t1_clickhouse"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("it works with number", async () => {
        const q = t1
            .selectStar()
            .clickhouse.replace((_f) => [["x", 1]])
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * REPLACE (1 AS x) FROM t1_clickhouse"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("checks column names", async () => {
        t1.selectStar()
            //@ts-expect-error
            .clickhouse.replace((f) => [["z", sql`${f.y}+1`]]);
    });
});
