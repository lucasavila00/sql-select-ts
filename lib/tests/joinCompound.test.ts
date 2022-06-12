import { SafeString, sql, table, unionAll } from "../src";

const equals = (a: SafeString, b: SafeString) => sql`${a} = ${b}`;

describe("joinCompound", () => {
    const t1 = table(["a", "b", "c"], "t1");
    const t2 = table(["b", "c", "d"], "t2");
    // const t3 = table(["c", "d", "e"], "t3");
    const q1 = t1.selectStar();
    const q2 = t2.selectStar();
    // const q3 = t3.selectStar();

    const u = unionAll([q1, q2]);
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
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM t1 NATURAL JOIN (SELECT * FROM t1 UNION ALL SELECT * FROM t2) AS u;"`
        );
    });

    it("table -> compound -- select", async () => {
        const q = t1
            .joinCompound("u", "NATURAL", u)
            .noConstraint()
            .select((f) => ({ x: f["u.a"], y: f["u.b"], z: f["t1.c"] }))
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT u.a AS x, u.b AS y, t1.c AS z FROM t1 NATURAL JOIN (SELECT * FROM t1 UNION ALL SELECT * FROM t2) AS u;"`
        );
    });

    it("table-> compound -- prevents ambiguous", async () => {
        const q = t1
            .joinCompound("u", "NATURAL", u)
            .noConstraint()
            .select((f) => ({
                x: f["t1.a"],
                y: f["u.b"],
                // @ts-expect-error
                z: f.c,
            }))
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT t1.a AS x, u.b AS y, c AS z FROM t1 NATURAL JOIN (SELECT * FROM t1 UNION ALL SELECT * FROM t2) AS u;"`
        );
    });

    it("table -> compound -- ON", async () => {
        const q = t1
            .joinCompound("u", "LEFT", u)
            .on((f) => equals(f["t1.a"], f["u.a"]))
            .selectStar()
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM t1 LEFT JOIN (SELECT * FROM t1 UNION ALL SELECT * FROM t2) AS u ON t1.a = u.a;"`
        );
    });

    it("table -> compound -- ON QUALIFIED", async () => {
        const q = t1
            .joinCompound("u", "LEFT", u)
            .on((f) => equals(f["t1.a"], f["u.b"]))
            .selectStar()
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM t1 LEFT JOIN (SELECT * FROM t1 UNION ALL SELECT * FROM t2) AS u ON t1.a = u.b;"`
        );
    });

    it("table -> compound -- USING", async () => {
        const q = t1
            .joinCompound("u", "LEFT", u)
            .using(["b"])
            .selectStar()
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM t1 LEFT JOIN (SELECT * FROM t1 UNION ALL SELECT * FROM t2) AS u USING(b);"`
        );
    });

    it("table -> compound -- NO CONSTRAINT", async () => {
        const q = t1
            .joinCompound("u", "LEFT", u)
            .using(["b"])
            .selectStar()
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM t1 LEFT JOIN (SELECT * FROM t1 UNION ALL SELECT * FROM t2) AS u USING(b);"`
        );
    });
});
