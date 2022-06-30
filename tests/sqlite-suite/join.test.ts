import { SafeString, sql, table } from "../../src";
import { configureSqlite } from "../utils";
import { addSimpleStringSerializer } from "../utils";
addSimpleStringSerializer();

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
        const q = t1
            .joinTable("NATURAL", t2)
            .noConstraint()
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\` NATURAL JOIN \`t2\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                a: 1,
                b: 2,
                c: 3,
                d: 4,
              },
              Object {
                a: 2,
                b: 3,
                c: 4,
                d: 5,
              },
            ]
        `);
    });

    it("join-1.3 -- with comma join select", async () => {
        const q = t1
            .joinTable("NATURAL", t2)
            .noConstraint()
            .commaJoinSelect("t3", t2.selectStar())
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\`, (SELECT * FROM \`t2\`) AS \`t3\` NATURAL JOIN \`t2\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                a: 1,
                b: 2,
                c: 3,
                d: 4,
              },
              Object {
                a: 2,
                b: 3,
                c: 4,
                d: 5,
              },
            ]
        `);
    });

    it("join-1.3.2", async () => {
        const q = table(["a", "b", "c"], "x", "t1")
            .joinTable("NATURAL", t2)
            .noConstraint()
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\` AS \`x\` NATURAL JOIN \`t2\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                a: 1,
                b: 2,
                c: 3,
                d: 4,
              },
              Object {
                a: 2,
                b: 3,
                c: 4,
                d: 5,
              },
            ]
        `);
    });

    it("join-1.3.3", async () => {
        const q = t1
            .joinTable("NATURAL", table(["b", "c", "d"], "y", "t2"))
            .noConstraint()
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\` NATURAL JOIN \`t2\` AS \`y\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                a: 1,
                b: 2,
                c: 3,
                d: 4,
              },
              Object {
                a: 2,
                b: 3,
                c: 4,
                d: 5,
              },
            ]
        `);
    });

    it("join-1.3.5", async () => {
        const q = t2
            .joinTable("NATURAL", t1)
            .noConstraint()
            .selectStarOfAliases(["t2"])
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT t2.* FROM \`t2\` NATURAL JOIN \`t1\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                b: 2,
                c: 3,
                d: 4,
              },
              Object {
                b: 3,
                c: 4,
                d: 5,
              },
            ]
        `);
    });
    it("join-1.3.6", async () => {
        const q = table(["b", "c", "d"], "xyzzy", "t2")
            .joinTable("NATURAL", t1)
            .noConstraint()
            .selectStarOfAliases(["xyzzy"])
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT xyzzy.* FROM \`t2\` AS \`xyzzy\` NATURAL JOIN \`t1\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                b: 2,
                c: 3,
                d: 4,
              },
              Object {
                b: 3,
                c: 4,
                d: 5,
              },
            ]
        `);
    });

    it("join-1.3.7", async () => {
        const q = t2
            .joinTable("NATURAL", t1)
            .noConstraint()
            .selectStarOfAliases(["t1"])
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT t1.* FROM \`t2\` NATURAL JOIN \`t1\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                a: 1,
                b: 2,
                c: 3,
              },
              Object {
                a: 2,
                b: 3,
                c: 4,
              },
            ]
        `);
    });

    it("join-1.3.8", async () => {
        const q = t2
            .joinTable("NATURAL", table(["a", "b", "c"], "xyzzy", "t1"))
            .noConstraint()
            .selectStarOfAliases(["xyzzy"])
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT xyzzy.* FROM \`t2\` NATURAL JOIN \`t1\` AS \`xyzzy\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                a: 1,
                b: 2,
                c: 3,
              },
              Object {
                a: 2,
                b: 3,
                c: 4,
              },
            ]
        `);
    });

    it("join-1.3.9", async () => {
        const q = table(["b", "c", "d"], "aaa", "t2")
            .joinTable("NATURAL", table(["a", "b", "c"], "bbb", "t1"))
            .noConstraint()
            .selectStarOfAliases(["aaa", "bbb"])
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT aaa.*, bbb.* FROM \`t2\` AS \`aaa\` NATURAL JOIN \`t1\` AS \`bbb\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                a: 1,
                b: 2,
                c: 3,
                d: 4,
              },
              Object {
                a: 2,
                b: 3,
                c: 4,
                d: 5,
              },
            ]
        `);
    });

    it("join-1.3.10", async () => {
        const q = t2
            .joinTable("NATURAL", t1)
            .noConstraint()
            .selectStarOfAliases(["t1", "t2"])
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT t1.*, t2.* FROM \`t2\` NATURAL JOIN \`t1\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                a: 1,
                b: 2,
                c: 3,
                d: 4,
              },
              Object {
                a: 2,
                b: 3,
                c: 4,
                d: 5,
              },
            ]
        `);
    });
    it("join-1.4.1", async () => {
        const q = t2
            .joinTable("INNER", t1)
            .on((f) => [
                equals(f["t1.b"], f["t2.b"]),
                equals(f["t1.c"], f["t2.c"]),
            ])
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t2\` INNER JOIN \`t1\` ON \`t1\`.\`b\` = \`t2\`.\`b\` AND \`t1\`.\`c\` = \`t2\`.\`c\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                a: 1,
                b: 2,
                c: 3,
                d: 4,
              },
              Object {
                a: 2,
                b: 3,
                c: 4,
                d: 5,
              },
            ]
        `);
    });
    it("join-1.4.1 -- using", async () => {
        const q = t2
            .joinTable("INNER", t1)
            .using(["b", "c"])
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t2\` INNER JOIN \`t1\` USING(\`b\`, \`c\`)`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                a: 1,
                b: 2,
                c: 3,
                d: 4,
              },
              Object {
                a: 2,
                b: 3,
                c: 4,
                d: 5,
              },
            ]
        `);
    });
    it("join-1.4.1 -- using knows types", async () => {
        const q = t2
            .joinTable("INNER", t1)
            // @ts-expect-error
            .using(["b", "c", "d"])
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t2\` INNER JOIN \`t1\` USING(\`b\`, \`c\`, \`d\`)`
        );
        expect(await fail(q)).toMatchInlineSnapshot(
            `Error: SQLITE_ERROR: cannot join using column d - column not present in both tables`
        );
    });
    it("join-1.4.1 -- prevents ambiguous", async () => {
        const q = t2
            .joinTable("INNER", t1)
            .on((f) => [
                // @ts-expect-error
                equals(f.b, f["t2.b"]),
                equals(f["t1.c"], f["t2.c"]),
            ])
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t2\` INNER JOIN \`t1\` ON \`b\` = \`t2\`.\`b\` AND \`t1\`.\`c\` = \`t2\`.\`c\``
        );
        expect(await fail(q)).toMatchInlineSnapshot(
            `Error: SQLITE_ERROR: ambiguous column name: b`
        );
    });
    it("join-1.4.1 -- prevents unknown", async () => {
        const q = t2
            .joinTable("INNER", t1)
            .on((f) => [
                // @ts-expect-error
                equals(f.aaaaaaaaaaa, f["t2.b"]),
                equals(f["t1.c"], f["t2.c"]),
            ])
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t2\` INNER JOIN \`t1\` ON \`aaaaaaaaaaa\` = \`t2\`.\`b\` AND \`t1\`.\`c\` = \`t2\`.\`c\``
        );
        expect(await fail(q)).toMatchInlineSnapshot(
            `Error: SQLITE_ERROR: no such column: aaaaaaaaaaa`
        );
    });

    it("join-1.4.2", async () => {
        const q = t2
            .joinTable("INNER", table(["a", "b", "c"], "x", "t1"))
            .on((f) => [
                equals(f["x.b"], f["t2.b"]),
                equals(f["x.c"], f["t2.c"]),
            ])
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t2\` INNER JOIN \`t1\` AS \`x\` ON \`x\`.\`b\` = \`t2\`.\`b\` AND \`x\`.\`c\` = \`t2\`.\`c\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                a: 1,
                b: 2,
                c: 3,
                d: 4,
              },
              Object {
                a: 2,
                b: 3,
                c: 4,
                d: 5,
              },
            ]
        `);
    });

    it("join-1.4.2 -- using", async () => {
        const q = t2
            .joinTable("INNER", table(["a", "b", "c"], "x", "t1"))
            .using(["b", "c"])
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t2\` INNER JOIN \`t1\` AS \`x\` USING(\`b\`, \`c\`)`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                a: 1,
                b: 2,
                c: 3,
                d: 4,
              },
              Object {
                a: 2,
                b: 3,
                c: 4,
                d: 5,
              },
            ]
        `);
    });
    it("join-1.4.3", async () => {
        const q = table(["b", "c", "d"], "y", "t2")
            .joinTable("INNER", t1)
            .on((f) => [
                equals(f["t1.b"], f["y.b"]),
                equals(f["t1.c"], f["y.c"]),
            ])
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t2\` AS \`y\` INNER JOIN \`t1\` ON \`t1\`.\`b\` = \`y\`.\`b\` AND \`t1\`.\`c\` = \`y\`.\`c\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                a: 1,
                b: 2,
                c: 3,
                d: 4,
              },
              Object {
                a: 2,
                b: 3,
                c: 4,
                d: 5,
              },
            ]
        `);
    });
    it("join-1.4.3 -- using", async () => {
        const q = table(["b", "c", "d"], "y", "t2")
            .joinTable("INNER", t1)
            .using(["b", "c"])
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t2\` AS \`y\` INNER JOIN \`t1\` USING(\`b\`, \`c\`)`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                a: 1,
                b: 2,
                c: 3,
                d: 4,
              },
              Object {
                a: 2,
                b: 3,
                c: 4,
                d: 5,
              },
            ]
        `);
    });
    it("join-1.4.4", async () => {
        const q = table(["b", "c", "d"], "y", "t2")
            .joinTable("INNER", table(["a", "b", "c"], "x", "t1"))
            .on((f) => [equals(f["x.b"], f["y.b"]), equals(f["x.c"], f["y.c"])])
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t2\` AS \`y\` INNER JOIN \`t1\` AS \`x\` ON \`x\`.\`b\` = \`y\`.\`b\` AND \`x\`.\`c\` = \`y\`.\`c\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                a: 1,
                b: 2,
                c: 3,
                d: 4,
              },
              Object {
                a: 2,
                b: 3,
                c: 4,
                d: 5,
              },
            ]
        `);
    });
    it("join-1.4.4 -- using", async () => {
        const q = table(["b", "c", "d"], "y", "t2")
            .joinTable("INNER", table(["a", "b", "c"], "x", "t1"))
            .using(["b", "c"])
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t2\` AS \`y\` INNER JOIN \`t1\` AS \`x\` USING(\`b\`, \`c\`)`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                a: 1,
                b: 2,
                c: 3,
                d: 4,
              },
              Object {
                a: 2,
                b: 3,
                c: 4,
                d: 5,
              },
            ]
        `);
    });
    it("join-1.4.5", async () => {
        const q = t2
            .joinTable("INNER", t1)
            .on((f) => [equals(f["t1.b"], f["t2.b"])])
            .select((f) => ({
                b:
                    // @ts-expect-error
                    f.b,
            }))
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT \`b\` AS \`b\` FROM \`t2\` INNER JOIN \`t1\` ON \`t1\`.\`b\` = \`t2\`.\`b\``
        );
        expect(await fail(q)).toMatchInlineSnapshot(
            `Error: SQLITE_ERROR: ambiguous column name: b`
        );
    });

    it("join-2.4", async () => {
        const q = t2
            .joinTable("LEFT", t1)
            .on((f) => [equals(f["t1.a"], f["t2.d"])])
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t2\` LEFT JOIN \`t1\` ON \`t1\`.\`a\` = \`t2\`.\`d\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                a: 3,
                b: 4,
                c: 5,
                d: 3,
              },
              Object {
                a: null,
                b: null,
                c: null,
                d: 4,
              },
              Object {
                a: null,
                b: null,
                c: null,
                d: 5,
              },
            ]
        `);
    });
    it("join-2.5", async () => {
        const q = t2
            .joinTable("LEFT", t1)
            .on((f) => [equals(f["t1.a"], f["t2.d"])])
            .selectStar()
            .where((f) => sql`${f["t1.a"]} > 1`)
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t2\` LEFT JOIN \`t1\` ON \`t1\`.\`a\` = \`t2\`.\`d\` WHERE \`t1\`.\`a\` > 1`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                a: 3,
                b: 4,
                c: 5,
                d: 3,
              },
            ]
        `);
    });
    it("join-2.6", async () => {
        const q = t1
            .joinTable("LEFT", t2)
            .on((f) => [equals(f["t1.a"], f["t2.d"])])
            .selectStar()
            .where((f) => sql`${f["t1.b"]} IS NULL OR ${f["t1.b"]} > 1`)
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\` LEFT JOIN \`t2\` ON \`t1\`.\`a\` = \`t2\`.\`d\` WHERE \`t1\`.\`b\` IS NULL OR \`t1\`.\`b\` > 1`
        );
        expect(await run(q)).toMatchInlineSnapshot(`
            Array [
              Object {
                a: 1,
                b: null,
                c: null,
                d: null,
              },
              Object {
                a: 2,
                b: null,
                c: null,
                d: null,
              },
              Object {
                a: 3,
                b: 1,
                c: 2,
                d: 3,
              },
            ]
        `);
    });
});
