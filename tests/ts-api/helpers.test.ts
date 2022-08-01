import { RowOf, table } from "../../src";

const consume = (it: any) => it;
test("RowOf", () => {
    const t1 = table(["id", "name"], "users");
    const q = t1.selectStar();
    type Ret = RowOf<typeof q>;
    const ret: Ret = { id: 1, name: null };
    consume(ret.id);
    consume(ret.name);
    //@ts-expect-error
    consume(ret.abc);
    expect(1).toBe(1);
});
