import { sql, table } from "../../src";

describe("table", () => {
    it("columns readonly", () => {
        const cols = ["a", "b"] as const;
        const q = table(cols, "t").select((_f) => ({ a: sql(1) }));

        q.joinSelect("m", "LEFT", "q2", q).on((f) => [
            //@ts-expect-error
            f.a,
        ]);

        q.joinSelect("m", "LEFT", "q2", q)
            .using(["a"])
            .selectStar()
            //@ts-expect-error
            .clickhouse.replace((_f) => [["m.a", 1]]);

        q.joinSelect("m", "LEFT", "q2", q)
            .using(["a"])
            .selectStar()
            .clickhouse.replace((_f) => [["a", 1]]);

        expect(1).toBe(1);
    });
});
