import { table } from "../../src";

describe("table", () => {
    it("columns readonly", () => {
        const cols = ["a", "b"] as const;
        table(cols, "t");
        expect(1).toBe(1);
    });
});
