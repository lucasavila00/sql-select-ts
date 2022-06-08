import { pipe } from "fp-ts/lib/function";
import sqlite from "sqlite3";
import {
    appendSelect,
    appendSelectStar,
    fromTable,
    qToString,
    select,
    selectStar,
} from "../src/q";
import { sql } from "../src/safe-string";

// mostly from https://github.com/sqlite/sqlite/blob/master/test/select1.test

describe("sqlite select1", () => {
    const test1 = fromTable<"f1" | "f2">("test1");

    let db: sqlite.Database;
    let run: (query: string) => Promise<any[]>;

    beforeAll(async () => {
        const it = sqlite.verbose();
        db = new it.Database(":memory:");
        run = (it: string) =>
            new Promise((rs, rj) => db.all(it, (e, r) => (e ? rj(e) : rs(r))));

        await run(`CREATE TABLE test1(f1 int, f2 int)`);
        await run(`INSERT INTO test1(f1,f2) VALUES(11,22)`);
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
});
