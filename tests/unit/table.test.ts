import { table } from "../../src";

describe("table", () => {
    it("columns readonly", () => {
        const cols = ["a", "b"] as const;
        table(cols, "t");
        expect(1).toBe(1);
    });

    it("dot in name", () => {
        const cols = ["a", "b"] as const;
        const q = table(cols, "system.tables").selectStar();
        expect(q.stringify()).toMatchInlineSnapshot(
            `"SELECT * FROM \`system\`.\`tables\`"`
        );
    });
});
