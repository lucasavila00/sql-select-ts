import { dsql, table } from "../../src";
import { configureClickhouse } from "../utils";
import { addSimpleStringSerializer } from "../utils";
addSimpleStringSerializer();

describe("clickhouse replace", () => {
    const t3 = table(["x", "y"], "t3_clickhouse");
    const { run } = configureClickhouse();

    beforeAll(async () => {
        await run(`DROP TABLE IF EXISTS t3_clickhouse`);
        await run(
            `CREATE TABLE IF NOT EXISTS t3_clickhouse(x Int64, y Int64) ENGINE = AggregatingMergeTree() ORDER BY y`
        );
    });

    it("works", async () => {
        const q = t3
            .selectStar()
            .clickhouse.replace((f) => [["x", dsql`${f.y}+1`]])
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * REPLACE (\`y\`+1 AS \`x\`) FROM \`t3_clickhouse\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("works with safe strings", async () => {
        const q = t3
            .selectStar()
            .clickhouse.replace((f) => [["x", dsql`${f.y}+1`]])
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * REPLACE (\`y\`+1 AS \`x\`) FROM \`t3_clickhouse\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("works with number", async () => {
        const q = t3
            .selectStar()
            .clickhouse.replace((_f) => [["x", 1]])
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * REPLACE (1 AS \`x\`) FROM \`t3_clickhouse\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("checks column names", async () => {
        t3.selectStar()
            //@ts-expect-error
            .clickhouse.replace((f) => [["z", dsql`${f.w}+1`]]);
        expect(1).toBe(1);
    });
});
