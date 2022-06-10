import { SafeString, sql, table } from "../src";
import { configureSqlite } from "./utils";

// mostly from https://github.com/sqlite/sqlite/blob/master/test/join.test
const equals = (a: SafeString, b: SafeString) => sql`${a} = ${b}`;

describe("join", () => {
    const t1 = table(["a", "b", "c"], "t1");
    const t2 = table(["b", "c", "d"], "t2");

    const { run, fail } = configureSqlite();

    beforeAll(async () => {
        await run(`CREATE TABLE t1(a,b,c);`);
        await run(`INSERT INTO t1 VALUES(1,2,3);`);
        await run(`INSERT INTO t1 VALUES(2,3,4);`);
        await run(`INSERT INTO t1 VALUES(3,4,5);`);

        await run(`CREATE TABLE t2(b,c,d);`);
        await run(`INSERT INTO t2 VALUES(1,2,3);`);
        await run(`INSERT INTO t2 VALUES(2,3,4);`);
        await run(`INSERT INTO t2 VALUES(3,4,5);`);
    });

    it("table -> table", async () => {
        const q = t1.joinTable("NATURAL", t2).selectStar().print();
        expect(q).toMatchInlineSnapshot(`"SELECT * FROM t1 NATURAL JOIN t2;"`);
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "a": 1,
                "b": 2,
                "c": 3,
                "d": 4,
              },
              Object {
                "a": 2,
                "b": 3,
                "c": 4,
                "d": 5,
              },
            ]
        `);
    });

    it("table -> table -- ON", async () => {
        const q = t1
            .joinTable("LEFT", t2, (f) => equals(f.a, f.d))
            .selectStar()
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM t1 LEFT JOIN t2 ON a = d;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "a": 1,
                "b": null,
                "c": null,
                "d": null,
              },
              Object {
                "a": 2,
                "b": null,
                "c": null,
                "d": null,
              },
              Object {
                "a": 3,
                "b": 1,
                "c": 2,
                "d": 3,
              },
            ]
        `);
    });
});
