import { pipe } from "fp-ts/lib/function";
import sqlite from "sqlite3";
import {
    appendSelect,
    appendSelectStar,
    appendTable,
    fromTable,
    qToString,
    select,
    selectStar,
} from "../src/q";
import { SafeString, sql } from "../src/safe-string";

// mostly from https://github.com/sqlite/sqlite/blob/master/test/select1.test

describe("sqlite select1", () => {
    const test1 = fromTable<"f1" | "f2", "test1">("test1", "test1");
    const test1_dup = fromTable<"f1" | "f2", "test1_dup">(
        "test1_dup",
        "test1_dup"
    );
    const test2 = fromTable<"r1" | "r2", "test2">("test2", "test2");

    const test1And2 = pipe(
        //
        test1,
        appendTable(test2)
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
    });

    it("select1-1.4", async () => {
        const q = pipe(
            test1,
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
    it("select1-1.4 -- destructuring", async () => {
        const q = pipe(
            test1,
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
            test1,
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
            test1,
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
            test1,
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
            test1,
            selectStar,
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
            test1,
            selectStar,
            selectStar,
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
            test1,
            selectStar,
            appendSelectStar,
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
            test1,
            selectStar,
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
            test1,
            select((_f) => ({ one: sql("one") })),
            appendSelectStar,
            appendSelect((_f) => ({ two: sql("two") })),
            appendSelectStar,
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
            test1And2,
            selectStar,
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
            test1And2,
            selectStar,
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
            test1And2,
            select((_f) => ({ one: sql("one") })),
            appendSelectStar,
            appendSelect((_f) => ({ two: sql("two") })),
            appendSelectStar,
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
            test1And2,
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
            test1,
            appendTable(test1_dup),
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
            test1,
            appendTable(test1_dup),
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
            test1And2,
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
            test1And2,
            selectStar,
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
            fromTable<"f1" | "f2", "a">("test1", "a"),
            appendTable(fromTable<"f1" | "f2", "b">("test1", "b")),
            selectStar,
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
            fromTable<"f1" | "f2", "a">("test1", "a"),
            appendTable(fromTable<"f1" | "f2", "b">("test1", "b")),
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
            test1And2,
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
});
