import { table } from "../../src";
import ClickHouse from "@apla/clickhouse";

const ch = new ClickHouse({
    host: "localhost",
    port: 8124,
    user: "default",
    password: "",
});

export const run = async (it: string): Promise<any[]> => {
    const result = await ch.querying(it);
    return result.data;
};

describe("clickhouse prewhere", () => {
    const t1 = table(["x", "y"], "t2_clickhouse");

    beforeAll(async () => {
        await run(`DROP TABLE IF EXISTS t2_clickhouse`);
        await run(
            `CREATE TABLE IF NOT EXISTS t2_clickhouse(x UInt8, y UInt8) ENGINE = AggregatingMergeTree() ORDER BY y`
        );
    });

    it("1 call", async () => {
        const q = t1
            .selectStar()
            .clickhouse.prewhere((f) => f.x)
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM t2_clickhouse PREWHERE x"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("1 call -- from selection", async () => {
        const q = t1
            .select((f) => ({ cond: f.y }))
            .clickhouse.prewhere((f) => f.cond)
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT y AS cond FROM t2_clickhouse PREWHERE cond"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("2 calls", async () => {
        const q = t1
            .selectStar()
            .clickhouse.prewhere((f) => f.x)
            .clickhouse.prewhere((f) => f.y)
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM t2_clickhouse PREWHERE x AND y"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("2 items, 1 call", async () => {
        const q = t1
            .selectStar()
            .clickhouse.prewhere((f) => [f.x, f.y])
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM t2_clickhouse PREWHERE x AND y"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("with regular where", async () => {
        const q = t1
            .selectStar()
            .clickhouse.prewhere((f) => f.x)
            .where((f) => f.y)
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM t2_clickhouse PREWHERE x WHERE y"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
});
