import { table } from "../../src";
import { addSimpleStringSerializer } from "../utils";
addSimpleStringSerializer();

describe("clickhouse replace", () => {
    const t3 = table(["x", "y"], "t3_clickhouse");

    it("works with 1 item", async () => {
        const q = t3
            .selectStar()
            .clickhouse.except((f) => [f.x])
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * EXCEPT (\`x\`) FROM \`t3_clickhouse\``
        );
    });
    it("works with 2 items", async () => {
        const q = t3
            .selectStar()
            .clickhouse.except((f) => [f.x, f.y])
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * EXCEPT (\`x\`, \`y\`) FROM \`t3_clickhouse\``
        );
    });

    it("checks column names", async () => {
        t3.selectStar()
            //@ts-expect-error
            .clickhouse.except((f) => [f.x123]);
        expect(1).toBe(1);
    });
});
