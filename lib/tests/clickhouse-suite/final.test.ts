import { table } from "../../src";
import { configureClickhouse } from "../utils";

describe("clickhouse final", () => {
    const t1 = table(["x", "y"], "t1_clickhouse").clickhouse.final();
    const t1c = table(["x", "y"], "t1c", "t1_clickhouse").clickhouse.final();
    const { run } = configureClickhouse();

    beforeAll(async () => {
        await run(`DROP TABLE IF EXISTS t1_clickhouse`);
        await run(
            `CREATE TABLE IF NOT EXISTS t1_clickhouse(x Int64, y Int64) ENGINE = AggregatingMergeTree() ORDER BY y`
        );
    });

    it("no alias", async () => {
        const q = t1.selectStar().print();
        expect(q).toMatchInlineSnapshot(`"SELECT * FROM t1_clickhouse FINAL"`);
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("no alias -- select", async () => {
        const q = t1
            .select((f) => ({ it: f.x, y: f["t1_clickhouse.y"] }))
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT x AS it, t1_clickhouse.y AS y FROM t1_clickhouse FINAL"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("with alias", async () => {
        const q = t1c.selectStar().print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM t1_clickhouse AS t1c FINAL"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("with alias -- select", async () => {
        const q = t1c.select((f) => ({ it: f.x, y: f["t1c.y"] })).print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT x AS it, t1c.y AS y FROM t1_clickhouse AS t1c FINAL"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
});
