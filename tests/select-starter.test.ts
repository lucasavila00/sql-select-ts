import { table, select, selectStar } from "../src";
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
    );
    expect(1).toBe(1);
});
it("type checks2", () => {
    const x = select(
        (f) => ({
            col3: f.a,
        }),
        fromTable1
    );
    x.select((f) => ({
        x:
            //@ts-expect-error
            f.abc,
    }));
    expect(1).toBe(1);
});

it("shorthand - sample", () => {
    const str =
        //
        select(
            (f) => ({
                a: f.a,
                b: f.b,
            }),
            fromTable1
        )
            .selectStar()
            .select((f) => ({ abc: f.a }))
            .stringify();

    expect(format(str)).toMatchInlineSnapshot(`
        "SELECT
          \`a\` AS \`abc\`
        FROM
          (
            SELECT
              *
            FROM
              (
                SELECT
                  \`a\` AS \`a\`,
                  \`b\` AS \`b\`
                FROM
                  \`t1\`
              )
          )"
    `);
});

it("shorthand", () => {
    const str =
        //
        select(["a", "b"], fromTable1)
            .selectStar()
            .select((f) => ({ abc: f.a }))
            .stringify();

    expect(format(str)).toMatchInlineSnapshot(`
        "SELECT
          \`a\` AS \`abc\`
        FROM
          (
            SELECT
              *
            FROM
              (
                SELECT
                  \`a\` AS \`a\`,
                  \`b\` AS \`b\`
                FROM
                  \`t1\`
              )
          )"
    `);
});
it("shorthand - type checks sample", () => {
    select(
        (f) => ({
            a: f.a,
            b: f.b,
        }),
        fromTable1
    )
        .selectStar()
        //@ts-expect-error
        .select((f) => ({ abc: f.c }))
        .stringify();

    expect(1).toBe(1);
});

it("shorthand -- type checks", () => {
    select(["a", "b"], fromTable1)
        .selectStar()
        //@ts-expect-error
        .select((f) => ({ abc: f.c }))
        .stringify();

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
        )
            .select((f) => ({ abc: f.col1 }))
            .stringify();

    expect(format(str)).toMatchInlineSnapshot(`
        "SELECT
          \`col1\` AS \`abc\`
        FROM
          (
            SELECT
              \`a\` AS \`col1\`,
              \`b\` AS \`col2\`
            FROM
              \`t1\`
          )"
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
it("3 layers star", () => {
    const str = selectStar(
        selectStar(
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
          *
        FROM
          (
            SELECT
              *
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
