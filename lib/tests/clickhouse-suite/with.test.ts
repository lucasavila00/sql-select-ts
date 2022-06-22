import { fromNothing } from "../../src";
import { sql } from "../../src/safe-string";
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

describe("clickhouse with", () => {
    beforeAll(async () => {
        await run(
            `CREATE TABLE IF NOT EXISTS t0(x Int64, y Int64) ENGINE = Memory;`
        );
    });

    it("from nothing", async () => {
        const q = fromNothing({ it: sql(10) })
            .clickhouse.with_({
                wont_use: fromNothing({ it: sql(20) }),
            })
            .print();
        expect(q).toMatchInlineSnapshot(
            `"WITH (SELECT 20 AS it) AS wont_use SELECT 10 AS it"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Array [
                10,
              ],
            ]
        `);
    });
    it("use it in selection", async () => {
        const q = fromNothing({})
            .clickhouse.with_({
                abc: fromNothing({ n: sql(20) }),
            })
            .appendSelect((f) => ({ it: f.abc }))
            .print();
        expect(q).toMatchInlineSnapshot(
            `"WITH (SELECT 20 AS n) AS abc SELECT abc AS it"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Array [
                20,
              ],
            ]
        `);
    });
});
