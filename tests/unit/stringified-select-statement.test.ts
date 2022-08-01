import { castSafe, fromStringifiedSelectStatement, table } from "../../src";
const cols = ["a", "b"] as const;
describe("select unit", () => {
    it("apply", () => {
        const q = fromStringifiedSelectStatement<"a">(
            castSafe(table(cols, "a").selectStar().stringify())
        ).apply((it) => it.select(["a"]));
        expect(q.stringify()).toMatchInlineSnapshot(
            `"SELECT \`a\` AS \`a\` FROM (SELECT * FROM \`a\`)"`
        );
    });

    it("apply + alias", () => {
        const q = fromStringifiedSelectStatement<"a">(
            castSafe(table(cols, "a").selectStar().stringify())
        )
            .as("alias1")
            .apply((it) => it.select(["a"]));
        expect(q.stringify()).toMatchInlineSnapshot(
            `"SELECT \`a\` AS \`a\` FROM (SELECT * FROM \`a\`) AS \`alias1\`"`
        );
    });

    it("apply type checks", () => {
        fromStringifiedSelectStatement<"a">(
            castSafe(table(cols, "a").selectStar().stringify())
        )
            .apply((it) => it.select(["a"]))
            .select((f) => ({
                b:
                    //@ts-expect-error
                    f.b,
            }));

        expect(1).toBe(1);
    });
});
