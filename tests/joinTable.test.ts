import {
    castSafe,
    fromStringifiedSelectStatement,
    SafeString,
    sql,
    table,
    unionAll,
} from "../src";
import { addSimpleStringSerializer } from "./utils";
addSimpleStringSerializer();

const equals = (a: SafeString, b: SafeString) => sql`${a} = ${b}`;

describe("joinTable", () => {
    const t1 = table(["a", "b", "c"], "t1");
    const t2 = table(["b", "c", "d"], "t2");
    const t3 = table(["c", "d", "e"], "t3");
    const str1 = fromStringifiedSelectStatement<"a" | "b" | "c">(
        castSafe(t1.selectStar().stringify())
    );
    /*
    CREATE TABLE t1(a,b,c);
    INSERT INTO t1 VALUES(1,2,3);
    INSERT INTO t1 VALUES(2,3,4);
    INSERT INTO t1 VALUES(3,4,5);
    CREATE TABLE t2(b,c,d);
    INSERT INTO t2 VALUES(1,2,3);
    INSERT INTO t2 VALUES(2,3,4);
    INSERT INTO t2 VALUES(3,4,5);
    CREATE TABLE t3(c,d,e);
    INSERT INTO t2 VALUES(1,2,3);
    INSERT INTO t2 VALUES(2,3,4);
    INSERT INTO t2 VALUES(3,4,5);
    */

    it("table -> table", async () => {
        const q = t1
            .joinTable("NATURAL", t2)
            .noConstraint()
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\` NATURAL JOIN \`t2\``
        );
    });

    it("table -> table -- select", async () => {
        const q = t1
            .joinTable("NATURAL", t2)
            .noConstraint()
            .select((f) => ({ x: f.a, y: f.d, z: f["t1.c"] }))
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT \`a\` AS \`x\`, \`d\` AS \`y\`, \`t1\`.\`c\` AS \`z\` FROM \`t1\` NATURAL JOIN \`t2\``
        );
    });

    it("table -> table -- prevents ambiguous", async () => {
        const q = t1
            .joinTable("LEFT", t2)
            .noConstraint()
            .select((f) => ({
                x: f.a,
                y: f.d,
                // @ts-expect-error
                z: f.c,
            }))
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT \`a\` AS \`x\`, \`d\` AS \`y\`, \`c\` AS \`z\` FROM \`t1\` LEFT JOIN \`t2\``
        );
    });

    it("table -> table -- ON", async () => {
        const q = t1
            .joinTable("LEFT", t2)
            .on((f) => equals(f.a, f.d))
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\` LEFT JOIN \`t2\` ON \`a\` = \`d\``
        );
    });

    it("table -> table -- ON QUALIFIED", async () => {
        const q = t1
            .joinTable("LEFT", t2)
            .on((f) => equals(f["t1.a"], f["t2.d"]))
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\` LEFT JOIN \`t2\` ON \`t1\`.\`a\` = \`t2\`.\`d\``
        );
    });

    it("table -> table -- USING", async () => {
        const q = t1
            .joinTable("LEFT", t2)
            .using(["b"])
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\` LEFT JOIN \`t2\` USING(\`b\`)`
        );
    });

    it("table -> table -- NO CONSTRAINT", async () => {
        const q = t1
            .joinTable("LEFT", t2)
            .noConstraint()
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\` LEFT JOIN \`t2\``
        );
    });

    it("select -> table", async () => {
        const q = t1
            .selectStar()
            .joinTable("q1", "NATURAL", t2)
            .noConstraint()
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`q1\` NATURAL JOIN \`t2\``
        );
    });

    it("select -> table -- select", async () => {
        const q = t1
            .selectStar()
            .joinTable("q1", "NATURAL", t2)
            .noConstraint()
            .select((f) => ({ x: f.a, y: f.d, z: f["q1.c"] }))
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT \`a\` AS \`x\`, \`d\` AS \`y\`, \`q1\`.\`c\` AS \`z\` FROM (SELECT * FROM \`t1\`) AS \`q1\` NATURAL JOIN \`t2\``
        );
    });

    it("select -> table -- prevents ambigous", async () => {
        const q = t1
            .selectStar()
            .joinTable("q1", "LEFT", t2)
            .noConstraint()
            .select((f) => ({
                x: f.a,
                y: f.d,
                // @ts-expect-error
                z: f.c,
            }))
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT \`a\` AS \`x\`, \`d\` AS \`y\`, \`c\` AS \`z\` FROM (SELECT * FROM \`t1\`) AS \`q1\` LEFT JOIN \`t2\``
        );
    });

    it("select -> table -- ON", async () => {
        const q = t1
            .selectStar()
            .joinTable("q1", "LEFT", t2)
            .on((f) => equals(f.a, f.d))
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`q1\` LEFT JOIN \`t2\` ON \`a\` = \`d\``
        );
    });

    it("select -> table -- ON QUALIFIED", async () => {
        const q = t1
            .selectStar()
            .joinTable("q1", "LEFT", t2)
            .on((f) => equals(f["q1.a"], f["t2.d"]))
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`q1\` LEFT JOIN \`t2\` ON \`q1\`.\`a\` = \`t2\`.\`d\``
        );
    });

    it("select -> table -- USING", async () => {
        const q = t1
            .selectStar()
            .joinTable("q1", "LEFT", t2)
            .using(["b"])
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`q1\` LEFT JOIN \`t2\` USING(\`b\`)`
        );
    });

    it("select -> table -- NO CONSTRAIN", async () => {
        const q = t1
            .selectStar()
            .joinTable("q1", "LEFT", t2)
            .noConstraint()
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`q1\` LEFT JOIN \`t2\``
        );
    });

    it("stringigied select -> table", async () => {
        const q = str1
            .joinTable("q1", "NATURAL", t2)
            .noConstraint()
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`q1\` NATURAL JOIN \`t2\``
        );
    });

    it("stringified select -> table -- select", async () => {
        const q = str1
            .joinTable("q1", "NATURAL", t2)
            .noConstraint()
            .select((f) => ({ x: f.a, y: f.d, z: f["q1.c"] }))
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT \`a\` AS \`x\`, \`d\` AS \`y\`, \`q1\`.\`c\` AS \`z\` FROM (SELECT * FROM \`t1\`) AS \`q1\` NATURAL JOIN \`t2\``
        );
    });

    it("stringified select -> table -- prevents ambigous", async () => {
        const q = str1
            .joinTable("q1", "LEFT", t2)
            .noConstraint()
            .select((f) => ({
                x: f.a,
                y: f.d,
                // @ts-expect-error
                z: f.c,
            }))
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT \`a\` AS \`x\`, \`d\` AS \`y\`, \`c\` AS \`z\` FROM (SELECT * FROM \`t1\`) AS \`q1\` LEFT JOIN \`t2\``
        );
    });

    it("stringified select -> table -- ON", async () => {
        const q = str1
            .joinTable("q1", "LEFT", t2)
            .on((f) => equals(f.a, f.d))
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`q1\` LEFT JOIN \`t2\` ON \`a\` = \`d\``
        );
    });

    it("stringified select -> table -- ON QUALIFIED", async () => {
        const q = str1
            .joinTable("q1", "LEFT", t2)
            .on((f) => equals(f["q1.a"], f["t2.d"]))
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`q1\` LEFT JOIN \`t2\` ON \`q1\`.\`a\` = \`t2\`.\`d\``
        );
    });

    it("stringified select -> table -- USING", async () => {
        const q = str1
            .joinTable("q1", "LEFT", t2)
            .using(["b"])
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`q1\` LEFT JOIN \`t2\` USING(\`b\`)`
        );
    });

    it("stringified select -> table -- NO CONSTRAIN", async () => {
        const q = str1
            .joinTable("q1", "LEFT", t2)
            .noConstraint()
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`q1\` LEFT JOIN \`t2\``
        );
    });

    it("joined -> table", async () => {
        const q = t1
            .joinTable("NATURAL", t2)
            .noConstraint()
            .joinTable("NATURAL", t1)
            .noConstraint()
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\` NATURAL JOIN \`t2\` NATURAL JOIN \`t1\``
        );
    });

    it("joined -> table -- select", async () => {
        const q = t1
            .joinTable("NATURAL", t2)
            .noConstraint()
            .joinTable("NATURAL", t3)
            .noConstraint()
            .select((f) => ({ x: f.a, y: f.e, d: f["t2.d"], d2: f["t3.d"] }))
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT \`a\` AS \`x\`, \`e\` AS \`y\`, \`t2\`.\`d\` AS \`d\`, \`t3\`.\`d\` AS \`d2\` FROM \`t1\` NATURAL JOIN \`t2\` NATURAL JOIN \`t3\``
        );
    });

    it("joined -> table -- prevents ambigous", async () => {
        const q = t1
            .joinTable("NATURAL", t2)
            .noConstraint()
            .joinTable("LEFT", t3)
            // @ts-expect-error
            .on((f) => equals(f.b, f.e))
            .selectStar()
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\` NATURAL JOIN \`t2\` LEFT JOIN \`t3\` ON \`b\` = \`e\``
        );
    });
    it("joined -> table -- ON", async () => {
        const q = t1
            .joinTable("NATURAL", t2)
            .noConstraint()
            .joinTable("LEFT", t3)
            .on((f) => equals(f.a, f.e))
            .selectStar()
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\` NATURAL JOIN \`t2\` LEFT JOIN \`t3\` ON \`a\` = \`e\``
        );
    });
    it("joined -> table -- ON QUALIFIED", async () => {
        const q = t1
            .joinTable("NATURAL", t2)
            .noConstraint()
            .joinTable("LEFT", t3)
            .on((f) => equals(f["t1.a"], f["t3.e"]))
            .selectStar()
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\` NATURAL JOIN \`t2\` LEFT JOIN \`t3\` ON \`t1\`.\`a\` = \`t3\`.\`e\``
        );
    });
    it("joined -> table -- USING", async () => {
        const q = t1
            .joinTable("NATURAL", t2)
            .noConstraint()
            .joinTable("LEFT", t3)
            .using(["d"])
            .selectStar()
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\` NATURAL JOIN \`t2\` LEFT JOIN \`t3\` USING(\`d\`)`
        );
    });
    it("joined -> table -- NO CONSTRAINT", async () => {
        const q = t1
            .joinTable("NATURAL", t2)
            .noConstraint()
            .joinTable("LEFT", t3)
            .noConstraint()
            .selectStar()
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\` NATURAL JOIN \`t2\` LEFT JOIN \`t3\``
        );
    });

    it("compound -> table", async () => {
        const q = unionAll([t1.selectStar(), t3.selectStar()])
            .joinTable("q1", "NATURAL", t2)
            .noConstraint()
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t3\`) AS \`q1\` NATURAL JOIN \`t2\``
        );
    });

    it("compound -> table -- select", async () => {
        const a = t1.selectStar();
        const b = t3.selectStar();
        const u = unionAll([a, b]);
        const q = u
            .joinTable("q1", "NATURAL", t2)
            .noConstraint()
            .select((f) => ({ x: f.a, e: f.d }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`a\` AS \`x\`, \`d\` AS \`e\` FROM (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t3\`) AS \`q1\` NATURAL JOIN \`t2\``
        );
    });

    it("compound -> table -- prevents ambigous", async () => {
        const a = t1.selectStar();
        const b = t3.selectStar();
        const u = unionAll([a, b]);
        const q = u
            .joinTable("q1", "NATURAL", t2)
            .noConstraint()
            // @ts-expect-error
            .select((f) => ({ x: f.a, e: f.b }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`a\` AS \`x\`, \`b\` AS \`e\` FROM (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t3\`) AS \`q1\` NATURAL JOIN \`t2\``
        );
    });

    it("compound -> table -- ON", async () => {
        const q = unionAll([t1.selectStar(), t3.selectStar()])
            .joinTable("q1", "LEFT", t2)
            .on((f) => equals(f.a, f["q1.b"]))
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t3\`) AS \`q1\` LEFT JOIN \`t2\` ON \`a\` = \`q1\`.\`b\``
        );
    });

    it("compound -> table -- ON QUALIFIED", async () => {
        const q = unionAll([t1.selectStar(), t3.selectStar()])
            .joinTable("q1", "LEFT", t2)
            .on((f) => equals(f["q1.a"], f["q1.b"]))
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t3\`) AS \`q1\` LEFT JOIN \`t2\` ON \`q1\`.\`a\` = \`q1\`.\`b\``
        );
    });

    it("compound -> table -- USING", async () => {
        const q = unionAll([t1.selectStar(), t3.selectStar()])
            .joinTable("q1", "LEFT", t2)
            .using(["b"])
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t3\`) AS \`q1\` LEFT JOIN \`t2\` USING(\`b\`)`
        );
    });

    it("compound -> table -- NO CONSTRAINT", async () => {
        const q = unionAll([t1.selectStar(), t3.selectStar()])
            .joinTable("q1", "LEFT", t2)
            .noConstraint()
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t3\`) AS \`q1\` LEFT JOIN \`t2\``
        );
    });
});
