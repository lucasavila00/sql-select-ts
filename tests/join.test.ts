import { fromTable } from "../src";
import { configureSqlite } from "./utils";

// mostly from https://github.com/sqlite/sqlite/blob/master/test/join.test

describe("sqlite join", () => {
    const t1 = fromTable(["a", "b", "c"], "t1");
    const t2 = fromTable(["b", "c", "d"], "t2");

    const { run, fail } = configureSqlite();

    beforeAll(async () => {
        await run(`CREATE TABLE t1(a,b,c);`);
        await run(`INSERT INTO t1 VALUES(1,2,3);`);
        await run(`INSERT INTO t1 VALUES(2,3,4);`);
        await run(`INSERT INTO t1 VALUES(3,4,5);`);

        await run(`CREATE TABLE t2(b,c,d);`);
        await run(`INSERT INTO t2 VALUES(1,2,3);`);
        await run(`INSERT INTO t2 VALUES(2,3,4);`);
        await run(`INSERT INTO t2 VALUES(3,4,5);`);
    });

    it("join-1.3", async () => {
        // const q = t1.joinTable("NATURAL", t2).selectStar().print();
        // expect(q).toMatchInlineSnapshot(`"SELECT f1 AS f1 FROM test1;"`);
        // expect(await run(q)).toMatchInlineSnapshot(`
        //     Array [
        //       Object {
        //         "f1": 11,
        //       },
        //     ]
        // `);
    });
});
