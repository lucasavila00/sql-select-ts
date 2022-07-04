import {
    castSafe,
    fromStringifiedSelectStatement,
    SafeString,
    dsql,
    table,
    unionAll,
} from "../src";
import { addSimpleStringSerializer } from "./utils";
addSimpleStringSerializer();

const equals = (a: SafeString, b: SafeString) => dsql`${a} = ${b}`;

describe("joinCompound", () => {
    const t1 = table(["a", "b", "c"], "t1");
    const t2 = table(["b", "c", "d"], "t2");
    const t3 = table(["c", "d", "e"], "t3");
    const q1 = t1.selectStar();
    const q2 = t2.selectStar();
    const q3 = t3.selectStar();

    const u = unionAll([q1, q2]);
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

    it("table -> compound", async () => {
        const q = t1
            .joinCompound("u", "NATURAL", u)
            .noConstraint()
            .selectStar()
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\` NATURAL JOIN (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\``
        );
    });

    it("table -> compound -- select", async () => {
        const q = t1
            .joinCompound("u", "NATURAL", u)
            .noConstraint()
            .select((f) => ({ x: f["u.a"], y: f["u.b"], z: f["t1.c"] }))
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT \`u\`.\`a\` AS \`x\`, \`u\`.\`b\` AS \`y\`, \`t1\`.\`c\` AS \`z\` FROM \`t1\` NATURAL JOIN (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\``
        );
    });

    it("table -> compound -- ON", async () => {
        const q = t1
            .joinCompound("u", "LEFT", u)
            .on((f) => equals(f["t1.a"], f["u.a"]))
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\` LEFT JOIN (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\` ON \`t1\`.\`a\` = \`u\`.\`a\``
        );
    });

    it("table -> compound -- ON QUALIFIED", async () => {
        const q = t1
            .joinCompound("u", "LEFT", u)
            .on((f) => equals(f["t1.a"], f["u.b"]))
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\` LEFT JOIN (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\` ON \`t1\`.\`a\` = \`u\`.\`b\``
        );
    });

    it("table -> compound -- USING", async () => {
        const q = t1
            .joinCompound("u", "LEFT", u)
            .using(["b"])
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\` LEFT JOIN (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\` USING(\`b\`)`
        );
    });

    it("table -> compound -- NO CONSTRAINT", async () => {
        const q = t1
            .joinCompound("u", "LEFT", u)
            .using(["b"])
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\` LEFT JOIN (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\` USING(\`b\`)`
        );
    });

    it("select -> compound", async () => {
        const q = q1
            .joinCompound("q1", "LEFT", "u", u)
            .noConstraint()
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`q1\` LEFT JOIN (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\``
        );
    });

    it("select -> compound -- select", async () => {
        const q = q1
            .joinCompound("t1", "LEFT", "u", u)
            .noConstraint()
            .select((f) => ({ x: f["u.a"], y: f["u.b"], z: f["t1.c"] }))
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT \`u\`.\`a\` AS \`x\`, \`u\`.\`b\` AS \`y\`, \`t1\`.\`c\` AS \`z\` FROM (SELECT * FROM \`t1\`) AS \`t1\` LEFT JOIN (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\``
        );
    });

    it("select -> compound -- ON", async () => {
        const q = q1
            .joinCompound("t1", "LEFT", "u", u)
            .on((f) => equals(f["t1.a"], f["u.a"]))
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`t1\` LEFT JOIN (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\` ON \`t1\`.\`a\` = \`u\`.\`a\``
        );
    });
    it("select -> compound -- ON QUALIFIED", async () => {
        const q = q1
            .joinCompound("t1", "LEFT", "u", u)
            .on((f) => equals(f["t1.a"], f["u.b"]))
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`t1\` LEFT JOIN (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\` ON \`t1\`.\`a\` = \`u\`.\`b\``
        );
    });

    it("select -> compound -- USING", async () => {
        const q = q1
            .joinCompound("t1", "LEFT", "u", u)
            .using(["b"])
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`t1\` LEFT JOIN (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\` USING(\`b\`)`
        );
    });
    it("select -> compound -- NO CONSTRAINT", async () => {
        const q = q1
            .joinCompound("t1", "LEFT", "u", u)
            .using(["b"])
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`t1\` LEFT JOIN (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\` USING(\`b\`)`
        );
    });

    it("stringified select -> compound", async () => {
        const q = str1
            .joinCompound("q1", "LEFT", "u", u)
            .noConstraint()
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`q1\` LEFT JOIN (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\``
        );
    });

    it("stringified select -> compound -- select", async () => {
        const q = str1
            .joinCompound("t1", "LEFT", "u", u)
            .noConstraint()
            .select((f) => ({ x: f["u.a"], y: f["u.b"], z: f["t1.c"] }))
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT \`u\`.\`a\` AS \`x\`, \`u\`.\`b\` AS \`y\`, \`t1\`.\`c\` AS \`z\` FROM (SELECT * FROM \`t1\`) AS \`t1\` LEFT JOIN (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\``
        );
    });

    it("stringified select -> compound -- ON", async () => {
        const q = str1
            .joinCompound("t1", "LEFT", "u", u)
            .on((f) => equals(f["t1.a"], f["u.a"]))
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`t1\` LEFT JOIN (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\` ON \`t1\`.\`a\` = \`u\`.\`a\``
        );
    });
    it("stringified select -> compound -- ON QUALIFIED", async () => {
        const q = str1
            .joinCompound("t1", "LEFT", "u", u)
            .on((f) => equals(f["t1.a"], f["u.b"]))
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`t1\` LEFT JOIN (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\` ON \`t1\`.\`a\` = \`u\`.\`b\``
        );
    });

    it("stringified select -> compound -- USING", async () => {
        const q = str1
            .joinCompound("t1", "LEFT", "u", u)
            .using(["b"])
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`t1\` LEFT JOIN (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\` USING(\`b\`)`
        );
    });
    it("stringified select -> compound -- NO CONSTRAINT", async () => {
        const q = str1
            .joinCompound("t1", "LEFT", "u", u)
            .using(["b"])
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`t1\` LEFT JOIN (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\` USING(\`b\`)`
        );
    });

    it("compound -> compound", async () => {
        const u1 = unionAll([q1, q3]);

        const q = u1
            .joinCompound("q1", "LEFT", "u", u)
            .noConstraint()
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t3\`) AS \`q1\` LEFT JOIN (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\``
        );
    });

    it("compound -> compound -- select", async () => {
        const u1 = unionAll([q1, q3]);

        const q = u1
            .joinCompound("t1", "LEFT", "u", u)
            .noConstraint()
            .select((f) => ({ x: f["u.a"], y: f["u.b"], z: f["t1.c"] }))
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT \`u\`.\`a\` AS \`x\`, \`u\`.\`b\` AS \`y\`, \`t1\`.\`c\` AS \`z\` FROM (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t3\`) AS \`t1\` LEFT JOIN (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\``
        );
    });

    it("compound -> compound -- ON", async () => {
        const u1 = unionAll([q1, q3]);

        const q = u1
            .joinCompound("t1", "LEFT", "u", u)
            .on((f) => equals(f["t1.a"], f["u.a"]))
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t3\`) AS \`t1\` LEFT JOIN (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\` ON \`t1\`.\`a\` = \`u\`.\`a\``
        );
    });
    it("compound -> compound -- ON QUALIFIED", async () => {
        const u1 = unionAll([q1, q3]);

        const q = u1
            .joinCompound("t1", "LEFT", "u", u)
            .on((f) => equals(f["t1.a"], f["u.b"]))
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t3\`) AS \`t1\` LEFT JOIN (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\` ON \`t1\`.\`a\` = \`u\`.\`b\``
        );
    });

    it("compound -> compound -- USING", async () => {
        const u1 = unionAll([q1, q3]);

        const q = u1
            .joinCompound("t1", "LEFT", "u", u)
            .using(["b"])
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t3\`) AS \`t1\` LEFT JOIN (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\` USING(\`b\`)`
        );
    });
    it("compound -> compound -- NO CONSTRAINT", async () => {
        const u1 = unionAll([q1, q3]);

        const q = u1
            .joinCompound("t1", "LEFT", "u", u)
            .using(["b"])
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t3\`) AS \`t1\` LEFT JOIN (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\` USING(\`b\`)`
        );
    });

    it("joined -> compound", async () => {
        const q = t1
            .joinTable("LEFT", t2)
            .noConstraint()
            .joinCompound("LEFT", "u", u)
            .noConstraint()
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\` LEFT JOIN \`t2\` LEFT JOIN (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\``
        );
    });

    it("joined -> compound -- select", async () => {
        const q = t1
            .joinTable("LEFT", t2)
            .noConstraint()
            .joinCompound("LEFT", "u", u)
            .noConstraint()
            .select((f) => ({ x: f["u.a"], y: f["u.b"], z: f["t1.c"] }))
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT \`u\`.\`a\` AS \`x\`, \`u\`.\`b\` AS \`y\`, \`t1\`.\`c\` AS \`z\` FROM \`t1\` LEFT JOIN \`t2\` LEFT JOIN (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\``
        );
    });
    it("joined -> compound -- ON", async () => {
        const q = t1
            .joinTable("LEFT", t2)
            .noConstraint()
            .joinCompound("LEFT", "u", u)
            .on((f) => equals(f["t1.a"], f["u.a"]))
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\` LEFT JOIN \`t2\` LEFT JOIN (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\` ON \`t1\`.\`a\` = \`u\`.\`a\``
        );
    });
    it("joined -> compound -- ON QUALIFIED", async () => {
        const q = t1
            .joinTable("LEFT", t2)
            .noConstraint()
            .joinCompound("LEFT", "u", u)
            .on((f) => equals(f["t1.a"], f["u.b"]))
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\` LEFT JOIN \`t2\` LEFT JOIN (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\` ON \`t1\`.\`a\` = \`u\`.\`b\``
        );
    });

    it("joined -> compound -- USING", async () => {
        const q = t1
            .joinTable("LEFT", t2)
            .noConstraint()
            .joinCompound("LEFT", "u", u)
            .using(["a"])
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\` LEFT JOIN \`t2\` LEFT JOIN (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\` USING(\`a\`)`
        );
    });
    it("joined -> compound -- NO CONSTRAINT", async () => {
        const q = t1
            .joinTable("LEFT", t2)
            .noConstraint()
            .joinCompound("LEFT", "u", u)
            .using(["a"])
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\` LEFT JOIN \`t2\` LEFT JOIN (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t2\`) AS \`u\` USING(\`a\`)`
        );
    });
});
