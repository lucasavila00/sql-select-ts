import { dsql, table } from "../../src";

const cols = ["a", "b"] as const;
describe("table", () => {
    it("columns readonly", () => {
        const q = table(cols, "t")
            .select((_f) => ({ a: dsql(1) }))
            .as("m");

        q.join("LEFT", q)
            .using(["a"])
            .selectStar()
            //@ts-expect-error
            .clickhouse.replace((_f) => [["m.a", 1]]);

        q.join("LEFT", q)
            .using(["a"])
            .selectStar()
            .clickhouse.replace((_f) => [["a", 1]]);

        expect(1).toBe(1);
    });

    it("apply", () => {
        const t = table(cols, "a");
        const q = t
            .commaJoin(t.selectStar().as("a2"))
            .apply((it) => it.select(["a"]));

        expect(q.stringify()).toMatchInlineSnapshot(
            `"SELECT \`a\` AS \`a\` FROM \`a\`, (SELECT * FROM \`a\`) AS \`a2\`"`
        );
    });

    it("apply type checks", () => {
        table(cols, "a")
            .apply((it) => it.select(["a"]))
            .select((f) => ({
                b:
                    //@ts-expect-error
                    f.b,
            }));

        expect(1).toBe(1);
    });
});
