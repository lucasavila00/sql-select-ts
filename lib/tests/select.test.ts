import { table, unionAll } from "../src";

describe("select", () => {
    const t1 = table(["a", "b", "c"], "t1");
    const t2 = table(["b", "c", "d"], "t2");
    // const t3 = table(["c", "d", "e"], "t3");

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

    it("table - no identity function", async () => {
        // @ts-expect-error
        t1.select((f) => f);
        t1.select((f) => ({ a: f.a }));
    });

    it("select - no identity function", async () => {
        // @ts-expect-error
        t1.selectStar().select((f) => f);
        t1.selectStar().select((f) => ({ a: f.a }));
    });
    it("join - no identity function", async () => {
        t1.joinTable("NATURAL", t2)
            .noConstraint()
            .select(
                // @ts-expect-error
                (f) => f
            );

        t1.joinTable("NATURAL", t2)
            .noConstraint()
            .select((f) => ({ a: f.a }));
    });
    it("compound - no identity function", async () => {
        const u = unionAll([t1.selectStar(), t2.selectStar()]);
        u.select(
            //@ts-expect-error
            (f) => f
        );
        u.select((f) => ({ a: f.a }));
    });
});
