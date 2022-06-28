import { table } from "../../src";
import { configureSqlite } from "../utils";

describe("sqlite group by", () => {
    const t0 = table(["x", "y"], "t0");

    const { run } = configureSqlite();

    beforeAll(async () => {
        await run(`CREATE TABLE t0(x INTEGER, y INTEGER)`);
    });

    it("1 call", async () => {
        const q = t0
            .selectStar()
            .groupBy((f) => f.x)
            .stringify();

        expect(q).toMatchInlineSnapshot(`"SELECT * FROM t0 GROUP BY x"`);
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("1 call -- from select", async () => {
        const q = t0
            .select((f) => ({ it: f.y }))
            .groupBy((f) => f.x)
            .stringify();

        expect(q).toMatchInlineSnapshot(`"SELECT y AS it FROM t0 GROUP BY x"`);
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("2 calls", async () => {
        const q = t0
            .selectStar()
            .groupBy((f) => f.x)
            .groupBy((f) => f.y)
            .stringify();

        expect(q).toMatchInlineSnapshot(`"SELECT * FROM t0 GROUP BY x, y"`);
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("2 items, one call", async () => {
        const q = t0
            .selectStar()
            .groupBy((f) => [f.x, f.y])
            .stringify();

        expect(q).toMatchInlineSnapshot(`"SELECT * FROM t0 GROUP BY x, y"`);
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
});
