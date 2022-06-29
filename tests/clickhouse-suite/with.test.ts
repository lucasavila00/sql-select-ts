import { fromNothing, table } from "../../src";
import { sql } from "../../src/safe-string";
import { configureClickhouse } from "../utils";
import { addSimpleStringSerializer } from "../utils";
addSimpleStringSerializer();

describe("clickhouse with", () => {
    const t0 = table(["x", "y"], "t0_clickhouse");
    const { run } = configureClickhouse();

    beforeAll(async () => {
        await run(`DROP TABLE IF EXISTS t0_clickhouse`);
        await run(
            `CREATE TABLE IF NOT EXISTS t0_clickhouse(x Int64, y Int64) ENGINE = Memory`
        );
    });

    it("from nothing", async () => {
        const q = fromNothing({ it: sql(10) })
            .clickhouse.with_({
                wont_use: fromNothing({ it: sql(20) }),
            })
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `WITH (SELECT 20 AS \`it\`) AS \`wont_use\` SELECT 10 AS \`it\``
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
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `WITH (SELECT 20 AS \`n\`) AS \`abc\` SELECT abc AS \`it\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Array [
                20,
              ],
            ]
        `);
    });

    it("works with table", async () => {
        const q = t0
            .selectStar()
            .clickhouse.with_({
                abc: fromNothing({ n: sql(20) }),
            })
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `WITH (SELECT 20 AS \`n\`) AS \`abc\` SELECT * FROM \`t0_clickhouse\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
});
