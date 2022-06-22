import { table } from "../../src";
import { configureSqlite } from "../utils";

describe("sqlite order by", () => {
    const t0 = table(["x", "y"], "t0");

    const { run } = configureSqlite();

    beforeAll(async () => {
        await run(`CREATE TABLE t0(x INTEGER, y INTEGER)`);
    });

    it("1 call", async () => {
        const q = t0
            .selectStar()
            .orderBy((f) => f.x)
            .print();

        expect(q).toMatchInlineSnapshot(`"SELECT * FROM t0 ORDER BY x"`);
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("1 call -- from select", async () => {
        const q = t0
            .select((f) => ({ it: f.y }))
            .orderBy((f) => f.x)
            .print();

        expect(q).toMatchInlineSnapshot(`"SELECT y AS it FROM t0 ORDER BY x"`);
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("2 calls", async () => {
        const q = t0
            .selectStar()
            .orderBy((f) => f.x)
            .orderBy((f) => f.y)
            .print();

        expect(q).toMatchInlineSnapshot(`"SELECT * FROM t0 ORDER BY x, y"`);
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("2 items, one call", async () => {
        const q = t0
            .selectStar()
            .orderBy((f) => [f.x, f.y])
            .print();

        expect(q).toMatchInlineSnapshot(`"SELECT * FROM t0 ORDER BY x, y"`);
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
});
