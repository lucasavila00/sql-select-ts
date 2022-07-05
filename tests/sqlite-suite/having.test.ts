import { table } from "../../src";
import { configureSqlite } from "../utils";
import { addSimpleStringSerializer } from "../utils";
addSimpleStringSerializer();

describe("sqlite having", () => {
    const t0 = table(["x", "y"], "t0");

    const { run } = configureSqlite();

    beforeAll(async () => {
        await run(`CREATE TABLE t0(x INTEGER, y INTEGER)`);
    });

    it("1 call -- type checks", async () => {
        t0.selectStar()
            //@ts-expect-error
            .having((f) => f.abc)
            .stringify();

        t0.selectStar()
            //@ts-expect-error
            .having(["abc"])
            .stringify();
        expect(1).toBe(1);
    });

    it("1 call -- from select", async () => {
        const q = t0
            .select((f) => ({ it: f.x }))
            .groupBy((f) => f.y)
            .having((f) => f.y)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT \`x\` AS \`it\` FROM \`t0\` GROUP BY \`y\` HAVING \`y\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("1 call", async () => {
        const q = t0
            .selectStar()
            .groupBy((f) => f.x)
            .having((f) => f.x)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t0\` GROUP BY \`x\` HAVING \`x\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("2 calls", async () => {
        const q = t0
            .selectStar()
            .groupBy((f) => f.x)
            .having((f) => f.x)
            .groupBy((f) => f.y)
            .having((f) => f.y)
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t0\` GROUP BY \`x\`, \`y\` HAVING \`x\` AND \`y\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("2 items, 1 call", async () => {
        const q = t0
            .selectStar()
            .groupBy((f) => [f.x, f.y])
            .having((f) => [f.x, f.y])
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t0\` GROUP BY \`x\`, \`y\` HAVING \`x\` AND \`y\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("2 items, 1 call -- shortcut", async () => {
        const q = t0
            .selectStar()
            .groupBy((f) => [f.x, f.y])
            .having(["x", "y"])
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM \`t0\` GROUP BY \`x\`, \`y\` HAVING \`x\` AND \`y\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
});
