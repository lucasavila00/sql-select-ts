import { fromNothing, table } from "../../src";
import { sql } from "../../src/safe-string";
import { configureSqlite } from "../utils";

// mostly from https://github.com/sqlite/sqlite/blob/master/test/with1.test

describe("sqlite with", () => {
    const t0 = table(["x", "y"], "t0");

    const { run } = configureSqlite();

    beforeAll(async () => {
        await run(`CREATE TABLE t0(x INTEGER, y INTEGER)`);
    });

    it("with1-1.0", async () => {
        t0.selectStar();

        const q = fromNothing({ it: sql(10) }).print();
        expect(q).toMatchInlineSnapshot(`"SELECT 10 AS it;"`);
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "it": 10,
              },
            ]
        `);
    });
});
