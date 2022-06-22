import { table, unionAll } from "../src";

describe("commaJoinTable", () => {
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

    it("table -> table", async () => {
        const q = t1
            .commaJoinTable(t2)

            .selectStar()
            .print();
        expect(q).toMatchInlineSnapshot(`"SELECT * FROM t1, t2"`);
    });

    it("table -> table -- select", async () => {
        const q = t1
            .commaJoinTable(t2)
            .select((f) => ({ x: f.a, y: f.d, z: f["t1.c"] }))
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT a AS x, d AS y, t1.c AS z FROM t1, t2"`
        );
    });

    it("table -> table -- prevents ambiguous", async () => {
        const q = t1
            .commaJoinTable(t2)
            .select((f) => ({
                x: f.a,
                y: f.d,
                // @ts-expect-error
                z: f.c,
            }))
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT a AS x, d AS y, c AS z FROM t1, t2"`
        );
    });

    it("select -> table", async () => {
        const q = t1
            .selectStar()
            .commaJoinTable("q1", t2)

            .selectStar()
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM (SELECT * FROM t1) AS q1, t2"`
        );
    });

    it("select -> table -- select", async () => {
        const q = t1
            .selectStar()
            .commaJoinTable("q1", t2)

            .select((f) => ({ x: f.a, y: f.d, z: f["q1.c"] }))
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT a AS x, d AS y, q1.c AS z FROM (SELECT * FROM t1) AS q1, t2"`
        );
    });

    it("select -> table -- prevents ambigous", async () => {
        const q = t1
            .selectStar()
            .commaJoinTable("q1", t2)

            .select((f) => ({
                x: f.a,
                y: f.d,
                // @ts-expect-error
                z: f.c,
            }))
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT a AS x, d AS y, c AS z FROM (SELECT * FROM t1) AS q1, t2"`
        );
    });

    it("joined -> table", async () => {
        const q = t1
            .joinTable("NATURAL", t2)
            .noConstraint()
            .commaJoinTable(t3)
            .selectStar()
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM t1, t3 NATURAL JOIN t2"`
        );
    });

    it("joined -> table -- select", async () => {
        const q = t1
            .joinTable("NATURAL", t2)
            .noConstraint()
            .commaJoinTable(t3)
            .select((f) => ({ x: f.a, y: f.e, d: f["t2.d"], d2: f["t3.d"] }))
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT a AS x, e AS y, t2.d AS d, t3.d AS d2 FROM t1, t3 NATURAL JOIN t2"`
        );
    });

    it("compound -> table", async () => {
        const q = unionAll([t1.selectStar(), t3.selectStar()])
            .commaJoinTable("q1", t2)
            .selectStar()
            .print();
        expect(q).toMatchInlineSnapshot(
            `"SELECT * FROM (SELECT * FROM t1 UNION ALL SELECT * FROM t3) AS q1, t2"`
        );
    });

    it("compound -> table -- select", async () => {
        const a = t1.selectStar();
        const b = t3.selectStar();
        const u = unionAll([a, b]);
        const q = u
            .commaJoinTable("q1", t2)
            .select((f) => ({ x: f.a, e: f.d }))
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT a AS x, d AS e FROM (SELECT * FROM t1 UNION ALL SELECT * FROM t3) AS q1, t2"`
        );
    });

    it("compound -> table -- prevents ambigous", async () => {
        const a = t1.selectStar();
        const b = t3.selectStar();
        const u = unionAll([a, b]);
        const q = u
            .commaJoinTable("q1", t2)
            // @ts-expect-error
            .select((f) => ({ x: f.a, e: f.b }))
            .print();

        expect(q).toMatchInlineSnapshot(
            `"SELECT a AS x, b AS e FROM (SELECT * FROM t1 UNION ALL SELECT * FROM t3) AS q1, t2"`
        );
    });
});
