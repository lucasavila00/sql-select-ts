import { table, unionAll } from "../../src";
import * as NEA from "fp-ts/lib/NonEmptyArray";
const cols = ["a", "b"] as const;
describe("table", () => {
    it("works", () => {
        const q1 = table(cols, "a").selectStar();
        const q2 = table(cols, "b").selectStar();
        const u = unionAll([q1, q2]);
        expect(u.stringify()).toMatchInlineSnapshot(
            `"SELECT * FROM \`a\` UNION ALL SELECT * FROM \`b\`"`
        );
    });

    it("loops", () => {
        const q1 = table(cols, "a").selectStar();

        const it = NEA.fromReadonlyNonEmptyArray([1, 2, 3]);
        const arr = NEA.map(() => q1)(it);

        const u = unionAll(arr);
        expect(u.stringify()).toMatchInlineSnapshot(
            `"SELECT * FROM \`a\` UNION ALL SELECT * FROM \`a\` UNION ALL SELECT * FROM \`a\`"`
        );
    });

    it("unwrapped loop", () => {
        const q1 = table(cols, "a").selectStar();
        const u = unionAll([q1, q1, q1]);
        expect(u.stringify()).toMatchInlineSnapshot(
            `"SELECT * FROM \`a\` UNION ALL SELECT * FROM \`a\` UNION ALL SELECT * FROM \`a\`"`
        );
    });
});
