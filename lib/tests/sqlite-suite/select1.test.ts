import {
    fromNothing,
    table,
    SafeString,
    sql,
    union,
    unionAll,
} from "../../src";
import { configureSqlite } from "../utils";

// mostly from https://github.com/sqlite/sqlite/blob/master/test/select1.test

const max = (...it: SafeString[]) => sql`max(${it})`;
const min = (...it: SafeString[]) => sql`min(${it})`;
describe("sqlite select1", () => {
    const test1 = table(["f1", "f2"], "test1");

    const test1_dup = table(["f1", "f2"], "test1_dup");
    const test2 = table(["r1", "r2"], "test2");
    const t6 = table(["a", "b"], "t6");

    const fromTest1And2 = test1.commaJoinTable(test2);
    const { run, fail } = configureSqlite();

    beforeAll(async () => {
        await run(`CREATE TABLE test1(f1 int, f2 int)`);
        await run(`INSERT INTO test1(f1,f2) VALUES(11,22)`);

        await run(`CREATE TABLE test1_dup(f1 int, f2 int)`);
        await run(`INSERT INTO test1_dup(f1,f2) VALUES(11,22)`);

        await run(`CREATE TABLE test2(r1 real, r2 real)`);
        await run(`INSERT INTO test2(r1,r2) VALUES(1.1,2.2)`);

        await run(`CREATE TABLE test3(r1 real, r2 real)`);
        await run(`INSERT INTO test3(r1,r2) VALUES(1.1,2.2)`);
        await run(`INSERT INTO test3(r1,r2) VALUES(11.11,22.22)`);

        await run(`CREATE TABLE t6(a TEXT, b TEXT);`);
        await run(`INSERT INTO t6 VALUES('a','0');`);
        await run(`INSERT INTO t6 VALUES('b','1');`);
        await run(`INSERT INTO t6 VALUES('c','2');`);
        await run(`INSERT INTO t6 VALUES('d','3');`);
    });

    it("select1-1.4", async () => {
        const q = test1.select((f) => ({ f1: f.f1 })).print();

        expect(q).toMatchInlineSnapshot(`"SELECT f1 AS f1 FROM test1;"`);
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
              },
            ]
        `);
    });

    it("select1-1.4 -- append", async () => {
        const q = test1
            .select((f) => ({ f1: f.f1 }))
            .appendSelect((f) => ({ f2: f.f2 }))
            .print();

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

    it("select1-1.4 -- select from alias", async () => {
        const q = test1.select((f) => ({ f1: f["test1.f1"] })).print();

        expect(q).toMatchInlineSnapshot(`"SELECT test1.f1 AS f1 FROM test1;"`);
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
              },
            ]
        `);
    });

    it("select1-1.4 -- append from alias", async () => {
        const q = test1
            .select((f) => ({ f1: f["test1.f1"] }))
            .appendSelect((f) => ({ f2: f["test1.f2"] }))
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT test1.f1 AS f1, test1.f2 AS f2 FROM test1;"`
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

    it("select1-1.4 -- ts check identifiers", async () => {
        const q = test1
            .select((f) => ({
                f1:
                    //@ts-expect-error
                    f.f3,
            }))
            .print();

        expect(q).toMatchInlineSnapshot(`"SELECT f3 AS f1 FROM test1;"`);
        expect(await fail(q)).toMatchInlineSnapshot(
            `"Error: SQLITE_ERROR: no such column: f3"`
        );
    });

    it("select1-1.4 -- destructuring", async () => {
        const q = test1.select(({ f1 }) => ({ f1 })).print();

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
        const q = test1.select((f) => ({ f1: f.f1, f2: f.f2 })).print();

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
        const q = test1.select(({ f1, f2 }) => ({ f1, f2 })).print();

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

    it("select1-1.8", async () => {
        const q = test1.selectStar().print();

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
        const q = test1.selectStar().selectStar().print();

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
        const q = test1.selectStar().appendSelectStar().print();

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
        const q = test1
            .selectStar()
            .appendSelect(({ f1, f2 }) => ({
                min: sql`min(${f1}, ${f2})`,
                max: sql`max(${f1}, ${f2})`,
            }))
            .print();

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
        const q = test1
            .select((_f) => ({ one: sql("one") }))
            .appendSelectStar()
            .appendSelect((_f) => ({ two: sql("two") }))
            .appendSelectStar()
            .print();

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
        const q = fromTest1And2.selectStar().print();

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
        const q = fromTest1And2
            .selectStar()
            .appendSelect((_f) => ({ hi: sql("hi") }))
            .print();

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
        const q = fromTest1And2
            .select((_f) => ({ one: sql("one") }))
            .appendSelectStar()
            .appendSelect((_f) => ({ two: sql("two") }))
            .appendSelectStar()
            .print();

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
        const q = fromTest1And2
            .select((f) => ({
                f1: f.f1,
                r1: f.r1,
            }))
            .print();

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
        const q = test1
            .commaJoinTable(test1_dup)
            .select((f) => ({
                //@ts-expect-error
                f1: f.f1,
                //@ts-expect-error
                f2: f.f2,
            }))
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT f1 AS f1, f2 AS f2 FROM test1, test1_dup;"`
        );
        expect(await fail(q)).toMatchInlineSnapshot(
            `"Error: SQLITE_ERROR: ambiguous column name: f1"`
        );
    });

    it("select1-1.10 -- collision fixed", async () => {
        const q = test1
            .commaJoinTable(test1_dup)
            .select((f) => ({
                f1: f["test1.f1"],
                f2: f["test1_dup.f2"],
            }))
            .print();

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
    it("select1-1.10 -- collision fixed", async () => {
        const q = test1
            .commaJoinTable(test1_dup)
            .commaJoinTable(test2)
            .select((f) => ({
                f1: f["test1.f1"],
                f2: f["test1_dup.f2"],
            }))
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT test1.f1 AS f1, test1_dup.f2 AS f2 FROM test1, test1_dup, test2;"`
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
        const q = fromTest1And2
            .select((f) => ({
                f1: f["test1.f1"],
                r1: f["test2.r1"],
            }))
            .print();

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
        const q = fromTest1And2.selectStar().print();

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
        const q = table(["f1", "f2"], "a", "test1")
            .commaJoinTable(table(["f1", "f2"], "b", "test1"))
            .selectStar()
            .print();

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
        const q = table(["f1", "f2"], "a", "test1")
            .commaJoinTable(table(["f1", "f2"], "b", "test1"))
            .select((f) => ({
                f1: f["a.f1"],
                f2: f["b.f2"],
            }))
            .print();

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
        const q = fromTest1And2
            .select((f) => ({
                max: max(f["test1.f1"], f["test2.r1"]),
                min: min(f["test1.f2"], f["test2.r2"]),
            }))
            .print();

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
        const q = test1
            .select(({ f1 }) => ({ f1 }))
            .where(({ f1 }) => sql`${f1} < 11`)
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT f1 AS f1 FROM test1 WHERE f1 < 11;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("select1-3.1 -- from selection", async () => {
        const q = test1
            .select(({ f1 }) => ({ f3: f1 }))
            .where(({ f3 }) => sql`${f3} < 11`)
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT f1 AS f3 FROM test1 WHERE f3 < 11;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("select1-3.1 -- warns of missing columns", async () => {
        const q = test1
            .select(({ f1 }) => ({ f3: f1 }))
            .where(
                ({
                    //@ts-expect-error
                    f5,
                }) => sql`${f5} < 11`
            )
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT f1 AS f3 FROM test1 WHERE f5 < 11;"`
        );
        expect(await fail(q)).toMatchInlineSnapshot(
            `"Error: SQLITE_ERROR: no such column: f5"`
        );
    });

    it("select1-3.1 -- two calls", async () => {
        const q = test1
            .select(({ f1 }) => ({ f1 }))
            .where(({ f1 }) => sql`${f1} < 11`)
            .where(({ f2 }) => sql`${f2} > 0`)
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT f1 AS f1 FROM test1 WHERE f1 < 11 AND f2 > 0;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("select1-3.1 -- return list", async () => {
        const q = test1
            .select(({ f1 }) => ({ f1 }))
            .where(({ f1 }) => [sql`${f1} < 11`])
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT f1 AS f1 FROM test1 WHERE f1 < 11;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("select1-3.1 -- return list with 2 items", async () => {
        const q = test1
            .select(({ f1 }) => ({ f1 }))
            .where(({ f1, f2 }) => [sql`${f1} < 11`, sql`${f2} > 0`])
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT f1 AS f1 FROM test1 WHERE f1 < 11 AND f2 > 0;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("select1-4.1", async () => {
        const q = test1
            .select(({ f1 }) => ({ f1 }))
            .orderBy(({ f1 }) => f1)
            .print();

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
        const q = test1
            .select(({ f1 }) => ({ f1 }))
            .orderBy(({ f1 }) => f1)
            .orderBy(({ f2 }) => f2)
            .print();

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
        const q = test1
            .select(({ f1 }) => ({ f1 }))
            .orderBy(({ f1, f2 }) => [f1, f2])
            .print();

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
        const q = test1
            .select(({ f1 }) => ({ f1 }))
            .orderBy(({ f1, f2 }) => [sql`${f1} ASC`, sql`${f2} DESC`])
            .print();

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
        const q = test1
            .select(({ f1 }) => ({ f3: f1 }))
            .orderBy(({ f3 }) => f3)
            .print();

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
        const q = test1
            .selectStar()
            .where((f) => sql`${f.f1} == 11`)
            .print();

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
        const q = test1
            .selectStar()
            .distinct()
            .where((f) => sql`${f.f1} == 11`)
            .print();

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
        const q = test1
            .select((f) => ({ ["xyzzy "]: f.f1 }))
            .orderBy((f) => f.f2)
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT f1 AS \`xyzzy \` FROM test1 ORDER BY f2;"`
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
        const q = test1
            .select((f) => ({ it: sql`${f["test1.f1"]} + ${f.f2}` }))
            .orderBy((f) => f.f2)
            .print();

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
        const q = fromTest1And2
            .select((f) => ({ it: sql`${f["test1.f1"]} + ${f.f2}`, r2: f.r2 }))
            .orderBy((f) => f.f2)
            .print();

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
        const q = table(["f1", "f2"], "a", "test1")
            .commaJoinTable(table(["r1", "r2"], "test2"))
            .select((f) => ({ it: f["a.f1"], r2: f.r2 }))
            .orderBy((f) => f.f2)
            .print();

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
        const q = table(["f1", "f2"], "a", "test1")
            .commaJoinTable(table(["r1", "r2"], "b", "test2"))
            .select((f) => ({ it: f["a.f1"], r2: f["b.r2"] }))
            .orderBy((f) => f["a.f1"])
            .orderBy((f) => f["b.r2"])
            .print();

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
        const q = table(["f1", "f2"], "a", "test1")
            .commaJoinTable(table(["r1", "r2"], "b", "test3"))
            .selectStar()
            .limit(1)
            .print();

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
    it("select1-6.9.7", async () => {
        const q = table(["f1", "f2"], "a", "test1")
            .commaJoinSelect(
                "it",
                fromNothing({
                    "5": sql(5),
                    "6": sql(6),
                })
            )
            .selectStar()
            .limit(1)
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM test1 AS a, (SELECT 5 AS \`5\`, 6 AS \`6\`) AS it LIMIT 1;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "5": 5,
                "6": 6,
                "f1": 11,
                "f2": 22,
              },
            ]
        `);
    });
    it("select1-6.9.7 -- inverse", async () => {
        const q = fromNothing({
            "5": sql(5),
            "6": sql(6),
        })
            .commaJoinTable("it", table(["f1", "f2"], "a", "test1"))
            .selectStar()
            .limit(1)
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM (SELECT 5 AS \`5\`, 6 AS \`6\`) AS it, test1 AS a LIMIT 1;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "5": 5,
                "6": 6,
                "f1": 11,
                "f2": 22,
              },
            ]
        `);
    });
    it("select1-6.9.7 -- 2 queries", async () => {
        const q = fromNothing({
            "5": sql(5),
            "6": sql(6),
        })
            .commaJoinSelect(
                "it",
                "it2",
                fromNothing({
                    "5": sql(5),
                    "6": sql(6),
                })
            )
            .selectStar()
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM (SELECT 5 AS \`5\`, 6 AS \`6\`) AS it, (SELECT 5 AS \`5\`, 6 AS \`6\`) AS it2;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "5": 5,
                "6": 6,
              },
            ]
        `);
    });
    it("select1-6.9.8", async () => {
        const q = table(["f1", "f2"], "a", "test1")
            .commaJoinSelect(
                "b",
                fromNothing({
                    x: sql(5),
                    y: sql(6),
                })
            )
            .selectStar()
            .limit(1)
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM test1 AS a, (SELECT 5 AS x, 6 AS y) AS b LIMIT 1;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
                "f2": 22,
                "x": 5,
                "y": 6,
              },
            ]
        `);
    });
    it("select1-6.9.8 -- use alias", async () => {
        const q = table(["f1", "f2"], "a", "test1")
            .commaJoinSelect(
                "b",
                fromNothing({
                    x: sql(5),
                    y: sql(6),
                })
            )
            .select((f) => ({
                a: f["a.f1"],
                b: f.x,
                b2: f["b.y"],
            }))
            .limit(1)
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT a.f1 AS a, x AS b, b.y AS b2 FROM test1 AS a, (SELECT 5 AS x, 6 AS y) AS b LIMIT 1;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "a": 11,
                "b": 5,
                "b2": 6,
              },
            ]
        `);
    });
    it("select1-6.9.9", async () => {
        const q = table(["f1", "f2"], "a", "test1")
            .commaJoinTable(table(["f1", "f2"], "b", "test1"))
            .select((f) => ({
                f1: f["a.f1"],
                f2: f["b.f2"],
            }))
            .limit(1)
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT a.f1 AS f1, b.f2 AS f2 FROM test1 AS a, test1 AS b LIMIT 1;"`
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
    it("select1-15.3", async () => {
        const subquery = test1.select((f) => ({ f1: f.f1 }));
        const q = fromNothing({
            it: sql`2 IN ${subquery}`,
        }).print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT 2 IN (SELECT f1 AS f1 FROM test1) AS it;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "it": 0,
              },
            ]
        `);
    });
    it("select1-6.21 -- no union", async () => {
        const subquery = t6
            .select((f) => ({ b: f.b }))
            .where((_f) => sql`a<='b'`);

        const q = t6
            .select((f) => ({ a: f.a }))
            .where((f) => sql`${f.b} IN ${subquery}`)
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT a AS a FROM t6 WHERE b IN (SELECT b AS b FROM t6 WHERE a<='b');"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "a": "a",
              },
              Object {
                "a": "b",
              },
            ]
        `);
    });
    it("select1-9.3", async () => {
        const subquery = test2.select((_f) => ({ c: sql`count(*)` }));
        const q = test1
            .selectStar()
            .where((f) => sql`${f.f1} < ${subquery}`)
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM test1 WHERE f1 < (SELECT count(*) AS c FROM test2);"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("select1-9.4", async () => {
        const subquery = test2.select((_f) => ({ c: sql`count(*)` }));
        const q = test1
            .selectStar()
            .where((f) => sql`${f.f1} < ${subquery}`)
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM test1 WHERE f1 < (SELECT count(*) AS c FROM test2);"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("select1-12.8", async () => {
        const subquery = fromNothing({
            it: sql(11),
        });
        const q = test1
            .selectStar()
            .where((f) => sql`${f.f1} = ${subquery}`)
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM test1 WHERE f1 = (SELECT 11 AS it);"`
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
    it("select1-12.1", async () => {
        const q = fromNothing({
            it: sql`1+2+3`,
        }).print();

        expect(q).toMatchInlineSnapshot(`"SELECT 1+2+3 AS it;"`);
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "it": 6,
              },
            ]
        `);
    });
    it("select1-12.2", async () => {
        const q = fromNothing({
            "1": sql(1),
            hello: sql("hello"),
            "2": sql(2),
        }).print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT 1 AS \`1\`, 2 AS \`2\`, 'hello' AS hello;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "1": 1,
                "2": 2,
                "hello": "hello",
              },
            ]
        `);
    });
    it("select1-12.3", async () => {
        const q = fromNothing({
            a: sql(1),
            b: sql("hello"),
            c: sql(2),
        }).print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT 1 AS a, 'hello' AS b, 2 AS c;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "a": 1,
                "b": "hello",
                "c": 2,
              },
            ]
        `);
    });

    it("select1-18.3", async () => {
        const subquery = test1
            .select((f) => ({ f1: f.f1 }))
            .where(
                (f) =>
                    sql`${f.f1} = ${f.f2} OR ${f.f1} = ${test2.select(
                        (_test2Fields) => ({
                            it: f.f1,
                        })
                    )}`
            )
            .select(() => ({ it: sql(3) }))
            .where((f) => sql`${f.f1} > ${f.it} OR ${f.f1} = ${f.it}`);

        const subquery2 = test2
            .select(() => ({ "2": sql(2) }))
            .where(() => sql`${subquery}`);

        const q = test1
            .select(() => ({ "1": sql(1) }))
            .where(() => sql`${subquery2}`)
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT 1 AS \`1\` FROM test1 WHERE (SELECT 2 AS \`2\` FROM test2 WHERE (SELECT 3 AS it FROM (SELECT f1 AS f1 FROM test1 WHERE f1 = f2 OR f1 = (SELECT f1 AS it FROM test2)) WHERE f1 > it OR f1 = it));"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "1": 1,
              },
            ]
        `);
    });

    it("select1-18.4", async () => {
        const subquery = test1
            .select((f) => ({ f1: f.f1 }))
            .where((f) => sql`${f.f1} = ${f.f2}`)
            .select(() => ({ it: sql(3) }))
            .where((f) => sql`${f.f1} > ${f.it} OR ${f.f1} = ${f.it}`);

        const subquery2 = test2
            .select(() => ({ "2": sql(2) }))
            .where(() => sql`${subquery}`);

        const q = test1
            .commaJoinTable(test2)
            .select(() => ({ "1": sql(1) }))
            .where(() => sql`${subquery2}`)
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT 1 AS \`1\` FROM test1, test2 WHERE (SELECT 2 AS \`2\` FROM test2 WHERE (SELECT 3 AS it FROM (SELECT f1 AS f1 FROM test1 WHERE f1 = f2) WHERE f1 > it OR f1 = it));"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("select1-11.12", async () => {
        const subquery = test2.select((f) => ({
            r2: max(f.r2),
            r1: max(f.r1),
        }));

        const q = test1
            .commaJoinSelect("it", subquery)
            .selectStarOfAliases(["test1"])
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT test1.* FROM test1, (SELECT max(r2) AS r2, max(r1) AS r1 FROM test2) AS it;"`
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

    it("select1-11.12 -- select 1 more level", async () => {
        const subquery = test2.select((f) => ({
            r2: max(f.r2),
            r1: max(f.r1),
        }));

        const q = test1
            .commaJoinSelect("it", subquery)
            .selectStarOfAliases(["test1"])
            .select((f) => ({
                a: f.f1,
                b: f.f2,
            }))
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT f1 AS a, f2 AS b FROM (SELECT test1.* FROM test1, (SELECT max(r2) AS r2, max(r1) AS r1 FROM test2) AS it);"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "a": 11,
                "b": 22,
              },
            ]
        `);
    });

    it("select1-11.12 -- no prefixes", async () => {
        const subquery = test2.select((f) => ({
            r2: max(f.r2),
            r1: max(f.r1),
        }));

        const q = test1
            .commaJoinSelect("it", subquery)
            .selectStarOfAliases(["test1"])
            .select((f) => ({
                a: f.f1,
                b: f.f2,
                //@ts-expect-error
                c: f["test1.f1"],
                //@ts-expect-error
                d: f["test1.f2"],
            }))
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT f1 AS a, f2 AS b, test1.f1 AS c, test1.f2 AS d FROM (SELECT test1.* FROM test1, (SELECT max(r2) AS r2, max(r1) AS r1 FROM test2) AS it);"`
        );
        expect(await fail(q)).toMatchInlineSnapshot(
            `"Error: SQLITE_ERROR: no such column: test1.f1"`
        );
    });

    it("select1-11.12 -- knows from which table", async () => {
        const subquery = test2.select((f) => ({
            r2: max(f.r2),
            r1: max(f.r1),
        }));

        const q = test1
            .commaJoinSelect("it", subquery)
            .selectStarOfAliases(["test1"])
            .select((f) => ({
                a: f.f1,
                //@ts-expect-error
                e: f.r2,
                //@ts-expect-error
                f: f["it.r2"],
            }))
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT f1 AS a, r2 AS e, it.r2 AS f FROM (SELECT test1.* FROM test1, (SELECT max(r2) AS r2, max(r1) AS r1 FROM test2) AS it);"`
        );
        expect(await fail(q)).toMatchInlineSnapshot(
            `"Error: SQLITE_ERROR: no such column: r2"`
        );
    });

    it("select1-11.13", async () => {
        const subquery = test2.select((f) => ({
            r2: max(f.r2),
            r1: max(f.r1),
        }));

        const q = subquery
            .commaJoinTable("it", test1)
            .selectStarOfAliases(["test1"])
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT test1.* FROM (SELECT max(r2) AS r2, max(r1) AS r1 FROM test2) AS it, test1;"`
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

    it("select1-11.13 -- other selection", async () => {
        const subquery = test2.select((f) => ({
            r2: max(f.r2),
            r1: max(f.r1),
        }));

        const q = subquery
            .commaJoinTable("it", test1)
            .selectStarOfAliases(["it"])
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT it.* FROM (SELECT max(r2) AS r2, max(r1) AS r1 FROM test2) AS it, test1;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "r1": 1.1,
                "r2": 2.2,
              },
            ]
        `);
    });

    it("select1-11.13 -- other selection inversed", async () => {
        const subquery = test2.select((f) => ({
            r2: max(f.r2),
            r1: max(f.r1),
        }));

        const q = test1
            .commaJoinSelect("it", subquery)
            .selectStarOfAliases(["it"])
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT it.* FROM test1, (SELECT max(r2) AS r2, max(r1) AS r1 FROM test2) AS it;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "r1": 1.1,
                "r2": 2.2,
              },
            ]
        `);
    });
    it("select1-11.15", async () => {
        const subquery = test2.select((f) => ({
            r2: max(f.r2),
            r1: max(f.r1),
        }));

        const q = subquery
            .commaJoinTable("it", test1)
            .selectStarOfAliases(["it", "test1"])
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT it.*, test1.* FROM (SELECT max(r2) AS r2, max(r1) AS r1 FROM test2) AS it, test1;"`
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

    it("select1-11.15 -- distinct", async () => {
        const subquery = test2.select((f) => ({
            r2: max(f.r2),
            r1: max(f.r1),
        }));

        const q = subquery
            .commaJoinTable("it", test1)
            .selectStarOfAliases(["it", "test1"])
            .distinct()
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT DISTINCT it.*, test1.* FROM (SELECT max(r2) AS r2, max(r1) AS r1 FROM test2) AS it, test1;"`
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
    it("select1-17.2", async () => {
        const subquery = test2
            .selectStar()
            .where((f) => sql`${f.r2} = 2`)
            .orderBy((f) => f.r1)
            .orderBy((f) => f.r2)
            .limit(4);

        const q = test1.commaJoinSelect("it", subquery).selectStar().print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM test1, (SELECT * FROM test2 WHERE r2 = 2 ORDER BY r1, r2 LIMIT 4) AS it;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("select1-6.10", async () => {
        const q1 = test1.select((f) => ({ f1: f.f1 }));
        const q2 = test1.select((f) => ({ f2: f.f2 }));

        const q = union([q1, q2])
            .orderBy((f) => f.f2)
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT f1 AS f1 FROM test1 UNION SELECT f2 AS f2 FROM test1 ORDER BY f2;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
              },
              Object {
                "f1": 22,
              },
            ]
        `);
    });
    it("select1-6.10 -- order by other", async () => {
        const q1 = test1.select((f) => ({ f1: f.f1 }));
        const q2 = test1.select((f) => ({ f2: f.f2 }));

        const q = union([q1, q2])
            .orderBy((f) => f.f1)
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT f1 AS f1 FROM test1 UNION SELECT f2 AS f2 FROM test1 ORDER BY f1;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
              },
              Object {
                "f1": 22,
              },
            ]
        `);
    });
    it("select1-12.5", async () => {
        const q1 = test1.selectStar();
        const q2 = fromNothing({ a: sql(3), "4": sql(4) });

        const q = union([q1, q2])
            .orderBy((f) => f.a)
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM test1 UNION SELECT 4 AS \`4\`, 3 AS a ORDER BY a;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 4,
                "f2": 3,
              },
              Object {
                "f1": 11,
                "f2": 22,
              },
            ]
        `);
    });
    it("select1-12.6", async () => {
        const q1 = test1.selectStar();
        const q2 = fromNothing({ a: sql(3), "4": sql(4) });

        const q = union([q2, q1]).print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT 4 AS \`4\`, 3 AS a UNION SELECT * FROM test1;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "4": 4,
                "a": 3,
              },
              Object {
                "4": 11,
                "a": 22,
              },
            ]
        `);
    });
    it("select1-6.21", async () => {
        const q1 = test1
            .select((f) => ({ f1: f.f1 }))
            .where((f) => sql`${f.f1} < ${f.f2}`);

        const q2 = fromNothing({ x: sql(3) });

        const u = union([q2, q1])
            .orderBy((_f) => sql`1 DESC`)
            .limit(1);

        const q = test1
            .select((f) => ({ it: f.f1 }))
            .where((f) => sql`${f.f1} IN ${u}`)
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT f1 AS it FROM test1 WHERE f1 IN (SELECT 3 AS x UNION SELECT f1 AS f1 FROM test1 WHERE f1 < f2 ORDER BY 1 DESC LIMIT 1);"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "it": 11,
              },
            ]
        `);
    });

    it("select1-17.3", async () => {
        const q1 = test1.selectStar().where((f) => sql`${f.f1} < ${f.f2}`);

        const q2 = test1.selectStar().where((f) => sql`${f.f1} > ${f.f2}`);

        const u = unionAll([q1, q2])
            .orderBy((f) => f.f1)
            .orderBy((f) => f.f2)
            .limit(1);

        const q = test1.commaJoinCompound("u", u).selectStar().print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM test1, (SELECT * FROM test1 WHERE f1 < f2 UNION ALL SELECT * FROM test1 WHERE f1 > f2 ORDER BY f1, f2 LIMIT 1) AS u;"`
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

    it("select1-17.3 -- limit safe string", async () => {
        const q1 = test1.selectStar().where((f) => sql`${f.f1} < ${f.f2}`);

        const q2 = test1.selectStar().where((f) => sql`${f.f1} > ${f.f2}`);

        const u = unionAll([q1, q2])
            .orderBy((f) => f.f1)
            .orderBy((f) => f.f2)
            .limit(sql`1 OFFSET 10`);

        const q = test1.commaJoinCompound("u", u).selectStar().print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM test1, (SELECT * FROM test1 WHERE f1 < f2 UNION ALL SELECT * FROM test1 WHERE f1 > f2 ORDER BY f1, f2 LIMIT 1 OFFSET 10) AS u;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("select1-17.3 -- compound select star", async () => {
        const q1 = test1.selectStar().where((f) => sql`${f.f1} < ${f.f2}`);

        const q2 = test1.selectStar().where((f) => sql`${f.f1} > ${f.f2}`);

        const q = unionAll([q1, q2])
            .orderBy((f) => f.f1)
            .orderBy((f) => f.f2)
            .selectStar()
            .select((f) => ({ f1: f["main_alias.f1"], f2: f.f2 }))
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT main_alias.f1 AS f1, f2 AS f2 FROM (SELECT * FROM (SELECT * FROM test1 WHERE f1 < f2 UNION ALL SELECT * FROM test1 WHERE f1 > f2 ORDER BY f1, f2)) AS main_alias;"`
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

    it("select1-12.9", async () => {
        const q1 = test1.selectStar().where((f) => sql`${f.f1} < ${f.f2}`);

        const q2 = test1.selectStar().where((f) => sql`${f.f1} > ${f.f2}`);

        const u = unionAll([q1, q2])
            .orderBy((f) => f.f1)
            .orderBy((f) => f.f2)
            .limit(1);

        const q = u
            .select((f) => ({ it: f.f1 }))
            .orderBy((f) => f.f2)
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT f1 AS it FROM (SELECT * FROM test1 WHERE f1 < f2 UNION ALL SELECT * FROM test1 WHERE f1 > f2 ORDER BY f1, f2 LIMIT 1) ORDER BY f2;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "it": 11,
              },
            ]
        `);
    });
    it("select1-12.9 -- correct types", async () => {
        const q1 = test1.selectStar().where((f) => sql`${f.f1} < ${f.f2}`);

        const q2 = test1.selectStar().where((f) => sql`${f.f1} > ${f.f2}`);

        const u = unionAll([q1, q2])
            .orderBy((f) => f.f1)
            .orderBy((f) => f.f2)
            .limit(1);

        const q = u
            .select((f) => ({ it: f.f1 }))
            // @ts-expect-error
            .orderBy((f) => f["test1.f2"])
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT f1 AS it FROM (SELECT * FROM test1 WHERE f1 < f2 UNION ALL SELECT * FROM test1 WHERE f1 > f2 ORDER BY f1, f2 LIMIT 1) ORDER BY test1.f2;"`
        );
        expect(await fail(q)).toMatchInlineSnapshot(
            `"Error: SQLITE_ERROR: no such column: test1.f2"`
        );
    });

    it("select1-12.10", async () => {
        const q1 = test1.selectStar().where((f) => sql`${f.f1} < ${f.f2}`);

        const q2 = test1.selectStar().where((f) => sql`${f.f1} > ${f.f2}`);

        const u = unionAll([q1, q2])
            .orderBy((f) => f.f1)
            .orderBy((f) => f.f2)
            .limit(1);

        const q = u
            .select((f) => ({ it: f["main_alias.f1"] }))
            .orderBy((f) => f.f2)
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT main_alias.f1 AS it FROM (SELECT * FROM test1 WHERE f1 < f2 UNION ALL SELECT * FROM test1 WHERE f1 > f2 ORDER BY f1, f2 LIMIT 1) AS main_alias ORDER BY f2;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "it": 11,
              },
            ]
        `);
    });

    it("select1-12.10 -- append select", async () => {
        const q1 = test1.selectStar().where((f) => sql`${f.f1} < ${f.f2}`);

        const q2 = test1.selectStar().where((f) => sql`${f.f1} > ${f.f2}`);

        const u = unionAll([q1, q2])
            .orderBy((f) => f.f1)
            .orderBy((f) => f.f2)
            .limit(1);

        const q = u
            .select((f) => ({ f1: f["main_alias.f1"] }))
            .appendSelect((f) => ({ f2: f["main_alias.f2"] }))
            .orderBy((f) => f.f2)
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT main_alias.f1 AS f1, main_alias.f2 AS f2 FROM (SELECT * FROM test1 WHERE f1 < f2 UNION ALL SELECT * FROM test1 WHERE f1 > f2 ORDER BY f1, f2 LIMIT 1) AS main_alias ORDER BY f2;"`
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

    it("select1-12.10 -- main alias 1 query", async () => {
        const q = test1
            .selectStar()
            .where((f) => sql`${f.f1} < ${f.f2}`)
            .select((f) => ({ f1: f["main_alias.f1"] }))
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT main_alias.f1 AS f1 FROM (SELECT * FROM test1 WHERE f1 < f2) AS main_alias;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
              },
            ]
        `);
    });

    it("select1-12.10 -- main alias append", async () => {
        const q = test1
            .selectStar()
            .appendSelect((f) => ({ f1: f["main_alias.f1"] }))
            .where((f) => sql`${f.f1} < ${f.f2}`)
            .select((f) => ({ f1: f["main_alias.f1"] }))
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT main_alias.f1 AS f1 FROM (SELECT *, main_alias.f1 AS f1 FROM test1 AS main_alias WHERE f1 < f2) AS main_alias;"`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                "f1": 11,
              },
            ]
        `);
    });

    it("select1-12.10 -- main alias append 2", async () => {
        const q = test1
            .selectStar()
            .appendSelect((f) => ({ f1: f["main_alias.f1"] }))
            .where((f) => sql`${f.f1} < ${f.f2}`)
            .select((f) => ({ f1: f["main_alias.f1"] }))
            .appendSelect((f) => ({ f2: f["main_alias.f2"] }))
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT main_alias.f1 AS f1, main_alias.f2 AS f2 FROM (SELECT *, main_alias.f1 AS f1 FROM test1 AS main_alias WHERE f1 < f2) AS main_alias;"`
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
});
