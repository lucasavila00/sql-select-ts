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

describe("joinSelect", () => {
    const t1 = table(["a", "b", "c"], "t1");
    const t2 = table(["b", "c", "d"], "t2");
    const t3 = table(["c", "d", "e"], "t3");
    const q1 = t1.selectStar();
    const q2 = t2.selectStar();
    const q3 = t3.selectStar();
    const str1 = fromStringifiedSelectStatement<"a" | "b" | "c">(
        castSafe(q1.stringify())
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

    it("table -> select", async () => {
        const q = t1
            .joinSelect("q2", "NATURAL", q2)
            .noConstraint()
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\` NATURAL JOIN (SELECT * FROM \`t2\`) AS \`q2\``
        );
    });

    it("table -> select -- select", async () => {
        const q = t1
            .joinSelect("q2", "NATURAL", q2)
            .noConstraint()
            .select((f) => ({ x: f.a, y: f.d, z: f["t1.c"] }))
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT \`a\` AS \`x\`, \`d\` AS \`y\`, \`t1\`.\`c\` AS \`z\` FROM \`t1\` NATURAL JOIN (SELECT * FROM \`t2\`) AS \`q2\``
        );
    });

    it("table -> select -- ON", async () => {
        const q = t1
            .joinSelect("q2", "LEFT", q2)
            .on((f) => equals(f.a, f.d))
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\` LEFT JOIN (SELECT * FROM \`t2\`) AS \`q2\` ON \`a\` = \`d\``
        );
    });

    it("table -> select -- ON QUALIFIED", async () => {
        const q = t1
            .joinSelect("q2", "LEFT", q2)
            .on((f) => equals(f["t1.a"], f["q2.d"]))
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\` LEFT JOIN (SELECT * FROM \`t2\`) AS \`q2\` ON \`t1\`.\`a\` = \`q2\`.\`d\``
        );
    });

    it("table -> select -- USING", async () => {
        const q = t1
            .joinSelect("q2", "LEFT", q2)
            .using(["b"])
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\` LEFT JOIN (SELECT * FROM \`t2\`) AS \`q2\` USING(\`b\`)`
        );
    });

    it("table -> select -- NO CONSTRAINT", async () => {
        const q = t1
            .joinSelect("q2", "LEFT", q2)
            .using(["b"])
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\` LEFT JOIN (SELECT * FROM \`t2\`) AS \`q2\` USING(\`b\`)`
        );
    });

    it("select -> select", async () => {
        const q = q1
            .joinSelect("q1", "NATURAL", "q2", q2)
            .noConstraint()
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`q1\` NATURAL JOIN (SELECT * FROM \`t2\`) AS \`q2\``
        );
    });

    it("select -> select -- select", async () => {
        const q = q1
            .joinSelect("q1", "NATURAL", "q2", q2)
            .noConstraint()
            .select((f) => ({ x: f.a, y: f.d, z: f["q1.c"] }))
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT \`a\` AS \`x\`, \`d\` AS \`y\`, \`q1\`.\`c\` AS \`z\` FROM (SELECT * FROM \`t1\`) AS \`q1\` NATURAL JOIN (SELECT * FROM \`t2\`) AS \`q2\``
        );
    });
    it("select -> select -- ON", async () => {
        const q = q1
            .joinSelect("q1", "LEFT", "q2", q2)
            .on((f) => equals(f.a, f.d))
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`q1\` LEFT JOIN (SELECT * FROM \`t2\`) AS \`q2\` ON \`a\` = \`d\``
        );
    });

    it("select -> select -- ON QUALIFIED", async () => {
        const q = q1
            .joinSelect("q1", "LEFT", "q2", q2)
            .on((f) => equals(f["q1.a"], f["q2.d"]))
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`q1\` LEFT JOIN (SELECT * FROM \`t2\`) AS \`q2\` ON \`q1\`.\`a\` = \`q2\`.\`d\``
        );
    });
    it("select -> select -- USING", async () => {
        const q = q1
            .joinSelect("q1", "LEFT", "q2", q2)
            .using(["b"])
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`q1\` LEFT JOIN (SELECT * FROM \`t2\`) AS \`q2\` USING(\`b\`)`
        );
    });

    it("select -> select -- NO CONSTRAINT", async () => {
        const q = q1
            .joinSelect("q1", "NATURAL", "q2", q2)
            .noConstraint()
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`q1\` NATURAL JOIN (SELECT * FROM \`t2\`) AS \`q2\``
        );
    });

    it("stringified select -> select", async () => {
        const q = str1
            .joinSelect("q1", "NATURAL", "q2", q2)
            .noConstraint()
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`q1\` NATURAL JOIN (SELECT * FROM \`t2\`) AS \`q2\``
        );
    });

    it("stringified select -> select -- select", async () => {
        const q = str1
            .joinSelect("q1", "NATURAL", "q2", q2)
            .noConstraint()
            .select((f) => ({ x: f.a, y: f.d, z: f["q1.c"] }))
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT \`a\` AS \`x\`, \`d\` AS \`y\`, \`q1\`.\`c\` AS \`z\` FROM (SELECT * FROM \`t1\`) AS \`q1\` NATURAL JOIN (SELECT * FROM \`t2\`) AS \`q2\``
        );
    });

    it("stringified select -> select -- ON", async () => {
        const q = str1
            .joinSelect("q1", "LEFT", "q2", q2)
            .on((f) => equals(f.a, f.d))
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`q1\` LEFT JOIN (SELECT * FROM \`t2\`) AS \`q2\` ON \`a\` = \`d\``
        );
    });

    it("stringified select -> select -- ON QUALIFIED", async () => {
        const q = str1
            .joinSelect("q1", "LEFT", "q2", q2)
            .on((f) => equals(f["q1.a"], f["q2.d"]))
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`q1\` LEFT JOIN (SELECT * FROM \`t2\`) AS \`q2\` ON \`q1\`.\`a\` = \`q2\`.\`d\``
        );
    });
    it("stringified select -> select -- USING", async () => {
        const q = str1
            .joinSelect("q1", "LEFT", "q2", q2)
            .using(["b"])
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`q1\` LEFT JOIN (SELECT * FROM \`t2\`) AS \`q2\` USING(\`b\`)`
        );
    });

    it("stringified select -> select -- NO CONSTRAINT", async () => {
        const q = str1
            .joinSelect("q1", "NATURAL", "q2", q2)
            .noConstraint()
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`q1\` NATURAL JOIN (SELECT * FROM \`t2\`) AS \`q2\``
        );
    });

    it("joined -> select", async () => {
        const q = q1
            .joinSelect("q1", "NATURAL", "q2", q2)
            .noConstraint()
            .joinSelect("NATURAL", "q3", q3)
            .noConstraint()
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`q1\` NATURAL JOIN (SELECT * FROM \`t2\`) AS \`q2\` NATURAL JOIN (SELECT * FROM \`t3\`) AS \`q3\``
        );
    });

    it("joined -> select -- select", async () => {
        const q = q1
            .joinSelect("q1", "NATURAL", "q2", q2)
            .noConstraint()
            .joinSelect("NATURAL", "q3", q3)
            .noConstraint()
            .select((f) => ({ x: f.a, y: f["q2.d"], z: f["q1.c"] }))
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT \`a\` AS \`x\`, \`q2\`.\`d\` AS \`y\`, \`q1\`.\`c\` AS \`z\` FROM (SELECT * FROM \`t1\`) AS \`q1\` NATURAL JOIN (SELECT * FROM \`t2\`) AS \`q2\` NATURAL JOIN (SELECT * FROM \`t3\`) AS \`q3\``
        );
    });
    it("joined -> select -- ON", async () => {
        const q = q1
            .joinSelect("q1", "NATURAL", "q2", q2)
            .noConstraint()
            .joinSelect("LEFT", "q3", q3)
            .on((f) => equals(f.a, f["q2.d"]))
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`q1\` NATURAL JOIN (SELECT * FROM \`t2\`) AS \`q2\` LEFT JOIN (SELECT * FROM \`t3\`) AS \`q3\` ON \`a\` = \`q2\`.\`d\``
        );
    });

    it("joined -> select -- ON QUALIFIED", async () => {
        const q = q1
            .joinSelect("q1", "NATURAL", "q2", q2)
            .noConstraint()
            .joinSelect("LEFT", "q3", q3)
            .on((f) => equals(f["q1.a"], f["q2.d"]))
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`q1\` NATURAL JOIN (SELECT * FROM \`t2\`) AS \`q2\` LEFT JOIN (SELECT * FROM \`t3\`) AS \`q3\` ON \`q1\`.\`a\` = \`q2\`.\`d\``
        );
    });

    it("joined -> select -- NO CONSTRAINT", async () => {
        const q = q1
            .joinSelect("q1", "LEFT", "q2", q2)
            .noConstraint()
            .joinSelect("NATURAL", "q3", q3)
            .noConstraint()
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`q1\` LEFT JOIN (SELECT * FROM \`t2\`) AS \`q2\` NATURAL JOIN (SELECT * FROM \`t3\`) AS \`q3\``
        );
    });

    it("compound -> select", async () => {
        const q = unionAll([q1, q2])
            .joinSelect("u", "NATURAL", "q3", q3)
            .noConstraint()
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\` NATURAL JOIN (SELECT * FROM \`t3\`) AS \`q3\``
        );
    });

    it("compound -> select -- select", async () => {
        const q = unionAll([q1, q2])
            .joinSelect("u", "NATURAL", "q3", q3)
            .noConstraint()
            .select((f) => ({ x: f.a, y: f.d, z: f["u.c"] }))
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT \`a\` AS \`x\`, \`d\` AS \`y\`, \`u\`.\`c\` AS \`z\` FROM (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\` NATURAL JOIN (SELECT * FROM \`t3\`) AS \`q3\``
        );
    });

    it("compound -> select -- ON", async () => {
        const q = unionAll([q1, q2])
            .joinSelect("u", "LEFT", "q3", q3)
            .on((f) => equals(f.a, f.d))
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\` LEFT JOIN (SELECT * FROM \`t3\`) AS \`q3\` ON \`a\` = \`d\``
        );
    });

    it("compound -> select -- ON QUALIFIED", async () => {
        const q = unionAll([q1, q2])
            .joinSelect("u", "LEFT", "q3", q3)
            .on((f) => equals(f["u.a"], f["q3.d"]))
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\` LEFT JOIN (SELECT * FROM \`t3\`) AS \`q3\` ON \`u\`.\`a\` = \`q3\`.\`d\``
        );
    });
    it("compound -> select -- USING", async () => {
        const q = unionAll([q1, q2])
            .joinSelect("u", "LEFT", "q3", q3)
            .using(["c"])
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\` LEFT JOIN (SELECT * FROM \`t3\`) AS \`q3\` USING(\`c\`)`
        );
    });

    it("compound -> select -- NO CONSTRAINT", async () => {
        const q = unionAll([q1, q2])
            .joinSelect("u", "LEFT", "q3", q3)
            .noConstraint()
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\` LEFT JOIN (SELECT * FROM \`t3\`) AS \`q3\``
        );
    });
});
