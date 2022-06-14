import { table, unionAll } from "../src";

describe("commaJoinCompound", () => {
    const t1 = table(["a", "b", "c"], "t1");
    const t2 = table(["b", "c", "d"], "t2");
    const t3 = table(["c", "d", "e"], "t3");
    const q2 = t2.selectStar();
    const q3 = t3.selectStar();
    const u1 = unionAll([q2, q3]);
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
            .commaJoinCompound("t2", u1)

            .selectStar()
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM t1, (SELECT * FROM t2 UNION ALL SELECT * FROM t3) AS t2;"`
        );
    });

    it("table -> select -- select", async () => {
        const q = t1
            .commaJoinCompound("t2", u1)
            .select((f) => ({ x: f.a, y: f.d, z: f["t1.c"] }))
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT a AS x, d AS y, t1.c AS z FROM t1, (SELECT * FROM t2 UNION ALL SELECT * FROM t3) AS t2;"`
        );
    });

    it("table -> select -- prevents ambiguous", async () => {
        const q = t1
            .commaJoinCompound("t2", u1)
            .select((f) => ({
                x: f.a,
                y: f.d,
                // @ts-expect-error
                z: f.c,
            }))
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT a AS x, d AS y, c AS z FROM t1, (SELECT * FROM t2 UNION ALL SELECT * FROM t3) AS t2;"`
        );
    });

    it("select -> select", async () => {
        const q = t1
            .selectStar()
            .commaJoinCompound("t1", "t2", u1)
            .selectStar()
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM (SELECT * FROM t1) AS t1, (SELECT * FROM t2 UNION ALL SELECT * FROM t3) AS t2;"`
        );
    });

    it("select -> select -- select", async () => {
        const q = t1
            .selectStar()
            .commaJoinCompound("q1", "t2", u1)

            .select((f) => ({ x: f.a, y: f.d, z: f["q1.c"] }))
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT a AS x, d AS y, q1.c AS z FROM (SELECT * FROM t1) AS q1, (SELECT * FROM t2 UNION ALL SELECT * FROM t3) AS t2;"`
        );
    });

    it("select -> select -- prevents ambigous", async () => {
        const q = t1
            .selectStar()
            .commaJoinCompound("q1", "t2", u1)

            .select((f) => ({
                x: f.a,
                y: f.d,
                // @ts-expect-error
                z: f.c,
            }))
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT a AS x, d AS y, c AS z FROM (SELECT * FROM t1) AS q1, (SELECT * FROM t2 UNION ALL SELECT * FROM t3) AS t2;"`
        );
    });

    it("joined -> select", async () => {
        const q = t1
            .joinTable("NATURAL", t2)
            .noConstraint()
            .commaJoinCompound("q3", u1)
            .selectStar()
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM t1, (SELECT * FROM t2 UNION ALL SELECT * FROM t3) AS q3 NATURAL JOIN t2;"`
        );
    });

    // TODO fix
    // TODO fix
    // TODO fix
    // TODO fix
    // TODO fix
    // TODO fix
    // TODO fix
    // TODO fix
    // TODO fix
    it("joined -> select -- select", async () => {
        const q = t1
            .joinTable("NATURAL", t2)
            .noConstraint()
            .selectStar()
            // .commaJoinCompound("t3", u1)
            // .select((f) => ({ x: f.a, y: f.b, d: f["t2.d"], d2: f["t3.d"] }))
            .print();
        expect(q).toMatchInlineSnapshot(`"SELECT * FROM t1 NATURAL JOIN t2;"`);
    });

    it("compound -> select", async () => {
        const q = unionAll([t1.selectStar(), t3.selectStar()])
            .commaJoinCompound("q1", "t3", u1)
            .selectStar()
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM (SELECT * FROM t1 UNION ALL SELECT * FROM t3) AS q1, (SELECT * FROM t2 UNION ALL SELECT * FROM t3) AS t3;"`
        );
    });

    it("compound -> select -- select", async () => {
        const a = t1.selectStar();
        const b = t3.selectStar();
        const u = unionAll([a, b]);
        const q = u
            .commaJoinCompound("q1", "t3", u1)
            .select((f) => ({ x: f.a, e: f.d }))
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT a AS x, d AS e FROM (SELECT * FROM t1 UNION ALL SELECT * FROM t3) AS q1, (SELECT * FROM t2 UNION ALL SELECT * FROM t3) AS t3;"`
        );
    });

    it("compound -> select -- prevents ambigous", async () => {
        const a = t1.selectStar();
        const b = t3.selectStar();
        const u = unionAll([a, b]);
        const q = u
            .commaJoinCompound("q1", "t3", u1)
            // @ts-expect-error
            .select((f) => ({ x: f.c }))
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT c AS x FROM (SELECT * FROM t1 UNION ALL SELECT * FROM t3) AS q1, (SELECT * FROM t2 UNION ALL SELECT * FROM t3) AS t3;"`
        );
    });
});
