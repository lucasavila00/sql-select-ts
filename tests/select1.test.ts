import { pipe } from "fp-ts/lib/function";
import sqlite from "sqlite3";
import {
    appendSelect,
    appendSelectStar,
    appendTable,
    fromTable,
    limit,
    orderBy,
    qToString,
    select,
    selectStar,
    where,
} from "../src/q";
import { SafeString, sql } from "../src/safe-string";

// mostly from https://github.com/sqlite/sqlite/blob/master/test/select1.test

describe("sqlite select1", () => {
    const fromTest1 = fromTable(["f1", "f2"], "test1");
    const fromTest1_dup = fromTable(["f1", "f2"], "test1_dup");
    const fromTest2 = fromTable(["r1", "r2"], "test2");
    const fromTest3 = fromTable(["r1", "r2"], "test3");

    const fromTest1And2 = pipe(
        //
        fromTest1,
        appendTable(fromTest2)
    );

    let db: sqlite.Database;
    let run: (query: string) => Promise<any[]>;
    let fail: (query: string) => Promise<string>;

    beforeAll(async () => {
        const it = sqlite.verbose();
        db = new it.Database(":memory:");

        run = (it: string) =>
            new Promise((rs, rj) => db.all(it, (e, r) => (e ? rj(e) : rs(r))));

        fail = (it: string) =>
            new Promise((rs, rj) =>
                db.all(it, (e, r) =>
                    e ? rs(String(e)) : rj(`Expected error, got ${r}`)
                )
            );

        await run(`CREATE TABLE test1(f1 int, f2 int)`);
        await run(`INSERT INTO test1(f1,f2) VALUES(11,22)`);

        await run(`CREATE TABLE test1_dup(f1 int, f2 int)`);
        await run(`INSERT INTO test1_dup(f1,f2) VALUES(11,22)`);

        await run(`CREATE TABLE test2(r1 real, r2 real)`);
        await run(`INSERT INTO test2(r1,r2) VALUES(1.1,2.2)`);

        await run(`CREATE TABLE test3(r1 real, r2 real)`);
        await run(`INSERT INTO test3(r1,r2) VALUES(1.1,2.2)`);
        await run(`INSERT INTO test3(r1,r2) VALUES(11.11,22.22)`);
    });

    it("select1-1.4", async () => {
        const q = pipe(
            fromTest1,
            select((f) => ({ f1: f.f1 })),
            qToString
        );

        expect(q).toMatchInlineSnapshot(`"SELECT f1 AS f1 FROM test1;"`);
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
              },
            ]
        `);
    });
    it("select1-1.4 -- ts check identifiers", async () => {
        const q = pipe(
            fromTest1,
            select((f) => ({
                f1:
                    //@ts-expect-error
                    f.f3,
            })),
            qToString
        );

        expect(q).toMatchInlineSnapshot(`"SELECT f3 AS f1 FROM test1;"`);
        expect(await fail(q)).toMatchInlineSnapshot(
            `"Error: SQLITE_ERROR: no such column: f3"`
        );
    });
    it("select1-1.4 -- destructuring", async () => {
        const q = pipe(
            fromTest1,
            select(({ f1 }) => ({ f1 })),
            qToString
        );

        expect(q).toMatchInlineSnapshot(`"SELECT f1 AS f1 FROM test1;"`);
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
              },
            ]
        `);
    });
    it("select1-1.7", async () => {
        const q = pipe(
            fromTest1,
            select((f) => ({ f1: f.f1, f2: f.f2 })),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT f1 AS f1, f2 AS f2 FROM test1;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
                "f2": 22,
              },
            ]
        `);
    });
    it("select1-1.7 -- destructuring", async () => {
        const q = pipe(
            fromTest1,
            select(({ f1, f2 }) => ({ f1, f2 })),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT f1 AS f1, f2 AS f2 FROM test1;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
                "f2": 22,
              },
            ]
        `);
    });
    it("select1-1.7 -- identity function", async () => {
        const q = pipe(
            fromTest1,
            select((it) => it),
            qToString
        );

        expect(q).toMatchInlineSnapshot(`"SELECT * FROM test1;"`);
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
                "f2": 22,
              },
            ]
        `);
    });
    it("select1-1.8", async () => {
        const q = pipe(
            //
            fromTest1,
            selectStar(),
            qToString
        );

        expect(q).toMatchInlineSnapshot(`"SELECT * FROM test1;"`);
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
                "f2": 22,
              },
            ]
        `);
    });
    it("select1-1.8 -- 2 layers", async () => {
        const q = pipe(
            //
            fromTest1,
            selectStar(),
            selectStar(),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM (SELECT * FROM test1);"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
                "f2": 22,
              },
            ]
        `);
    });
    it("select1-1.8.1", async () => {
        const q = pipe(
            //
            fromTest1,
            selectStar(),
            appendSelectStar(),
            qToString
        );

        expect(q).toMatchInlineSnapshot(`"SELECT *, * FROM test1;"`);
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
                "f2": 22,
              },
            ]
        `);
    });
    it("select1-1.8.2", async () => {
        const q = pipe(
            //
            fromTest1,
            selectStar(),
            appendSelect(({ f1, f2 }) => ({
                min: sql`min(${f1}, ${f2})`,
                max: sql`max(${f1}, ${f2})`,
            })),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT *, min(f1, f2) AS min, max(f1, f2) AS max FROM test1;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
                "f2": 22,
                "max": 22,
                "min": 11,
              },
            ]
        `);
    });
    it("select1-1.8.3", async () => {
        const q = pipe(
            //
            fromTest1,
            select((_f) => ({ one: sql("one") })),
            appendSelectStar(),
            appendSelect((_f) => ({ two: sql("two") })),
            appendSelectStar(),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT 'one' AS one, *, 'two' AS two, * FROM test1;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
                "f2": 22,
                "one": "one",
                "two": "two",
              },
            ]
        `);
    });
    it("select1-1.9", async () => {
        const q = pipe(
            //
            fromTest1And2,
            selectStar(),
            qToString
        );

        expect(q).toMatchInlineSnapshot(`"SELECT * FROM test1, test2;"`);
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
                "f2": 22,
                "r1": 1.1,
                "r2": 2.2,
              },
            ]
        `);
    });
    it("select1-1.9.1", async () => {
        const q = pipe(
            //
            fromTest1And2,
            selectStar(),
            appendSelect((_f) => ({ hi: sql("hi") })),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT *, 'hi' AS hi FROM test1, test2;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
                "f2": 22,
                "hi": "hi",
                "r1": 1.1,
                "r2": 2.2,
              },
            ]
        `);
    });
    it("select1-1.9.2", async () => {
        const q = pipe(
            //
            fromTest1And2,
            select((_f) => ({ one: sql("one") })),
            appendSelectStar(),
            appendSelect((_f) => ({ two: sql("two") })),
            appendSelectStar(),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT 'one' AS one, *, 'two' AS two, * FROM test1, test2;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
                "f2": 22,
                "one": "one",
                "r1": 1.1,
                "r2": 2.2,
                "two": "two",
              },
            ]
        `);
    });
    it("select1-1.10 -- no alias", async () => {
        const q = pipe(
            //
            fromTest1And2,
            select((f) => ({
                f1: f.f1,
                r1: f.r1,
            })),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT f1 AS f1, r1 AS r1 FROM test1, test2;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
                "r1": 1.1,
              },
            ]
        `);
    });
    it("select1-1.10 -- collision", async () => {
        const q = pipe(
            //
            fromTest1,
            appendTable(fromTest1_dup),
            select((f) => ({
                //@ts-expect-error
                f1: f.f1,
                //@ts-expect-error
                f2: f.f2,
            })),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT f1 AS f1, f2 AS f2 FROM test1, test1_dup;"`
        );
        expect(await fail(q)).toMatchInlineSnapshot(
            `"Error: SQLITE_ERROR: ambiguous column name: f1"`
        );
    });
    it("select1-1.10 -- collision fixed", async () => {
        const q = pipe(
            //
            fromTest1,
            appendTable(fromTest1_dup),
            select((f) => ({
                f1: f["test1.f1"],
                f2: f["test1_dup.f2"],
            })),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT test1.f1 AS f1, test1_dup.f2 AS f2 FROM test1, test1_dup;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
                "f2": 22,
              },
            ]
        `);
    });
    it("select1-1.10", async () => {
        const q = pipe(
            //
            fromTest1And2,
            select((f) => ({
                f1: f["test1.f1"],
                r1: f["test2.r1"],
            })),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT test1.f1 AS f1, test2.r1 AS r1 FROM test1, test2;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
                "r1": 1.1,
              },
            ]
        `);
    });
    it("select1-1.11.1", async () => {
        const q = pipe(
            //
            fromTest1And2,
            selectStar(),
            qToString
        );

        expect(q).toMatchInlineSnapshot(`"SELECT * FROM test1, test2;"`);
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
                "f2": 22,
                "r1": 1.1,
                "r2": 2.2,
              },
            ]
        `);
    });
    it("select1-1.11.2", async () => {
        const q = pipe(
            //
            fromTable(["f1", "f2"], "a", "test1"),
            appendTable(fromTable(["f1", "f2"], "b", "test1")),
            selectStar(),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM test1 AS a, test1 AS b;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
                "f2": 22,
              },
            ]
        `);
    });
    it("select1-1.11.2 -- select alias", async () => {
        const q = pipe(
            //
            fromTable(["f1", "f2"], "a", "test1"),
            appendTable(fromTable(["f1", "f2"], "b", "test1")),
            select((f) => ({
                f1: f["a.f1"],
                f2: f["b.f2"],
            })),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT a.f1 AS f1, b.f2 AS f2 FROM test1 AS a, test1 AS b;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
                "f2": 22,
              },
            ]
        `);
    });
    it("select1-1.12", async () => {
        const max = (...it: SafeString[]) => sql`max(${it})`;
        const min = (...it: SafeString[]) => sql`min(${it})`;
        const q = pipe(
            //
            fromTest1And2,
            select((f) => ({
                max: max(f["test1.f1"], f["test2.r1"]),
                min: min(f["test1.f2"], f["test2.r2"]),
            })),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT max(test1.f1, test2.r1) AS max, min(test1.f2, test2.r2) AS min FROM test1, test2;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "max": 11,
                "min": 2.2,
              },
            ]
        `);
    });
    it("select1-3.1", async () => {
        const q = pipe(
            //
            fromTest1,
            select(({ f1 }) => ({ f1 })),
            where(({ f1 }) => sql`${f1} < 11`),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT f1 AS f1 FROM test1 WHERE f1 < 11;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("select1-3.1 -- from selection", async () => {
        const q = pipe(
            //
            fromTest1,
            select(({ f1 }) => ({ f3: f1 })),
            where(({ f3 }) => sql`${f3} < 11`),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT f1 AS f3 FROM test1 WHERE f3 < 11;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("select1-3.1 -- warns of missing columns", async () => {
        const q = pipe(
            //
            fromTest1,
            select(({ f1 }) => ({ f3: f1 })),
            where(
                ({
                    //@ts-expect-error
                    f5,
                }) => sql`${f5} < 11`
            ),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT f1 AS f3 FROM test1 WHERE f5 < 11;"`
        );
        expect(await fail(q)).toMatchInlineSnapshot(
            `"Error: SQLITE_ERROR: no such column: f5"`
        );
    });
    it("select1-3.1 -- two calls", async () => {
        const q = pipe(
            //
            fromTest1,
            select(({ f1 }) => ({ f1 })),
            where(({ f1 }) => sql`${f1} < 11`),
            where(({ f2 }) => sql`${f2} > 0`),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT f1 AS f1 FROM test1 WHERE f1 < 11 AND f2 > 0;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("select1-3.1 -- return list", async () => {
        const q = pipe(
            //
            fromTest1,
            select(({ f1 }) => ({ f1 })),
            where(({ f1 }) => [sql`${f1} < 11`]),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT f1 AS f1 FROM test1 WHERE f1 < 11;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("select1-3.1 -- return list with 2 items", async () => {
        const q = pipe(
            //
            fromTest1,
            select(({ f1 }) => ({ f1 })),
            where(({ f1, f2 }) => [sql`${f1} < 11`, sql`${f2} > 0`]),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT f1 AS f1 FROM test1 WHERE f1 < 11 AND f2 > 0;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("select1-4.1", async () => {
        const q = pipe(
            //
            fromTest1,
            select(({ f1 }) => ({ f1 })),
            orderBy(({ f1 }) => f1),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT f1 AS f1 FROM test1 ORDER BY f1;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
              },
            ]
        `);
    });

    it("select1-4.1 -- two calls", async () => {
        const q = pipe(
            //
            fromTest1,
            select(({ f1 }) => ({ f1 })),
            orderBy(({ f1 }) => f1),
            orderBy(({ f2 }) => f2),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT f1 AS f1 FROM test1 ORDER BY f1, f2;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
              },
            ]
        `);
    });
    it("select1-4.1 -- array with 2 items", async () => {
        const q = pipe(
            //
            fromTest1,
            select(({ f1 }) => ({ f1 })),
            orderBy(({ f1, f2 }) => [f1, f2]),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT f1 AS f1 FROM test1 ORDER BY f1, f2;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
              },
            ]
        `);
    });

    it("select1-4.1 -- desc asc", async () => {
        const q = pipe(
            //
            fromTest1,
            select(({ f1 }) => ({ f1 })),
            orderBy(({ f1, f2 }) => [sql`${f1} ASC`, sql`${f2} DESC`]),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT f1 AS f1 FROM test1 ORDER BY f1 ASC, f2 DESC;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
              },
            ]
        `);
    });

    it("select1-4.1 -- from selection", async () => {
        const q = pipe(
            //
            fromTest1,
            select(({ f1 }) => ({ f3: f1 })),
            orderBy(({ f3 }) => f3),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT f1 AS f3 FROM test1 ORDER BY f3;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f3": 11,
              },
            ]
        `);
    });
    it("select1-6.1.3", async () => {
        const q = pipe(
            //
            fromTest1,
            selectStar(),
            where((f) => sql`${f.f1} == 11`),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM test1 WHERE f1 == 11;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
                "f2": 22,
              },
            ]
        `);
    });

    it("select1-6.1.4", async () => {
        const q = pipe(
            //
            fromTest1,
            selectStar(true),
            where((f) => sql`${f.f1} == 11`),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT DISTINCT * FROM test1 WHERE f1 == 11;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
                "f2": 22,
              },
            ]
        `);
    });

    it("select1-6.3.1", async () => {
        const q = pipe(
            //
            fromTest1,
            select((f) => ({ ["xyzzy "]: f.f1 })),
            orderBy((f) => f.f2),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT f1 AS 'xyzzy ' FROM test1 ORDER BY f2;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "xyzzy ": 11,
              },
            ]
        `);
    });

    it("select1-6.5", async () => {
        const q = pipe(
            //
            fromTest1,
            select((f) => ({ it: sql`${f["test1.f1"]} + ${f.f2}` })),
            orderBy((f) => f.f2),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT test1.f1 + f2 AS it FROM test1 ORDER BY f2;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "it": 33,
              },
            ]
        `);
    });

    it("select1-6.6", async () => {
        const q = pipe(
            //
            fromTest1And2,
            select((f) => ({ it: sql`${f["test1.f1"]} + ${f.f2}`, r2: f.r2 })),
            orderBy((f) => f.f2),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT test1.f1 + f2 AS it, r2 AS r2 FROM test1, test2 ORDER BY f2;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "it": 33,
                "r2": 2.2,
              },
            ]
        `);
    });

    it("select1-6.7", async () => {
        const q = pipe(
            //
            fromTable(["f1", "f2"], "a", "test1"),
            appendTable(fromTable(["r1", "r2"], "test2")),
            select((f) => ({ it: f["a.f1"], r2: f.r2 })),
            orderBy((f) => f.f2),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT a.f1 AS it, r2 AS r2 FROM test1 AS a, test2 ORDER BY f2;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "it": 11,
                "r2": 2.2,
              },
            ]
        `);
    });
    it("select1-6.9.1", async () => {
        const q = pipe(
            //
            fromTable(["f1", "f2"], "a", "test1"),
            appendTable(fromTable(["r1", "r2"], "b", "test2")),
            select((f) => ({ it: f["a.f1"], r2: f["b.r2"] })),
            orderBy((f) => f["a.f1"]),
            orderBy((f) => f["b.r2"]),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT a.f1 AS it, b.r2 AS r2 FROM test1 AS a, test2 AS b ORDER BY a.f1, b.r2;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "it": 11,
                "r2": 2.2,
              },
            ]
        `);
    });
    it("select1-6.9.6", async () => {
        const q = pipe(
            //
            fromTable(["f1", "f2"], "a", "test1"),
            appendTable(fromTable(["r1", "r2"], "b", "test3")),
            selectStar(),
            limit(1),
            qToString
        );

        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM test1 AS a, test3 AS b LIMIT 1;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
                "f2": 22,
                "r1": 1.1,
                "r2": 2.2,
              },
            ]
        `);
    });

    // limit
    //
    // 1-6.9.7~8
    // 1-6.9.9

    // wrap
    // select1-15.3

    // IN compound
    // select1-6.21

    // subquery
    // select1-9.3
    // select1-9.4
    // select1-9.5
    // select1-12.8

    // sub query as table
    // select1-11.12
    // select1-11.13
    // select1-11.14
    // select1-11.15
    // select1-11.16
    // select1-17.2
    // select1-17.3

    // compound && subquery
    // select1-12.9
    // select1-12.10

    // nested where
    // select1-18.3
    // select1-18.4

    // from nothing
    // select1-12.1
    // select1-12.2
    // select1-12.3
    // select1-12.4

    // union
    // select1-6.10
    // select1-6.11
    // select1-12.5
    // select1-12.6
});
