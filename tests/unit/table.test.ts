import { table } from "../../src";

const cols = ["a", "b"] as const;
describe("table", () => {
    it("columns readonly", () => {
        table(cols, "t");
        expect(1).toBe(1);
    });

    it("dot in name", () => {
        const q = table(cols, "system.tables").selectStar();
        expect(q.stringify()).toMatchInlineSnapshot(
            `"SELECT * FROM \`system\`.\`tables\`"`
        );
    });

    it("apply", () => {
        const q = table(cols, "a").apply((it) => it.select(["a"]));
        expect(q.stringify()).toMatchInlineSnapshot(
            `"SELECT \`a\` AS \`a\` FROM \`a\`"`
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
