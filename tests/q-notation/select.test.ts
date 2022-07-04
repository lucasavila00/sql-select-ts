import { table } from "../../src";
import { q } from "../../src/q-notation/q";
import { select } from "../../src/q-notation/select";

it("works", () => {
    const cols = ["a", "b", "c"] as const;
    const t1 = table(cols, "t1");

    const str = q(
        //
        select((f) => ({
            col1: f.a,
            //@ts-expect-error
            col2: f.e,
        })),
        t1
    );

    expect(str).toMatchInlineSnapshot();
});
