import { table } from "../../src";
import { configureClickhouse } from "../utils";
import { addSimpleStringSerializer } from "../utils";
addSimpleStringSerializer();

describe("clickhouse final", () => {
    const t1 = table(["x", "y"], "t11_clickhouse").clickhouse.final();
    const { run } = configureClickhouse();

    beforeAll(async () => {
        await run(`DROP TABLE IF EXISTS t11_clickhouse`);
        await run(
            `CREATE TABLE IF NOT EXISTS t11_clickhouse(x Int64, y Int64) ENGINE = AggregatingMergeTree() ORDER BY y`
        );
    });

    it("no alias", async () => {
        const q = t1
            .selectStar()
            .groupBy((f) => [f.x, f.y])
            .clickhouse.withRollup()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t11_clickhouse\` FINAL GROUP BY \`x\`, \`y\` WITH ROLLUP`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
});
