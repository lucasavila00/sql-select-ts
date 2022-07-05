import { select, table, with_, withR } from "../../src";
import { dsql as sql, SafeString } from "../../src/safe-string";
import { configureSqlite } from "../utils";
import { addSimpleStringSerializer } from "../utils";
import { format } from "sql-formatter";
addSimpleStringSerializer();

// mostly from https://github.com/sqlite/sqlite/blob/master/test/with1.test

describe("sqlite with", () => {
    const t0 = table(["x", "y"], "t0");

    const { run } = configureSqlite();

    beforeAll(async () => {
        await run(`CREATE TABLE t0(x INTEGER, y INTEGER)`);
    });
    it("bun", async () => {
        const orders = table(
            ["region", "amount", "product", "quantity"],
            "orders"
        );

        const SUM = (it: SafeString): SafeString => sql`SUM(${it})`;

        const q = with_(
            select(
                (f) => ({
                    region: f.region,
                    total_sales: SUM(f.amount),
                }),
                orders
            ).groupBy((f) => f.region),
            "regional_sales"
        )
            .with_(
                (acc) =>
                    select(
                        (f) => ({
                            region: f.region,
                        }),
                        acc.regional_sales
                    ).where(
                        (f) =>
                            sql`${f.total_sales} > ${select(
                                (f) => ({ it: sql`SUM(${f.total_sales})/10` }),
                                acc.regional_sales
                            )}`
                    ),
                "top_regions"
            )
            .do((acc) =>
                select(
                    (f) => ({
                        region: f.region,
                        product: f.product,
                        product_units: SUM(f.quantity),
                        product_sales: SUM(f.amount),
                    }),
                    orders
                )
                    .where(
                        (f) =>
                            sql`${f.region} IN ${select(
                                (f) => ({ region: f.region }),
                                acc.top_regions
                            )}`
                    )
                    .groupBy((f) => [f.region, f.product])
            )
            .stringify();

        expect(format(q)).toMatchInlineSnapshot(`
            WITH
              \`regional_sales\` AS (
                SELECT
                  \`region\` AS \`region\`,
                  SUM(\`amount\`) AS \`total_sales\`
                FROM
                  \`orders\`
                GROUP BY
                  \`region\`
              ),
              \`top_regions\` AS (
                SELECT
                  \`region\` AS \`region\`
                FROM
                  \`regional_sales\`
                WHERE
                  \`total_sales\` > (
                    SELECT
                      SUM(\`total_sales\`) / 10 AS \`it\`
                    FROM
                      \`regional_sales\`
                  )
              )
            SELECT
              \`region\` AS \`region\`,
              \`product\` AS \`product\`,
              SUM(\`quantity\`) AS \`product_units\`,
              SUM(\`amount\`) AS \`product_sales\`
            FROM
              \`orders\`
            WHERE
              \`region\` IN (
                SELECT
                  \`region\` AS \`region\`
                FROM
                  \`top_regions\`
              )
            GROUP BY
              \`region\`,
              \`product\`
        `);
    });

    it("basic - no cols", async () => {
        const q = with_(
            //
            t0.selectStar(),
            "t0_alias"
        )
            .do((acc) => select((_f) => ({ it: sql(10) }), acc.t0_alias))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `WITH \`t0_alias\` AS (SELECT * FROM \`t0\`) SELECT 10 AS \`it\` FROM \`t0_alias\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("basic", async () => {
        const q = withR(
            //
            t0.selectStar(),
            "t0_alias",
            ["a", "b"]
        )
            .do((acc) => select((_f) => ({ it: sql(10) }), acc.t0_alias))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `WITH \`t0_alias\`(\`a\`, \`b\`) AS (SELECT * FROM \`t0\`) SELECT 10 AS \`it\` FROM \`t0_alias\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("1 with call", async () => {
        const q = withR(
            //
            t0.selectStar(),
            "t0_alias",
            ["a", "b"]
        )
            .do((acc) => select((_f) => ({ it: sql(10) }), acc.t0_alias))
            .appendSelect((f) => ({ it2: f["t0_alias.a"] }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `WITH \`t0_alias\`(\`a\`, \`b\`) AS (SELECT * FROM \`t0\`) SELECT 10 AS \`it\`, \`t0_alias\`.\`a\` AS \`it2\` FROM \`t0_alias\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("2 with calls", async () => {
        const q = withR(
            //
            t0.selectStar(),
            "t0_alias",
            ["a", "b"]
        )
            .withR(
                //
                () => t0.selectStar(),
                "t1_alias",
                ["d", "e"]
            )
            .do((acc) => select((_f) => ({ it: sql(10) }), acc.t1_alias))
            .appendSelect((f) => ({ it2: f["t1_alias.d"] }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `WITH \`t0_alias\`(\`a\`, \`b\`) AS (SELECT * FROM \`t0\`), \`t1_alias\`(\`d\`, \`e\`) AS (SELECT * FROM \`t0\`) SELECT 10 AS \`it\`, \`t1_alias\`.\`d\` AS \`it2\` FROM \`t1_alias\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("2 with calls - using prev", async () => {
        const q = withR(
            //
            t0.selectStar(),
            "t0_alias",
            ["a", "b"]
        )
            .withR(
                //
                (acc) => acc.t0_alias.selectStar(),
                "t1_alias",
                ["d", "e"]
            )
            .do((acc) => select((_f) => ({ it: sql(10) }), acc.t1_alias))

            .appendSelect((f) => ({ it2: f["t1_alias.d"] }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `WITH \`t0_alias\`(\`a\`, \`b\`) AS (SELECT * FROM \`t0\`), \`t1_alias\`(\`d\`, \`e\`) AS (SELECT * FROM \`t0_alias\`) SELECT 10 AS \`it\`, \`t1_alias\`.\`d\` AS \`it2\` FROM \`t1_alias\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("2 with calls - not using prev", async () => {
        const q = withR(
            //
            t0.selectStar(),
            "t0_alias",
            ["a", "b"]
        )
            .withR(
                //
                (_acc) => t0.selectStar(),
                "t1_alias",
                ["d", "e"]
            )
            .do((acc) => select((_f) => ({ it: sql(10) }), acc.t1_alias))

            .appendSelect((f) => ({ it2: f["t1_alias.d"] }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `WITH \`t0_alias\`(\`a\`, \`b\`) AS (SELECT * FROM \`t0\`), \`t1_alias\`(\`d\`, \`e\`) AS (SELECT * FROM \`t0\`) SELECT 10 AS \`it\`, \`t1_alias\`.\`d\` AS \`it2\` FROM \`t1_alias\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("2 with calls - using prev - no cols", async () => {
        const q = with_(
            //
            t0.selectStar(),
            "t0_alias"
        )
            .with_(
                //
                (acc) => acc.t0_alias.selectStar(),
                "t1_alias"
            )
            .do((acc) => select((_f) => ({ it: sql(10) }), acc.t1_alias))

            .appendSelect((f) => ({ it2: f["t1_alias.x"] }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `WITH \`t0_alias\` AS (SELECT * FROM \`t0\`), \`t1_alias\` AS (SELECT * FROM \`t0_alias\`) SELECT 10 AS \`it\`, \`t1_alias\`.\`x\` AS \`it2\` FROM \`t1_alias\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("2 with calls - not using prev - no cols", async () => {
        const q = with_(
            //
            t0.selectStar(),
            "t0_alias"
        )
            .with_(
                //
                () => t0.selectStar(),
                "t1_alias"
            )
            .do((acc) => select((_f) => ({ it: sql(10) }), acc.t1_alias))

            .appendSelect((f) => ({ it2: f["t1_alias.x"] }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `WITH \`t0_alias\` AS (SELECT * FROM \`t0\`), \`t1_alias\` AS (SELECT * FROM \`t0\`) SELECT 10 AS \`it\`, \`t1_alias\`.\`x\` AS \`it2\` FROM \`t1_alias\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("3 with calls - using prev", async () => {
        const q = withR(
            //
            t0.selectStar(),
            "t0_alias",
            ["a", "b"]
        )
            .withR(
                //
                (acc) => acc.t0_alias.selectStar(),
                "t1_alias",
                ["d", "e"]
            )
            .withR(
                //
                (acc) => acc.t1_alias.selectStar(),
                "t2_alias",
                ["abc", "def"]
            )
            .do((acc) => select((_f) => ({ it: sql(10) }), acc.t2_alias))

            .appendSelect((f) => ({ it2: f["t2_alias.abc"] }))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `WITH \`t0_alias\`(\`a\`, \`b\`) AS (SELECT * FROM \`t0\`), \`t1_alias\`(\`d\`, \`e\`) AS (SELECT * FROM \`t0_alias\`), \`t2_alias\`(\`abc\`, \`def\`) AS (SELECT * FROM \`t1_alias\`) SELECT 10 AS \`it\`, \`t2_alias\`.\`abc\` AS \`it2\` FROM \`t2_alias\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("with1-1.0", async () => {
        const q = withR(
            //
            t0.selectStar(),
            "x",
            ["a", "b"]
        )
            .do((acc) => select((_f) => ({ it: sql(10) }), acc.x))
            .stringify();
        expect(q).toMatchInlineSnapshot(
            `WITH \`x\`(\`a\`, \`b\`) AS (SELECT * FROM \`t0\`) SELECT 10 AS \`it\` FROM \`x\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("with1-1.0 -- no columns", async () => {
        const q = withR(
            //
            t0.selectStar(),
            "x",
            []
        )
            .do((acc) => select((_f) => ({ it: sql(10) }), acc.x))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `WITH \`x\` AS (SELECT * FROM \`t0\`) SELECT 10 AS \`it\` FROM \`x\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("with1-1.0 -- use alias", async () => {
        const q = withR(
            //
            t0.selectStar(),
            "x",
            ["a", "b"]
        )
            .do((acc) => select((f) => ({ it: f.a }), acc.x))

            .stringify();

        expect(q).toMatchInlineSnapshot(
            `WITH \`x\`(\`a\`, \`b\`) AS (SELECT * FROM \`t0\`) SELECT \`a\` AS \`it\` FROM \`x\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
    it("with1-1.0 -- use alias2", async () => {
        const q = withR(
            //
            t0.selectStar(),
            "x",
            ["a", "b"]
        )
            .do((acc) => select((f) => ({ it: f["x.a"] }), acc.x))
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `WITH \`x\`(\`a\`, \`b\`) AS (SELECT * FROM \`t0\`) SELECT \`x\`.\`a\` AS \`it\` FROM \`x\``
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });

    it("with1-1.1", async () => {
        const q = withR(
            //
            t0.selectStar(),
            "x",
            ["a", "b"]
        )
            .do((acc) => select((_f) => ({ it: sql(10) }), acc.x))
            .selectStar()
            .stringify();

        expect(q).toMatchInlineSnapshot(
            `SELECT * FROM (WITH \`x\`(\`a\`, \`b\`) AS (SELECT * FROM \`t0\`) SELECT 10 AS \`it\` FROM \`x\`)`
        );
        expect(await run(q)).toMatchInlineSnapshot(`Array []`);
    });
});
