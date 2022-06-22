import { table } from "../../src";
import { configureSqlite } from "../utils";

describe("sqlite having", () => {
    const t0 = table(["x", "y"], "t0");

    const { run } = configureSqlite();

    beforeAll(async () => {
        await run(`CREATE TABLE t0(x INTEGER, y INTEGER)`);
    });

    it("1 call -- from select", async () => {
        const q = t0
            .select((f) => ({ it: f.x }))
            .groupBy((f) => f.y)
            .having((f) => f.y)
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT x AS it FROM t0 GROUP BY y HAVING y"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("1 call", async () => {
        const q = t0
            .selectStar()
            .groupBy((f) => f.x)
            .having((f) => f.x)
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM t0 GROUP BY x HAVING x"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("2 calls", async () => {
        const q = t0
            .selectStar()
            .groupBy((f) => f.x)
            .having((f) => f.x)
            .groupBy((f) => f.y)
            .having((f) => f.y)
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM t0 GROUP BY x, y HAVING x AND y"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("2 items, 1 call", async () => {
        const q = t0
            .selectStar()
            .groupBy((f) => [f.x, f.y])
            .having((f) => [f.x, f.y])
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM t0 GROUP BY x, y HAVING x AND y"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
});
