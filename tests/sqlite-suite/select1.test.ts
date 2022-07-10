import {
    fromNothing,
    table,
    SafeString,
    dsql,
    union,
    unionAll,
    except,
    intersect,
} from "../../src";
import { configureSqlite } from "../utils";
import { addSimpleStringSerializer } from "../utils";
addSimpleStringSerializer();

// mostly from https://github.com/sqlite/sqlite/blob/master/test/select1.test

const max = (...it: SafeString[]) => dsql`max(${it})`;
const min = (...it: SafeString[]) => dsql`min(${it})`;
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

    it("apply type checks", async () => {
        const q1 = test1.selectStar();
        unionAll([q1, q1, q1])
            .apply((it) => it.select(["f1"]))
            .select((f) => ({
                //@ts-expect-error
                b: f.f2,
            }))
            .stringify();
        expect(1).toBe(1);

        unionAll([q1, q1, q1])
            .select(["f1"])
            .select((f) => ({
                //@ts-expect-error
                b: f.f2,
            }))
            .stringify();
        expect(1).toBe(1);
    });

    it("select0", async () => {
        const q = test1
            .select((f) => ({
                //
                ["f1"]: f.f1,
                ["1"]: f.f1,
                ["-asd-"]: f.f1,
                ["//as/d/asd"]: f.f1,
            }))
            .groupBy((f) => f["//as/d/asd"])
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f1\` AS \`1\`, \`f1\` AS \`f1\`, \`f1\` AS \`-asd-\`, \`f1\` AS \`//as/d/asd\` FROM \`test1\` GROUP BY \`//as/d/asd\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                -asd-: 11,
                //as/d/asd: 11,
                1: 11,
                f1: 11,
              },
            ]
        `);
    });
    it("select1-1.4", async () => {
        const q = test1.select((f) => ({ f1: f.f1 })).stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f1\` AS \`f1\` FROM \`test1\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
              },
            ]
        `);
    });

    it("select1-1.4 -- append", async () => {
        const q = test1
            .select((f) => ({ f1: f.f1 }))
            .appendSelect((f) => ({ f2: f.f2 }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f1\` AS \`f1\`, \`f2\` AS \`f2\` FROM \`test1\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
              },
            ]
        `);
    });

    it("select1-1.4 -- select from alias", async () => {
        const q = test1.select((f) => ({ f1: f["test1.f1"] })).stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`test1\`.\`f1\` AS \`f1\` FROM \`test1\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
              },
            ]
        `);
    });

    it("select1-1.4 -- append from alias", async () => {
        const q = test1
            .select((f) => ({ f1: f["test1.f1"] }))
            .appendSelect((f) => ({ f2: f["test1.f2"] }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`test1\`.\`f1\` AS \`f1\`, \`test1\`.\`f2\` AS \`f2\` FROM \`test1\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
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
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f3\` AS \`f1\` FROM \`test1\``
        );
        expect(await fail(q)).toMatchInlineSnapshot(
            `Error: SQLITE_ERROR: no such column: f3`
        );
    });

    it("select1-1.4 -- destructuring", async () => {
        const q = test1.select(({ f1 }) => ({ f1 })).stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f1\` AS \`f1\` FROM \`test1\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
              },
            ]
        `);
    });

    it("select1-1.7", async () => {
        const q = test1.select((f) => ({ f1: f.f1, f2: f.f2 })).stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f1\` AS \`f1\`, \`f2\` AS \`f2\` FROM \`test1\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
              },
            ]
        `);
    });

    it("select1-1.7 -- destructuring", async () => {
        const q = test1.select(({ f1, f2 }) => ({ f1, f2 })).stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f1\` AS \`f1\`, \`f2\` AS \`f2\` FROM \`test1\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
              },
            ]
        `);
    });

    it("select1-1.8", async () => {
        const q = test1.selectStar().stringify();

        expect(q).toMatchInlineSnapshot(`SELECT * FROM \`test1\``);
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
              },
            ]
        `);
    });

    it("select1-1.8 -- 2 layers", async () => {
        const q = test1.selectStar().selectStar().stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`test1\`)`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
              },
            ]
        `);
    });

    it("select1-1.8.1", async () => {
        const q = test1.selectStar().appendSelectStar().stringify();

        expect(q).toMatchInlineSnapshot(`SELECT *, * FROM \`test1\``);
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
              },
            ]
        `);
    });

    it("select1-1.8.2", async () => {
        const q = test1
            .selectStar()
            .appendSelect(({ f1, f2 }) => ({
                min: dsql`min(${f1}, ${f2})`,
                max: dsql`max(${f1}, ${f2})`,
            }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT *, min(\`f1\`, \`f2\`) AS \`min\`, max(\`f1\`, \`f2\`) AS \`max\` FROM \`test1\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
                max: 22,
                min: 11,
              },
            ]
        `);
    });

    it("select1-1.8.3", async () => {
        const q = test1
            .select((_f) => ({ one: dsql("one") }))
            .appendSelectStar()
            .appendSelect((_f) => ({ two: dsql("two") }))
            .appendSelectStar()
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT 'one' AS \`one\`, *, 'two' AS \`two\`, * FROM \`test1\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
                one: one,
                two: two,
              },
            ]
        `);
    });
    it("select1-1.9", async () => {
        const q = fromTest1And2.selectStar().stringify();

        expect(q).toMatchInlineSnapshot(`SELECT * FROM \`test1\`, \`test2\``);
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
                r1: 1.1,
                r2: 2.2,
              },
            ]
        `);
    });

    it("select1-1.9.1", async () => {
        const q = fromTest1And2
            .selectStar()
            .appendSelect((_f) => ({ hi: dsql("hi") }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT *, 'hi' AS \`hi\` FROM \`test1\`, \`test2\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
                hi: hi,
                r1: 1.1,
                r2: 2.2,
              },
            ]
        `);
    });

    it("select1-1.9.2", async () => {
        const q = fromTest1And2
            .select((_f) => ({ one: dsql("one") }))
            .appendSelectStar()
            .appendSelect((_f) => ({ two: dsql("two") }))
            .appendSelectStar()
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT 'one' AS \`one\`, *, 'two' AS \`two\`, * FROM \`test1\`, \`test2\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
                one: one,
                r1: 1.1,
                r2: 2.2,
                two: two,
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
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f1\` AS \`f1\`, \`r1\` AS \`r1\` FROM \`test1\`, \`test2\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                r1: 1.1,
              },
            ]
        `);
    });

    it("select1-1.10 -- collision fixed", async () => {
        const q = test1
            .commaJoinTable(test1_dup)
            .select((f) => ({
                f1: f["test1.f1"],
                f2: f["test1_dup.f2"],
            }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`test1\`.\`f1\` AS \`f1\`, \`test1_dup\`.\`f2\` AS \`f2\` FROM \`test1\`, \`test1_dup\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
              },
            ]
        `);
    });
    it("select1-1.10 -- collision fixed2", async () => {
        const q = test1
            .commaJoinTable(test1_dup)
            .commaJoinTable(test2)
            .select((f) => ({
                f1: f["test1.f1"],
                f2: f["test1_dup.f2"],
            }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`test1\`.\`f1\` AS \`f1\`, \`test1_dup\`.\`f2\` AS \`f2\` FROM \`test1\`, \`test1_dup\`, \`test2\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
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
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`test1\`.\`f1\` AS \`f1\`, \`test2\`.\`r1\` AS \`r1\` FROM \`test1\`, \`test2\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                r1: 1.1,
              },
            ]
        `);
    });
    it("select1-1.11.1", async () => {
        const q = fromTest1And2.selectStar().stringify();

        expect(q).toMatchInlineSnapshot(`SELECT * FROM \`test1\`, \`test2\``);
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
                r1: 1.1,
                r2: 2.2,
              },
            ]
        `);
    });
    it("select1-1.11.2", async () => {
        const q = table(["f1", "f2"], "a", "test1")
            .commaJoinTable(table(["f1", "f2"], "b", "test1"))
            .selectStar()
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`test1\` AS \`a\`, \`test1\` AS \`b\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
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
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`a\`.\`f1\` AS \`f1\`, \`b\`.\`f2\` AS \`f2\` FROM \`test1\` AS \`a\`, \`test1\` AS \`b\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
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
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT max(\`test1\`.\`f1\`, \`test2\`.\`r1\`) AS \`max\`, min(\`test1\`.\`f2\`, \`test2\`.\`r2\`) AS \`min\` FROM \`test1\`, \`test2\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                max: 11,
                min: 2.2,
              },
            ]
        `);
    });
    it("select1-3.1", async () => {
        const q = test1
            .select(({ f1 }) => ({ f1 }))
            .where(({ f1 }) => dsql`${f1} < 11`)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f1\` AS \`f1\` FROM \`test1\` WHERE \`f1\` < 11`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("select1-3.1 -- from selection", async () => {
        const q = test1
            .select(({ f1 }) => ({ f3: f1 }))
            .where(({ f3 }) => dsql`${f3} < 11`)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f1\` AS \`f3\` FROM \`test1\` WHERE \`f3\` < 11`
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
                }) => dsql`${f5} < 11`
            )
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f1\` AS \`f3\` FROM \`test1\` WHERE \`f5\` < 11`
        );
        expect(await fail(q)).toMatchInlineSnapshot(
            `Error: SQLITE_ERROR: no such column: f5`
        );
    });

    it("select1-3.1 -- two calls", async () => {
        const q = test1
            .select(({ f1 }) => ({ f1 }))
            .where(({ f1 }) => dsql`${f1} < 11`)
            .where(({ f2 }) => dsql`${f2} > 0`)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f1\` AS \`f1\` FROM \`test1\` WHERE \`f1\` < 11 AND \`f2\` > 0`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("select1-3.1 -- return list", async () => {
        const q = test1
            .select(({ f1 }) => ({ f1 }))
            .where(({ f1 }) => [dsql`${f1} < 11`])
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f1\` AS \`f1\` FROM \`test1\` WHERE \`f1\` < 11`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("select1-3.1 -- return list with 2 items", async () => {
        const q = test1
            .select(({ f1 }) => ({ f1 }))
            .where(({ f1, f2 }) => [dsql`${f1} < 11`, dsql`${f2} > 0`])
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f1\` AS \`f1\` FROM \`test1\` WHERE \`f1\` < 11 AND \`f2\` > 0`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("select1-4.1", async () => {
        const q = test1
            .select(({ f1 }) => ({ f1 }))
            .orderBy(({ f1 }) => f1)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f1\` AS \`f1\` FROM \`test1\` ORDER BY \`f1\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
              },
            ]
        `);
    });

    it("select1-4.1 -- two calls", async () => {
        const q = test1
            .select(({ f1 }) => ({ f1 }))
            .orderBy(({ f1 }) => f1)
            .orderBy(({ f2 }) => f2)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f1\` AS \`f1\` FROM \`test1\` ORDER BY \`f1\`, \`f2\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
              },
            ]
        `);
    });

    it("select1-4.1 -- array with 2 items", async () => {
        const q = test1
            .select(({ f1 }) => ({ f1 }))
            .orderBy(({ f1, f2 }) => [f1, f2])
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f1\` AS \`f1\` FROM \`test1\` ORDER BY \`f1\`, \`f2\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
              },
            ]
        `);
    });

    it("select1-4.1 -- desc asc", async () => {
        const q = test1
            .select(({ f1 }) => ({ f1 }))
            .orderBy(({ f1, f2 }) => [dsql`${f1} ASC`, dsql`${f2} DESC`])
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f1\` AS \`f1\` FROM \`test1\` ORDER BY \`f1\` ASC, \`f2\` DESC`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
              },
            ]
        `);
    });

    it("select1-4.1 -- from selection", async () => {
        const q = test1
            .select(({ f1 }) => ({ f3: f1 }))
            .orderBy(({ f3 }) => f3)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f1\` AS \`f3\` FROM \`test1\` ORDER BY \`f3\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f3: 11,
              },
            ]
        `);
    });

    it("select1-6.1.3", async () => {
        const q = test1
            .selectStar()
            .where((f) => dsql`${f.f1} == 11`)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`test1\` WHERE \`f1\` == 11`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
              },
            ]
        `);
    });

    it("select1-6.1.4", async () => {
        const q = test1
            .selectStar()
            .distinct()
            .where((f) => dsql`${f.f1} == 11`)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT DISTINCT * FROM \`test1\` WHERE \`f1\` == 11`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
              },
            ]
        `);
    });

    it("select1-6.3.1", async () => {
        const q = test1
            .select((f) => ({ ["xyzzy "]: f.f1 }))
            .orderBy((f) => f.f2)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f1\` AS \`xyzzy \` FROM \`test1\` ORDER BY \`f2\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                xyzzy : 11,
              },
            ]
        `);
    });

    it("select1-6.5", async () => {
        const q = test1
            .select((f) => ({ it: dsql`${f["test1.f1"]} + ${f.f2}` }))
            .orderBy((f) => f.f2)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`test1\`.\`f1\` + \`f2\` AS \`it\` FROM \`test1\` ORDER BY \`f2\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                it: 33,
              },
            ]
        `);
    });

    it("select1-6.6", async () => {
        const q = fromTest1And2
            .select((f) => ({ it: dsql`${f["test1.f1"]} + ${f.f2}`, r2: f.r2 }))
            .orderBy((f) => f.f2)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`test1\`.\`f1\` + \`f2\` AS \`it\`, \`r2\` AS \`r2\` FROM \`test1\`, \`test2\` ORDER BY \`f2\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                it: 33,
                r2: 2.2,
              },
            ]
        `);
    });

    it("select1-6.7", async () => {
        const q = table(["f1", "f2"], "a", "test1")
            .commaJoinTable(table(["r1", "r2"], "test2"))
            .select((f) => ({ it: f["a.f1"], r2: f.r2 }))
            .orderBy((f) => f.f2)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`a\`.\`f1\` AS \`it\`, \`r2\` AS \`r2\` FROM \`test1\` AS \`a\`, \`test2\` ORDER BY \`f2\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                it: 11,
                r2: 2.2,
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
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`a\`.\`f1\` AS \`it\`, \`b\`.\`r2\` AS \`r2\` FROM \`test1\` AS \`a\`, \`test2\` AS \`b\` ORDER BY \`a\`.\`f1\`, \`b\`.\`r2\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                it: 11,
                r2: 2.2,
              },
            ]
        `);
    });

    it("select1-6.9.6", async () => {
        const q = table(["f1", "f2"], "a", "test1")
            .commaJoinTable(table(["r1", "r2"], "b", "test3"))
            .selectStar()
            .limit(1)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`test1\` AS \`a\`, \`test3\` AS \`b\` LIMIT 1`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
                r1: 1.1,
                r2: 2.2,
              },
            ]
        `);
    });
    it("select1-6.9.7", async () => {
        const q = table(["f1", "f2"], "a", "test1")
            .commaJoinSelect(
                "it",
                fromNothing({
                    "5": dsql(5),
                    "6": dsql(6),
                })
            )
            .selectStar()
            .limit(1)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`test1\` AS \`a\`, (SELECT 5 AS \`5\`, 6 AS \`6\`) AS \`it\` LIMIT 1`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                5: 5,
                6: 6,
                f1: 11,
                f2: 22,
              },
            ]
        `);
    });
    it("select1-6.9.7 -- inverse", async () => {
        const q = fromNothing({
            "5": dsql(5),
            "6": dsql(6),
        })
            .commaJoinTable("it", table(["f1", "f2"], "a", "test1"))
            .selectStar()
            .limit(1)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT 5 AS \`5\`, 6 AS \`6\`) AS \`it\`, \`test1\` AS \`a\` LIMIT 1`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                5: 5,
                6: 6,
                f1: 11,
                f2: 22,
              },
            ]
        `);
    });
    it("select1-6.9.7 -- 2 queries", async () => {
        const q = fromNothing({
            "5": dsql(5),
            "6": dsql(6),
        })
            .commaJoinSelect(
                "it",
                "it2",
                fromNothing({
                    "5": dsql(5),
                    "6": dsql(6),
                })
            )
            .selectStar()
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT 5 AS \`5\`, 6 AS \`6\`) AS \`it\`, (SELECT 5 AS \`5\`, 6 AS \`6\`) AS \`it2\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                5: 5,
                6: 6,
              },
            ]
        `);
    });
    it("select1-6.9.8", async () => {
        const q = table(["f1", "f2"], "a", "test1")
            .commaJoinSelect(
                "b",
                fromNothing({
                    x: dsql(5),
                    y: dsql(6),
                })
            )
            .selectStar()
            .limit(1)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`test1\` AS \`a\`, (SELECT 5 AS \`x\`, 6 AS \`y\`) AS \`b\` LIMIT 1`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
                x: 5,
                y: 6,
              },
            ]
        `);
    });
    it("select1-6.9.8 -- use alias", async () => {
        const q = table(["f1", "f2"], "a", "test1")
            .commaJoinSelect(
                "b",
                fromNothing({
                    x: dsql(5),
                    y: dsql(6),
                })
            )
            .select((f) => ({
                a: f["a.f1"],
                b: f.x,
                b2: f["b.y"],
            }))
            .limit(1)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`a\`.\`f1\` AS \`a\`, \`x\` AS \`b\`, \`b\`.\`y\` AS \`b2\` FROM \`test1\` AS \`a\`, (SELECT 5 AS \`x\`, 6 AS \`y\`) AS \`b\` LIMIT 1`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                a: 11,
                b: 5,
                b2: 6,
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
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`a\`.\`f1\` AS \`f1\`, \`b\`.\`f2\` AS \`f2\` FROM \`test1\` AS \`a\`, \`test1\` AS \`b\` LIMIT 1`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
              },
            ]
        `);
    });
    it("select1-15.3", async () => {
        const subquery = test1.select((f) => ({ f1: f.f1 }));
        const q = fromNothing({
            it: dsql`2 IN ${subquery}`,
        }).stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT 2 IN (SELECT \`f1\` AS \`f1\` FROM \`test1\`) AS \`it\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                it: 0,
              },
            ]
        `);
    });
    it("select1-6.21 -- no union", async () => {
        const subquery = t6
            .select((f) => ({ b: f.b }))
            .where((_f) => dsql`a<='b'`);

        const q = t6
            .select((f) => ({ a: f.a }))
            .where((f) => dsql`${f.b} IN ${subquery}`)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`a\` AS \`a\` FROM \`t6\` WHERE \`b\` IN (SELECT \`b\` AS \`b\` FROM \`t6\` WHERE a<='b')`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                a: a,
              },
              Object {
                a: b,
              },
            ]
        `);
    });
    it("select1-9.3", async () => {
        const subquery = test2.select((_f) => ({ c: dsql`count(*)` }));
        const q = test1
            .selectStar()
            .where((f) => dsql`${f.f1} < ${subquery}`)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`test1\` WHERE \`f1\` < (SELECT count(*) AS \`c\` FROM \`test2\`)`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("select1-9.4", async () => {
        const subquery = test2.select((_f) => ({ c: dsql`count(*)` }));
        const q = test1
            .selectStar()
            .where((f) => dsql`${f.f1} < ${subquery}`)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`test1\` WHERE \`f1\` < (SELECT count(*) AS \`c\` FROM \`test2\`)`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("select1-12.8", async () => {
        const subquery = fromNothing({
            it: dsql(11),
        });
        const q = test1
            .selectStar()
            .where((f) => dsql`${f.f1} = ${subquery}`)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`test1\` WHERE \`f1\` = (SELECT 11 AS \`it\`)`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
              },
            ]
        `);
    });
    it("select1-12.1", async () => {
        const q = fromNothing({
            it: dsql`1+2+3`,
        }).stringify();

        expect(q).toMatchInlineSnapshot(`SELECT 1+2+3 AS \`it\``);
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                it: 6,
              },
            ]
        `);
    });
    it("select1-12.2", async () => {
        const q = fromNothing({
            "1": dsql(1),
            hello: dsql("hello"),
            "2": dsql(2),
        }).stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT 1 AS \`1\`, 2 AS \`2\`, 'hello' AS \`hello\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                1: 1,
                2: 2,
                hello: hello,
              },
            ]
        `);
    });
    it("select1-12.3", async () => {
        const q = fromNothing({
            a: dsql(1),
            b: dsql("hello"),
            c: dsql(2),
        }).stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT 1 AS \`a\`, 'hello' AS \`b\`, 2 AS \`c\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                a: 1,
                b: hello,
                c: 2,
              },
            ]
        `);
    });

    it("select1-18.3", async () => {
        const subquery = test1
            .select((f) => ({ f1: f.f1 }))
            .where(
                (f) =>
                    dsql`${f.f1} = ${f.f2} OR ${f.f1} = ${test2.select(
                        (_test2Fields) => ({
                            it: f.f1,
                        })
                    )}`
            )
            .select(() => ({ it: dsql(3) }))
            .where((f) => dsql`${f.f1} > ${f.it} OR ${f.f1} = ${f.it}`);

        const subquery2 = test2
            .select(() => ({ "2": dsql(2) }))
            .where(() => dsql`${subquery}`);

        const q = test1
            .select(() => ({ "1": dsql(1) }))
            .where(() => dsql`${subquery2}`)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT 1 AS \`1\` FROM \`test1\` WHERE (SELECT 2 AS \`2\` FROM \`test2\` WHERE (SELECT 3 AS \`it\` FROM (SELECT \`f1\` AS \`f1\` FROM \`test1\` WHERE \`f1\` = \`f2\` OR \`f1\` = (SELECT \`f1\` AS \`it\` FROM \`test2\`)) WHERE \`f1\` > \`it\` OR \`f1\` = \`it\`))`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                1: 1,
              },
            ]
        `);
    });

    it("select1-18.4", async () => {
        const subquery = test1
            .select((f) => ({ f1: f.f1 }))
            .where((f) => dsql`${f.f1} = ${f.f2}`)
            .select(() => ({ it: dsql(3) }))
            .where((f) => dsql`${f.f1} > ${f.it} OR ${f.f1} = ${f.it}`);

        const subquery2 = test2
            .select(() => ({ "2": dsql(2) }))
            .where(() => dsql`${subquery}`);

        const q = test1
            .commaJoinTable(test2)
            .select(() => ({ "1": dsql(1) }))
            .where(() => dsql`${subquery2}`)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT 1 AS \`1\` FROM \`test1\`, \`test2\` WHERE (SELECT 2 AS \`2\` FROM \`test2\` WHERE (SELECT 3 AS \`it\` FROM (SELECT \`f1\` AS \`f1\` FROM \`test1\` WHERE \`f1\` = \`f2\`) WHERE \`f1\` > \`it\` OR \`f1\` = \`it\`))`
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
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT test1.* FROM \`test1\`, (SELECT max(\`r2\`) AS \`r2\`, max(\`r1\`) AS \`r1\` FROM \`test2\`) AS \`it\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
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
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f1\` AS \`a\`, \`f2\` AS \`b\` FROM (SELECT test1.* FROM \`test1\`, (SELECT max(\`r2\`) AS \`r2\`, max(\`r1\`) AS \`r1\` FROM \`test2\`) AS \`it\`)`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                a: 11,
                b: 22,
              },
            ]
        `);
    });

    it("select1-11.12 -- select 1 more level2", async () => {
        const subquery = test2.select((f) => ({
            r2: max(f.r2),
            r1: max(f.r1),
        }));

        test1
            .commaJoinSelect("it", subquery)
            .selectStarOfAliases(["test1"])
            .select((f) => ({
                a: f.f1,
                b: f.f2,
                //@ts-expect-error
                c: f["it.r1"],
            }))
            .stringify();

        expect(1).toBe(1);
    });

    it("select1-11.13", async () => {
        const subquery = test2.select((f) => ({
            r2: max(f.r2),
            r1: max(f.r1),
        }));

        const q = subquery
            .commaJoinTable("it", test1)
            .selectStarOfAliases(["test1"])
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT test1.* FROM (SELECT max(\`r2\`) AS \`r2\`, max(\`r1\`) AS \`r1\` FROM \`test2\`) AS \`it\`, \`test1\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
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
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT it.* FROM (SELECT max(\`r2\`) AS \`r2\`, max(\`r1\`) AS \`r1\` FROM \`test2\`) AS \`it\`, \`test1\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                r1: 1.1,
                r2: 2.2,
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
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT it.* FROM \`test1\`, (SELECT max(\`r2\`) AS \`r2\`, max(\`r1\`) AS \`r1\` FROM \`test2\`) AS \`it\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                r1: 1.1,
                r2: 2.2,
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
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT it.*, test1.* FROM (SELECT max(\`r2\`) AS \`r2\`, max(\`r1\`) AS \`r1\` FROM \`test2\`) AS \`it\`, \`test1\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
                r1: 1.1,
                r2: 2.2,
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
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT DISTINCT it.*, test1.* FROM (SELECT max(\`r2\`) AS \`r2\`, max(\`r1\`) AS \`r1\` FROM \`test2\`) AS \`it\`, \`test1\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
                r1: 1.1,
                r2: 2.2,
              },
            ]
        `);
    });
    it("select1-17.2", async () => {
        const subquery = test2
            .selectStar()
            .where((f) => dsql`${f.r2} = 2`)
            .orderBy((f) => f.r1)
            .orderBy((f) => f.r2)
            .limit(4);

        const q = test1
            .commaJoinSelect("it", subquery)
            .selectStar()
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`test1\`, (SELECT * FROM \`test2\` WHERE \`r2\` = 2 ORDER BY \`r1\`, \`r2\` LIMIT 4) AS \`it\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("select1-6.10", async () => {
        const q1 = test1.select((f) => ({ f1: f.f1 }));
        const q2 = test1.select((f) => ({ f2: f.f2 }));

        const q = union([q1, q2])
            .orderBy((f) => f.f2)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f1\` AS \`f1\` FROM \`test1\` UNION SELECT \`f2\` AS \`f2\` FROM \`test1\` ORDER BY \`f2\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
              },
              Object {
                f1: 22,
              },
            ]
        `);
    });
    it("select1-6.10 -- order by other", async () => {
        const q1 = test1.select((f) => ({ f1: f.f1 }));
        const q2 = test1.select((f) => ({ f2: f.f2 }));

        const q = union([q1, q2])
            .orderBy((f) => f.f1)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f1\` AS \`f1\` FROM \`test1\` UNION SELECT \`f2\` AS \`f2\` FROM \`test1\` ORDER BY \`f1\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
              },
              Object {
                f1: 22,
              },
            ]
        `);
    });
    it("select1-12.5", async () => {
        const q1 = test1.selectStar();
        const q2 = fromNothing({ a: dsql(3), "4": dsql(4) });

        const q = union([q1, q2])
            .orderBy((f) => f.a)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`test1\` UNION SELECT 4 AS \`4\`, 3 AS \`a\` ORDER BY \`a\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 4,
                f2: 3,
              },
              Object {
                f1: 11,
                f2: 22,
              },
            ]
        `);
    });
    it("select1-12.6", async () => {
        const q1 = test1.selectStar();
        const q2 = fromNothing({ a: dsql(3), "4": dsql(4) });

        const q = union([q2, q1]).stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT 4 AS \`4\`, 3 AS \`a\` UNION SELECT * FROM \`test1\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                4: 4,
                a: 3,
              },
              Object {
                4: 11,
                a: 22,
              },
            ]
        `);
    });
    it("select1-6.21", async () => {
        const q1 = test1
            .select((f) => ({ f1: f.f1 }))
            .where((f) => dsql`${f.f1} < ${f.f2}`);

        const q2 = fromNothing({ x: dsql(3) });

        const u = union([q2, q1])
            .orderBy((_f) => dsql`1 DESC`)
            .limit(1);

        const q = test1
            .select((f) => ({ it: f.f1 }))
            .where((f) => dsql`${f.f1} IN ${u}`)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f1\` AS \`it\` FROM \`test1\` WHERE \`f1\` IN (SELECT 3 AS \`x\` UNION SELECT \`f1\` AS \`f1\` FROM \`test1\` WHERE \`f1\` < \`f2\` ORDER BY 1 DESC LIMIT 1)`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                it: 11,
              },
            ]
        `);
    });

    it("select1-17.3", async () => {
        const q1 = test1.selectStar().where((f) => dsql`${f.f1} < ${f.f2}`);

        const q2 = test1.selectStar().where((f) => dsql`${f.f1} > ${f.f2}`);

        const u = unionAll([q1, q2])
            .orderBy((f) => f.f1)
            .orderBy((f) => f.f2)
            .limit(1);

        const q = test1.commaJoinCompound("u", u).selectStar().stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`test1\`, (SELECT * FROM \`test1\` WHERE \`f1\` < \`f2\` UNION ALL SELECT * FROM \`test1\` WHERE \`f1\` > \`f2\` ORDER BY \`f1\`, \`f2\` LIMIT 1) AS \`u\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
              },
            ]
        `);
    });

    it("select1-17.3, except", async () => {
        const q1 = test1.selectStar().where((f) => dsql`${f.f1} < ${f.f2}`);

        const q2 = test1.selectStar().where((f) => dsql`${f.f1} > ${f.f2}`);

        const u = except([q1, q2])
            .orderBy((f) => f.f1)
            .orderBy((f) => f.f2)
            .limit(1);

        const q = test1.commaJoinCompound("u", u).selectStar().stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`test1\`, (SELECT * FROM \`test1\` WHERE \`f1\` < \`f2\` EXCEPT SELECT * FROM \`test1\` WHERE \`f1\` > \`f2\` ORDER BY \`f1\`, \`f2\` LIMIT 1) AS \`u\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
              },
            ]
        `);
    });

    it("select1-17.3, intersect", async () => {
        const q1 = test1.selectStar().where((f) => dsql`${f.f1} < ${f.f2}`);

        const q2 = test1.selectStar().where((f) => dsql`${f.f1} > ${f.f2}`);

        const u = intersect([q1, q2])
            .orderBy((f) => f.f1)
            .orderBy((f) => f.f2)
            .limit(1);

        const q = test1.commaJoinCompound("u", u).selectStar().stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`test1\`, (SELECT * FROM \`test1\` WHERE \`f1\` < \`f2\` INTERSECT SELECT * FROM \`test1\` WHERE \`f1\` > \`f2\` ORDER BY \`f1\`, \`f2\` LIMIT 1) AS \`u\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("select1-17.3 -- select comma join compound", async () => {
        const q1 = test1.selectStar().where((f) => dsql`${f.f1} < ${f.f2}`);

        const q2 = test1.selectStar().where((f) => dsql`${f.f1} > ${f.f2}`);

        const u = unionAll([q1, q2])
            .orderBy((f) => f.f1)
            .orderBy((f) => f.f2)
            .limit(1);

        const q = test1
            .selectStar()
            .commaJoinCompound("t1", "u", u)
            .selectStar()
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`test1\`) AS \`t1\`, (SELECT * FROM \`test1\` WHERE \`f1\` < \`f2\` UNION ALL SELECT * FROM \`test1\` WHERE \`f1\` > \`f2\` ORDER BY \`f1\`, \`f2\` LIMIT 1) AS \`u\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
              },
            ]
        `);
    });

    it("select1-17.3 -- limit safe string", async () => {
        const q1 = test1.selectStar().where((f) => dsql`${f.f1} < ${f.f2}`);

        const q2 = test1.selectStar().where((f) => dsql`${f.f1} > ${f.f2}`);

        const u = unionAll([q1, q2])
            .orderBy((f) => f.f1)
            .orderBy((f) => f.f2)
            .limit(dsql`1 OFFSET 10`);

        const q = test1.commaJoinCompound("u", u).selectStar().stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`test1\`, (SELECT * FROM \`test1\` WHERE \`f1\` < \`f2\` UNION ALL SELECT * FROM \`test1\` WHERE \`f1\` > \`f2\` ORDER BY \`f1\`, \`f2\` LIMIT 1 OFFSET 10) AS \`u\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("select1-17.3 -- compound select star", async () => {
        const q1 = test1.selectStar().where((f) => dsql`${f.f1} < ${f.f2}`);

        const q2 = test1.selectStar().where((f) => dsql`${f.f1} > ${f.f2}`);

        const q = unionAll([q1, q2])
            .orderBy((f) => f.f1)
            .orderBy((f) => f.f2)
            .selectStar()
            .select((f) => ({ f1: f["f1"], f2: f.f2 }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f1\` AS \`f1\`, \`f2\` AS \`f2\` FROM (SELECT * FROM (SELECT * FROM \`test1\` WHERE \`f1\` < \`f2\` UNION ALL SELECT * FROM \`test1\` WHERE \`f1\` > \`f2\` ORDER BY \`f1\`, \`f2\`))`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
              },
            ]
        `);
    });

    it("select1-12.9", async () => {
        const q1 = test1.selectStar().where((f) => dsql`${f.f1} < ${f.f2}`);

        const q2 = test1.selectStar().where((f) => dsql`${f.f1} > ${f.f2}`);

        const u = unionAll([q1, q2])
            .orderBy((f) => f.f1)
            .orderBy((f) => f.f2)
            .limit(1);

        const q = u
            .select((f) => ({ it: f.f1 }))
            .orderBy((f) => f.f2)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f1\` AS \`it\` FROM (SELECT * FROM \`test1\` WHERE \`f1\` < \`f2\` UNION ALL SELECT * FROM \`test1\` WHERE \`f1\` > \`f2\` ORDER BY \`f1\`, \`f2\` LIMIT 1) ORDER BY \`f2\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                it: 11,
              },
            ]
        `);
    });
    it("select1-12.9 -- correct types", async () => {
        const q1 = test1.selectStar().where((f) => dsql`${f.f1} < ${f.f2}`);

        const q2 = test1.selectStar().where((f) => dsql`${f.f1} > ${f.f2}`);

        const u = unionAll([q1, q2])
            .orderBy((f) => f.f1)
            .orderBy((f) => f.f2)
            .limit(1);

        const q = u
            .select((f) => ({ it: f.f1 }))
            // @ts-expect-error
            .orderBy((f) => f["test1.f2"])
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f1\` AS \`it\` FROM (SELECT * FROM \`test1\` WHERE \`f1\` < \`f2\` UNION ALL SELECT * FROM \`test1\` WHERE \`f1\` > \`f2\` ORDER BY \`f1\`, \`f2\` LIMIT 1) ORDER BY \`test1\`.\`f2\``
        );
        expect(await fail(q)).toMatchInlineSnapshot(
            `Error: SQLITE_ERROR: no such column: test1.f2`
        );
    });

    it("select1-12.10", async () => {
        const q1 = test1.selectStar().where((f) => dsql`${f.f1} < ${f.f2}`);

        const q2 = test1.selectStar().where((f) => dsql`${f.f1} > ${f.f2}`);

        const u = unionAll([q1, q2])
            .orderBy((f) => f.f1)
            .orderBy((f) => f.f2)
            .limit(1);

        const q = u
            .select((f) => ({ it: f["f1"] }))
            .orderBy((f) => f.f2)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f1\` AS \`it\` FROM (SELECT * FROM \`test1\` WHERE \`f1\` < \`f2\` UNION ALL SELECT * FROM \`test1\` WHERE \`f1\` > \`f2\` ORDER BY \`f1\`, \`f2\` LIMIT 1) ORDER BY \`f2\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                it: 11,
              },
            ]
        `);
    });

    it("select1-12.10 -- append select", async () => {
        const q1 = test1.selectStar().where((f) => dsql`${f.f1} < ${f.f2}`);

        const q2 = test1.selectStar().where((f) => dsql`${f.f1} > ${f.f2}`);

        const u = unionAll([q1, q2])
            .orderBy((f) => f.f1)
            .orderBy((f) => f.f2)
            .limit(1);

        const q = u
            .select((f) => ({ f1: f["f1"] }))
            .appendSelect((f) => ({ f2: f["f2"] }))
            .orderBy((f) => f.f2)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f1\` AS \`f1\`, \`f2\` AS \`f2\` FROM (SELECT * FROM \`test1\` WHERE \`f1\` < \`f2\` UNION ALL SELECT * FROM \`test1\` WHERE \`f1\` > \`f2\` ORDER BY \`f1\`, \`f2\` LIMIT 1) ORDER BY \`f2\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
              },
            ]
        `);
    });

    it("select1-12.10 -- main alias 1 query", async () => {
        const q = test1
            .selectStar()
            .where((f) => dsql`${f.f1} < ${f.f2}`)
            .select((f) => ({ f1: f["f1"] }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f1\` AS \`f1\` FROM (SELECT * FROM \`test1\` WHERE \`f1\` < \`f2\`)`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
              },
            ]
        `);
    });
    it("select1-12.10 -- main alias", async () => {
        const q = test1
            .select((f) => ({ f1: f["test1.f1"], f2: f["test1.f2"] }))
            .where((f) => dsql`${f.f1} < ${f.f2}`)
            .select((f) => ({ f1: f["f1"] }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f1\` AS \`f1\` FROM (SELECT \`test1\`.\`f1\` AS \`f1\`, \`test1\`.\`f2\` AS \`f2\` FROM \`test1\` WHERE \`f1\` < \`f2\`)`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
              },
            ]
        `);
    });
    it("select1-12.10 -- main alias append", async () => {
        const q = test1
            .selectStar()
            .appendSelect((f) => ({ f1: f["test1.f1"] }))
            .where((f) => dsql`${f.f1} < ${f.f2}`)
            .select((f) => ({ f1: f["f1"] }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f1\` AS \`f1\` FROM (SELECT *, \`test1\`.\`f1\` AS \`f1\` FROM \`test1\` WHERE \`f1\` < \`f2\`)`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
              },
            ]
        `);
    });

    it("select1-12.10 -- main alias append 2", async () => {
        const q = test1
            .selectStar()
            .appendSelect((f) => ({ f1: f["test1.f1"] }))
            .where((f) => dsql`${f.f1} < ${f.f2}`)
            .select((f) => ({ f1: f["f1"] }))
            .appendSelect((f) => ({ f2: f["f2"] }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`f1\` AS \`f1\`, \`f2\` AS \`f2\` FROM (SELECT *, \`test1\`.\`f1\` AS \`f1\` FROM \`test1\` WHERE \`f1\` < \`f2\`)`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                f1: 11,
                f2: 22,
              },
            ]
        `);
    });
});
