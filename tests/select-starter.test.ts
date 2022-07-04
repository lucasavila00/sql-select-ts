import { table, select } from "../src";
import { format } from "sql-formatter";

const cols = ["a", "b", "c"] as const;
const fromTable1 = table(cols, "t1");
it("type checks", () => {
    select(
        (f) => ({
            //@ts-expect-error
            col3: f.e,
        }),
        fromTable1
    ),
        expect(1).toBe(1);
});
it("works", () => {
    const str =
        //
        select(
            (f) => ({
                col1: f.a,
                col2: f.b,
            }),
            fromTable1
        ).stringify();

    expect(format(str)).toMatchInlineSnapshot(`
        "SELECT
          \`a\` AS \`col1\`,
          \`b\` AS \`col2\`
        FROM
          \`t1\`"
    `);
});

it("2 layers", () => {
    const str = select(
        (f) => ({
            col1: f.colX,
            col2: f.colY,
        }),
        select(
            (f) => ({
                colX: f.a,
                colY: f.b,
            }),
            fromTable1
        )
    ).stringify();

    expect(format(str)).toMatchInlineSnapshot(`
        "SELECT
          \`colX\` AS \`col1\`,
          \`colY\` AS \`col2\`
        FROM
          (
            SELECT
              \`a\` AS \`colX\`,
              \`b\` AS \`colY\`
            FROM
              \`t1\`
          )"
    `);
});

it("3 layers", () => {
    const str = select(
        (f) => ({
            colA: f.col1,
            colB: f.col2,
        }),
        select(
            (f) => ({
                col1: f.colX,
                col2: f.colY,
            }),
            select(
                (f) => ({
                    colX: f.a,
                    colY: f.b,
                }),
                fromTable1
            )
        )
    ).stringify();

    expect(format(str)).toMatchInlineSnapshot(`
        "SELECT
          \`col1\` AS \`colA\`,
          \`col2\` AS \`colB\`
        FROM
          (
            SELECT
              \`colX\` AS \`col1\`,
              \`colY\` AS \`col2\`
            FROM
              (
                SELECT
                  \`a\` AS \`colX\`,
                  \`b\` AS \`colY\`
                FROM
                  \`t1\`
              )
          )"
    `);
});
