import { sql, table, unionAll } from "../src";
import { addSimpleStringSerializer, configureSqlite } from "./utils";
addSimpleStringSerializer();

describe("sqlite select1", () => {
    const test1 = table(["f1", "f2"], "test1");
    const { run } = configureSqlite();
    beforeAll(async () => {
        await run(`CREATE TABLE test1(f1 int, f2 int)`);
        await run(`INSERT INTO test1(f1,f2) VALUES(11,22)`);
    });

    it("select", async () => {
        const q = test1
            .selectStar()
            .where((f) => sql`${f.f1} < ${f.f2}`)
            .select((f) => ({ a: f["main_alias.f1"] }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`main_alias\`.\`f1\` AS \`a\` FROM (SELECT * FROM \`test1\` WHERE \`f1\` < \`f2\`) AS \`main_alias\``
        );
        await run(q);
    });
    it("select - append", async () => {
        const q = test1
            .selectStar()
            .where((f) => sql`${f.f1} < ${f.f2}`)
            .appendSelect((f) => ({ a: f["main_alias.f1"] }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT *, \`main_alias\`.\`f1\` AS \`a\` FROM \`test1\` AS \`main_alias\` WHERE \`f1\` < \`f2\``
        );
        await run(q);
    });
    it("table", async () => {
        const q = test1.select((f) => ({ a: f["test1.f1"] })).stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`test1\`.\`f1\` AS \`a\` FROM \`test1\``
        );
        await run(q);
    });
    it("union", async () => {
        const q1 = test1.selectStar().where((f) => sql`${f.f1} < ${f.f2}`);
        const q2 = test1.selectStar().where((f) => sql`${f.f1} > ${f.f2}`);
        const q = unionAll([q1, q2])
            .orderBy((f) => f.f1)
            .orderBy((f) => f.f2)
            .selectStar()
            .select((f) => ({ f1: f["main_alias.f1"], f2: f.f2 }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`main_alias\`.\`f1\` AS \`f1\`, \`f2\` AS \`f2\` FROM (SELECT * FROM (SELECT * FROM \`test1\` WHERE \`f1\` < \`f2\` UNION ALL SELECT * FROM \`test1\` WHERE \`f1\` > \`f2\` ORDER BY \`f1\`, \`f2\`)) AS \`main_alias\``
        );
        await run(q);
    });
    it("union - append", async () => {
        const q1 = test1.selectStar().where((f) => sql`${f.f1} < ${f.f2}`);
        const q2 = test1.selectStar().where((f) => sql`${f.f1} > ${f.f2}`);
        const q = unionAll([q1, q2])
            .orderBy((f) => f.f1)
            .orderBy((f) => f.f2)
            .selectStar()
            .select((f) => ({ f1: f["main_alias.f1"] }))
            .appendSelect((f) => ({ f2: f["main_alias.f2"] }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`main_alias\`.\`f1\` AS \`f1\`, \`main_alias\`.\`f2\` AS \`f2\` FROM (SELECT * FROM (SELECT * FROM \`test1\` WHERE \`f1\` < \`f2\` UNION ALL SELECT * FROM \`test1\` WHERE \`f1\` > \`f2\` ORDER BY \`f1\`, \`f2\`)) AS \`main_alias\``
        );
        await run(q);
    });
});
