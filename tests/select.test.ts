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

    it("append select qualified", async () => {
        const q = t1
            .as("t2")
            .select((f) => ({ a: f.t2.a }))
            .appendSelect((f) => ({ b: f.t2.b }))
            .appendSelect((f) => ({ c: f.t2.c }))
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `"SELECT \`t2\`.\`a\` AS \`a\`, \`t2\`.\`b\` AS \`b\`, \`t2\`.\`c\` AS \`c\` FROM \`t1\` AS \`t2\`"`
        );
    });

    it("table - no identity function", async () => {
        // @ts-expect-error
        t1.select((f) => f);
        t1.select((f) => ({ a: f.a }));
        expect(() =>
            // @ts-expect-error
            t1.select((f) => f).stringify()
        ).toThrow();
    });

    it("select - no identity function", async () => {
        // @ts-expect-error
        t1.selectStar().select((f) => f);
        t1.selectStar().select((f) => ({ a: f.a }));
        expect(1).toBe(1);
    });
    it("join - no identity function", async () => {
        t1.join("NATURAL", t2)
            .noConstraint()
            .select(
                // @ts-expect-error
                (f) => f
            );

        t1.join("NATURAL", t2)
            .noConstraint()
            .select((f) => ({ a: f.a }));
        expect(1).toBe(1);
    });
    it("compound - no identity function", async () => {
        const u = unionAll([t1.selectStar(), t2.selectStar()]);
        u.select(
            //@ts-expect-error
            (f) => f
        );
        u.select((f) => ({ a: f.a }));
        expect(1).toBe(1);
    });
});
