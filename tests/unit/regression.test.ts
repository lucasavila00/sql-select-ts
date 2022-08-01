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
