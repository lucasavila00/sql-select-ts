import { SafeString, sql, table, unionAll } from "../src";

const equals = (a: SafeString, b: SafeString) => sql`${a} = ${b}`;

describe("joinSelect", () => {
    const t1 = table(["a", "b", "c"], "t1");
    const t2 = table(["b", "c", "d"], "t2");
    const t3 = table(["c", "d", "e"], "t3");

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
        const q2 = t2.selectStar();
        const q = t1
            .joinSelect("q2", "NATURAL", q2)
            .noConstraint()
            .selectStar()
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM t1 NATURAL JOIN (SELECT * FROM t2) AS q2;"`
        );
    });

    it("table -> select -- select", async () => {
        const q2 = t2.selectStar();
        const q = t1
            .joinSelect("q2", "NATURAL", q2)
            .noConstraint()
            .select((f) => ({ x: f.a, y: f.d, z: f["t1.c"] }))
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT a AS x, d AS y, t1.c AS z FROM t1 NATURAL JOIN (SELECT * FROM t2) AS q2;"`
        );
    });

    it("table -> select -- prevents ambiguous", async () => {
        const q2 = t2.selectStar();
        const q = t1
            .joinSelect("q2", "NATURAL", q2)
            .noConstraint()
            .select((f) => ({
                x: f.a,
                y: f.d,
                // @ts-expect-error
                z: f.c,
            }))
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT a AS x, d AS y, c AS z FROM t1 NATURAL JOIN (SELECT * FROM t2) AS q2;"`
        );
    });

    it("table -> select -- ON", async () => {
        const q2 = t2.selectStar();
        const q = t1
            .joinSelect("q2", "LEFT", q2)
            .on((f) => equals(f.a, f.d))
            .selectStar()
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM t1 LEFT JOIN (SELECT * FROM t2) AS q2 ON a = d;"`
        );
    });

    it("table -> select -- ON QUALIFIED", async () => {
        const q2 = t2.selectStar();
        const q = t1
            .joinSelect("q2", "LEFT", q2)
            .on((f) => equals(f["t1.a"], f["q2.d"]))
            .selectStar()
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM t1 LEFT JOIN (SELECT * FROM t2) AS q2 ON t1.a = q2.d;"`
        );
    });

    it("table -> select -- USING", async () => {
        const q2 = t2.selectStar();
        const q = t1
            .joinSelect("q2", "LEFT", q2)
            .using(["b"])
            .selectStar()
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM t1 LEFT JOIN (SELECT * FROM t2) AS q2 USING(b);"`
        );
    });

    it("table -> select -- NO CONSTRAINT", async () => {
        const q2 = t2.selectStar();
        const q = t1
            .joinSelect("q2", "LEFT", q2)
            .using(["b"])
            .selectStar()
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM t1 LEFT JOIN (SELECT * FROM t2) AS q2 USING(b);"`
        );
    });

    it("select -> select", async () => {
        const q1 = t1.selectStar();
        const q2 = t2.selectStar();
        const q = q1
            .joinSelect("q1", "NATURAL", "q2", q2)
            .noConstraint()
            .selectStar()
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM (SELECT * FROM t1) AS q1 NATURAL JOIN (SELECT * FROM t2) AS q2;"`
        );
    });

    it("select -> select -- select", async () => {
        const q1 = t1.selectStar();
        const q2 = t2.selectStar();
        const q = q1
            .joinSelect("q1", "NATURAL", "q2", q2)
            .noConstraint()
            .select((f) => ({ x: f.a, y: f.d, z: f["q1.c"] }))
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT a AS x, d AS y, q1.c AS z FROM (SELECT * FROM t1) AS q1 NATURAL JOIN (SELECT * FROM t2) AS q2;"`
        );
    });

    it("select -> select -- prevents ambiguous", async () => {
        const q1 = t1.selectStar();
        const q2 = t2.selectStar();
        const q = q1
            .joinSelect("q1", "NATURAL", "q2", q2)
            .noConstraint()
            .select((f) => ({
                x: f.a,
                y: f.d,
                // @ts-expect-error
                z: f.c,
            }))
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT a AS x, d AS y, c AS z FROM (SELECT * FROM t1) AS q1 NATURAL JOIN (SELECT * FROM t2) AS q2;"`
        );
    });

    it("select -> select -- ON", async () => {
        const q1 = t1.selectStar();
        const q2 = t2.selectStar();
        const q = q1
            .joinSelect("q1", "LEFT", "q2", q2)
            .on((f) => equals(f.a, f.d))
            .selectStar()
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM (SELECT * FROM t1) AS q1 LEFT JOIN (SELECT * FROM t2) AS q2 ON a = d;"`
        );
    });

    it("select -> select -- ON QUALIFIED", async () => {
        const q1 = t1.selectStar();
        const q2 = t2.selectStar();
        const q = q1
            .joinSelect("q1", "LEFT", "q2", q2)
            .on((f) => equals(f["q1.a"], f["q2.d"]))
            .selectStar()
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM (SELECT * FROM t1) AS q1 LEFT JOIN (SELECT * FROM t2) AS q2 ON q1.a = q2.d;"`
        );
    });
    it("select -> select -- USING", async () => {
        const q1 = t1.selectStar();
        const q2 = t2.selectStar();
        const q = q1
            .joinSelect("q1", "LEFT", "q2", q2)
            .using(["b"])
            .selectStar()
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM (SELECT * FROM t1) AS q1 LEFT JOIN (SELECT * FROM t2) AS q2 USING(b);"`
        );
    });

    it("select -> select -- NO CONSTRAINT", async () => {
        const q1 = t1.selectStar();
        const q2 = t2.selectStar();
        const q = q1
            .joinSelect("q1", "LEFT", "q2", q2)
            .using(["b"])
            .selectStar()
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM (SELECT * FROM t1) AS q1 LEFT JOIN (SELECT * FROM t2) AS q2 USING(b);"`
        );
    });
});
