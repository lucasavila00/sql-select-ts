import {
    castSafe,
    fromStringifiedSelectStatement,
    table,
    unionAll,
} from "../src";
import { addSimpleStringSerializer } from "./utils";
addSimpleStringSerializer();

describe("commaJoinStringifiedSelect", () => {
    const t1 = table(["a", "b", "c"], "t1");
    const t2 = table(["b", "c", "d"], "t2");
    const t3 = table(["c", "d", "e"], "t3");
    const q2 = t2.selectStar();
    const q3 = t3.selectStar();

    const str1 = fromStringifiedSelectStatement<"a" | "b" | "c">(
        castSafe(t1.selectStar().stringify())
    );
    const str2 = fromStringifiedSelectStatement<"b" | "c" | "d">(
        castSafe(q2.stringify())
    );
    const str3 = fromStringifiedSelectStatement<"c" | "d" | "e">(
        castSafe(q3.stringify())
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
            .commaJoinStringifiedSelect("t2", str2)
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\`, (SELECT * FROM \`t2\`) AS \`t2\``
        );
    });

    it("table -> select -- select", async () => {
        const q = t1
            .commaJoinStringifiedSelect("t2", str2)
            .select((f) => ({ x: f.a, y: f.d, z: f["t1.c"] }))
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT \`a\` AS \`x\`, \`d\` AS \`y\`, \`t1\`.\`c\` AS \`z\` FROM \`t1\`, (SELECT * FROM \`t2\`) AS \`t2\``
        );
    });

    it("select -> select", async () => {
        const q = t1
            .selectStar()
            .commaJoinStringifiedSelect("t1", "t2", str2)
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`t1\`, (SELECT * FROM \`t2\`) AS \`t2\``
        );
    });

    it("select -> select -- select", async () => {
        const q = t1
            .selectStar()
            .commaJoinStringifiedSelect("q1", "t2", str2)

            .select((f) => ({ x: f.a, y: f.d, z: f["q1.c"] }))
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT \`a\` AS \`x\`, \`d\` AS \`y\`, \`q1\`.\`c\` AS \`z\` FROM (SELECT * FROM \`t1\`) AS \`q1\`, (SELECT * FROM \`t2\`) AS \`t2\``
        );
    });

    it("stringified select -> select", async () => {
        const q = str1
            .commaJoinStringifiedSelect("t1", "t2", str2)
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\`) AS \`t1\`, (SELECT * FROM \`t2\`) AS \`t2\``
        );
    });

    it("stringified select -> select -- select", async () => {
        const q = str1
            .commaJoinStringifiedSelect("q1", "t2", str2)
            .select((f) => ({ x: f.a, y: f.d, z: f["q1.c"] }))
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT \`a\` AS \`x\`, \`d\` AS \`y\`, \`q1\`.\`c\` AS \`z\` FROM (SELECT * FROM \`t1\`) AS \`q1\`, (SELECT * FROM \`t2\`) AS \`t2\``
        );
    });

    it("joined -> select", async () => {
        const q = t1
            .joinTable("NATURAL", t2)
            .noConstraint()
            .commaJoinStringifiedSelect("q3", str3)
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t1\`, (SELECT * FROM \`t3\`) AS \`q3\` NATURAL JOIN \`t2\``
        );
    });

    it("joined -> select -- select", async () => {
        const q = t1
            .joinTable("NATURAL", t2)
            .noConstraint()
            .commaJoinStringifiedSelect("t3", str3)
            .select((f) => ({ x: f.a, y: f.e, d: f["t2.d"], d2: f["t3.d"] }))
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT \`a\` AS \`x\`, \`e\` AS \`y\`, \`t2\`.\`d\` AS \`d\`, \`t3\`.\`d\` AS \`d2\` FROM \`t1\`, (SELECT * FROM \`t3\`) AS \`t3\` NATURAL JOIN \`t2\``
        );
    });

    it("compound -> select", async () => {
        const q = unionAll([t1.selectStar(), t3.selectStar()])
            .commaJoinStringifiedSelect("q1", "t3", str3)
            .selectStar()
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t3\`) AS \`q1\`, (SELECT * FROM \`t3\`) AS \`t3\``
        );
    });

    it("compound -> select -- select", async () => {
        const a = t1.selectStar();
        const b = t3.selectStar();
        const u = unionAll([a, b]);
        const q = u
            .commaJoinStringifiedSelect("q1", "t3", str3)
            .select((f) => ({ x: f.a, e: f.d }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`a\` AS \`x\`, \`d\` AS \`e\` FROM (SELECT * FROM \`t1\` UNION ALL SELECT * FROM \`t3\`) AS \`q1\`, (SELECT * FROM \`t3\`) AS \`t3\``
        );
    });
});
