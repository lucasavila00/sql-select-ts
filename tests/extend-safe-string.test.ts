import { buildSerializer, buildSql } from "../src";
import { addSimpleStringSerializer } from "./utils";
addSimpleStringSerializer();

const boolSerializer = buildSerializer({
    check: (it: unknown): it is boolean => typeof it == "boolean",
    serialize: (it: boolean): string => (it ? "1" : "0"),
});
const dateSerializer = buildSerializer({
    check: (it: unknown): it is Date => it instanceof Date,
    serialize: (it: Date): string => "'" + it.toISOString() + "'",
});

const sql2 = buildSql([boolSerializer, dateSerializer]);

describe("extend safe string", () => {
    it("works", () => {
        const a = { a: 1 };
        try {
            // @ts-expect-error
            sql2`${a}`;
            // @ts-expect-error
            sql2(a);
        } catch (e) {}

        const d = new Date("2022-06-30T03:31:42.035Z");
        const it = sql2`${d} = ${true}`;
        expect(it.content).toMatchInlineSnapshot(
            `'2022-06-30T03:31:42.035Z' = 1`
        );
        expect(sql2(true).content).toMatchInlineSnapshot(`1`);
        expect(sql2(true).content).toMatchInlineSnapshot(`1`);
        expect(sql2(d).content).toMatchInlineSnapshot(
            `'2022-06-30T03:31:42.035Z'`
        );
        const it2 = sql2`${123} = ${"abc"}`;
        expect(it2.content).toMatchInlineSnapshot(`123 = 'abc'`);
    });
});
