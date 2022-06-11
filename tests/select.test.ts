import { SafeString, sql, table, unionAll } from "../src";

describe("select", () => {
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

    it("table - no identity function", async () => {
        expect(() => t1.select((f) => f).print()).toThrow();
        expect(() => t1.select((f) => ({ a: f.a })).print()).toThrow();
    });

    // it("select - no identity function", async () => {
    //     t1.selectStar().select(
    //         // @ts-expect-error
    //         (f) => f
    //     );
    // });
});
