import { dsql, table } from "../../src";

test("selectStarOfAliases", () => {
    const cols = ["a", "b"] as const;
    const q = table(cols, "t")
        .select((_f) => ({ a: dsql(1) }))
        .as("m")
        .join("LEFT", table(cols, "t").selectStar().as("a2"))
        .noConstraint()
        .selectStarOfAliases(["a2"])
        .clickhouse.replace((f) => [["a", f.a2.a]]);

    expect(q.stringify()).toMatchInlineSnapshot(
        `"SELECT a2.* REPLACE (\`a2\`.\`a\` AS \`a\`) FROM (SELECT 1 AS \`a\` FROM \`t\`) AS \`m\` LEFT JOIN (SELECT * FROM \`t\`) AS \`a2\`"`
    );
});

test("alias name collision", () => {
    const cols = ["a", "b"] as const;
    const q = table(cols, "a").select((f) => ({ a: f.a.a }));

    expect(q.stringify()).toMatchInlineSnapshot(
        `"SELECT \`a\`.\`a\` AS \`a\` FROM \`a\`"`
    );

    const q0 = table(cols, "a").select((f) => ({ a: f.a }));
    expect(q0.stringify()).toMatchInlineSnapshot(
        `"SELECT \`a\` AS \`a\` FROM \`a\`"`
    );

    const q1 = table(cols, "a").select((f) => ({ a: dsql`SUM(${f.a})` }));
    expect(q1.stringify()).toMatchInlineSnapshot(
        `"SELECT SUM(\`a\`) AS \`a\` FROM \`a\`"`
    );
});

test("system.parts", () => {
    const cols = ["a", "b"] as const;
    const q = table(cols, "system.parts").select((f) => ({ a: f.a }));

    expect(q.stringify()).toMatchInlineSnapshot(
        `"SELECT \`a\` AS \`a\` FROM \`system\`.\`parts\`"`
    );
});
