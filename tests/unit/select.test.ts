import { select, table } from "../../src";
const cols = ["a", "b"] as const;
it("alias from table", () => {
    const t = table(cols, "t");

    t.select((f) => ({ abc: f["t.a"] }));
    select((f) => ({ abc: f["t.a"] }), t);
    expect(1).toBe(1);
});
