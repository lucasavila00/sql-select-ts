import { SafeString, sql, table } from "../src";
import { configureSqlite } from "./utils";

// mostly from https://github.com/sqlite/sqlite/blob/master/test/join.test
const equals = (a: SafeString, b: SafeString) => sql`${a} = ${b}`;

describe("sqlite join", () => {
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

    it("join-1.3", async () => {
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

    it("join-1.3.2", async () => {
        const q = table(["a", "b", "c"], "x", "t1")
            .joinTable("NATURAL", t2)
            .selectStar()
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM t1 AS x NATURAL JOIN t2;"`
        );
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

    it("join-1.3.3", async () => {
        const q = t1
            .joinTable("NATURAL", table(["b", "c", "d"], "y", "t2"))
            .selectStar()
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM t1 NATURAL JOIN t2 AS y;"`
        );
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

    // It's valid but we can't type it.
    // it("join-1.3.4", async () => {
    //     const q = t1
    //         .joinTable("NATURAL", t2)
    //         .select((f) => ({ b: f.b }))
    //         .print();
    //     expect(q).toMatchInlineSnapshot(
    //         `"SELECT b AS b FROM t1 NATURAL JOIN t2;"`
    //     );
    //     expect(await run(q)).toMatchInlineSnapshot(`
    //         Array [
    //           Object {
    //             "b": 2,
    //           },
    //           Object {
    //             "b": 3,
    //           },
    //         ]
    //     `);
    // });

    it("join-1.3.5", async () => {
        const q = t2
            .joinTable("NATURAL", t1)
            .selectStarOfAliases(["t2"])
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT t2.* FROM t2 NATURAL JOIN t1;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "b": 2,
                "c": 3,
                "d": 4,
              },
              Object {
                "b": 3,
                "c": 4,
                "d": 5,
              },
            ]
        `);
    });
    it("join-1.3.6", async () => {
        const q = table(["b", "c", "d"], "xyzzy", "t2")
            .joinTable("NATURAL", t1)
            .selectStarOfAliases(["xyzzy"])
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT xyzzy.* FROM t2 AS xyzzy NATURAL JOIN t1;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "b": 2,
                "c": 3,
                "d": 4,
              },
              Object {
                "b": 3,
                "c": 4,
                "d": 5,
              },
            ]
        `);
    });

    it("join-1.3.7", async () => {
        const q = t2
            .joinTable("NATURAL", t1)
            .selectStarOfAliases(["t1"])
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT t1.* FROM t2 NATURAL JOIN t1;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "a": 1,
                "b": 2,
                "c": 3,
              },
              Object {
                "a": 2,
                "b": 3,
                "c": 4,
              },
            ]
        `);
    });

    it("join-1.3.8", async () => {
        const q = t2
            .joinTable("NATURAL", table(["a", "b", "c"], "xyzzy", "t1"))
            .selectStarOfAliases(["xyzzy"])
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT xyzzy.* FROM t2 NATURAL JOIN t1 AS xyzzy;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "a": 1,
                "b": 2,
                "c": 3,
              },
              Object {
                "a": 2,
                "b": 3,
                "c": 4,
              },
            ]
        `);
    });

    it("join-1.3.9", async () => {
        const q = table(["b", "c", "d"], "aaa", "t2")
            .joinTable("NATURAL", table(["a", "b", "c"], "bbb", "t1"))
            .selectStarOfAliases(["aaa", "bbb"])
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT aaa.*, bbb.* FROM t2 AS aaa NATURAL JOIN t1 AS bbb;"`
        );
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

    it("join-1.3.10", async () => {
        const q = t2
            .joinTable("NATURAL", t1)
            .selectStarOfAliases(["t1", "t2"])
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT t1.*, t2.* FROM t2 NATURAL JOIN t1;"`
        );
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
    it("join-1.4.1", async () => {
        const q = t2
            .joinTable("INNER", t1, (f) => [
                equals(f["t1.b"], f["t2.b"]),
                equals(f["t1.c"], f["t2.c"]),
            ])
            .selectStar()
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM t2 INNER JOIN t1 ON t1.b = t2.b AND t1.c = t2.c;"`
        );
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
    it("join-1.4.1 -- prevents ambiguous", async () => {
        const q = t2
            .joinTable("INNER", t1, (f) => [
                // @ts-expect-error
                equals(f.b, f["t2.b"]),
                equals(f["t1.c"], f["t2.c"]),
            ])
            .selectStar()
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM t2 INNER JOIN t1 ON b = t2.b AND t1.c = t2.c;"`
        );
        expect(await fail(q)).toMatchInlineSnapshot(
            `"Error: SQLITE_ERROR: ambiguous column name: b"`
        );
    });

    it("join-1.4.2", async () => {
        const q = t2
            .joinTable("INNER", table(["a", "b", "c"], "x", "t1"), (f) => [
                equals(f["x.b"], f["t2.b"]),
                equals(f["x.c"], f["t2.c"]),
            ])
            .selectStar()
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM t2 INNER JOIN t1 AS x ON x.b = t2.b AND x.c = t2.c;"`
        );
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
    it("join-1.4.3", async () => {
        const q = table(["b", "c", "d"], "y", "t2")
            .joinTable("INNER", t1, (f) => [
                equals(f["t1.b"], f["y.b"]),
                equals(f["t1.c"], f["y.c"]),
            ])
            .selectStar()
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM t2 AS y INNER JOIN t1 ON t1.b = y.b AND t1.c = y.c;"`
        );
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
    it("join-1.4.4", async () => {
        const q = table(["b", "c", "d"], "y", "t2")
            .joinTable("INNER", table(["a", "b", "c"], "x", "t1"), (f) => [
                equals(f["x.b"], f["y.b"]),
                equals(f["x.c"], f["y.c"]),
            ])
            .selectStar()
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM t2 AS y INNER JOIN t1 AS x ON x.b = y.b AND x.c = y.c;"`
        );
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
    it("join-1.4.5", async () => {
        const q = t2
            .joinTable("INNER", t1, (f) => [equals(f["t1.b"], f["t2.b"])])
            .select((f) => ({
                b:
                    // @ts-expect-error
                    f.b,
            }))
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT b AS b FROM t2 INNER JOIN t1 ON t1.b = t2.b;"`
        );
        expect(await fail(q)).toMatchInlineSnapshot(
            `"Error: SQLITE_ERROR: ambiguous column name: b"`
        );
    });
});
