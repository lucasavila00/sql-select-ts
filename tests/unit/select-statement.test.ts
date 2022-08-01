import { table } from "../../src";
const cols = ["a", "b"] as const;
describe("select unit", () => {
    it("apply", () => {
        const q = table(cols, "a")
            .selectStar()
            .apply((it) => it.select(["a"]));
        expect(q.stringify()).toMatchInlineSnapshot(
            `"SELECT \`a\` AS \`a\` FROM (SELECT * FROM \`a\`)"`
        );
    });

    it("apply + alias", () => {
        const q = table(cols, "a")
            .selectStar()
            .as("alias1")
            .apply((it) => it.select(["a"]));
        expect(q.stringify()).toMatchInlineSnapshot(
            `"SELECT \`a\` AS \`a\` FROM (SELECT * FROM \`a\`) AS \`alias1\`"`
        );
    });

    it("apply type checks", () => {
        table(cols, "a")
            .selectStar()
            .apply((it) => it.select(["a"]))
            .select((f) => ({
                b:
                    //@ts-expect-error
                    f.b,
            }));

        expect(1).toBe(1);
    });
});
