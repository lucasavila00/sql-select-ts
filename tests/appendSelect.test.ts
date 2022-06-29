import { table } from "../src";

describe("appendSelect", () => {
    const t1 = table(["a", "b", "c"], "t1");

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

    it("no identity function", async () => {
        t1.selectStar().appendSelect(
            // @ts-expect-error
            (f) => f
        );
        t1.selectStar().appendSelect((f) => ({ a: f.a }));
    });
});
