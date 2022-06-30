import { castSafe, fromNothing, isSafeString, sql } from "../../src";
import { addSimpleStringSerializer } from "../utils";
addSimpleStringSerializer();

describe("castSafe", () => {
    it("works", () => {
        expect(castSafe("abc").content).toBe("abc");
        expect(castSafe('"\'"').content).toBe('"\'"');
    });
});

describe("isSafeString", () => {
    it("works", () => {
        expect(isSafeString(sql(123))).toBe(true);
        expect(isSafeString(sql("123"))).toBe(true);
        expect(isSafeString(123)).toBe(false);
        expect(isSafeString("123")).toBe(false);
        expect(isSafeString(null)).toBe(false);
        expect(isSafeString(undefined)).toBe(false);
        expect(isSafeString({ a: 1 })).toBe(false);
    });
});

describe("safe-string", () => {
    it("works as function", () => {
        const q = fromNothing({
            string: sql("abc"),
            number: sql(123),
            null: sql(null),
        }).stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT 'abc' AS \`string\`, 123 AS \`number\`, NULL AS \`null\``
        );
    });

    it("throws if invalid type", () => {
        expect(() => sql(new Map() as any)).toThrow();
    });

    it("works as template string", () => {
        const q = fromNothing({
            raw: sql`abc`,
            string: sql`${"abc"}`,
            number: sql`${123}`,
            null: sql`${null}`,
        }).stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT abc AS \`raw\`, 'abc' AS \`string\`, 123 AS \`number\`, NULL AS \`null\``
        );
    });

    it("works as template string with arrays", () => {
        const q = fromNothing({
            it: sql`${["abc"]}`,
        }).stringify();
        expect(q).toMatchInlineSnapshot(`SELECT 'abc' AS \`it\``);
    });

    it("handles escaped values", () => {
        const q = fromNothing({
            a: sql("'"),
            b: sql("\0"),
            c: sql("\t"),
            d: sql('"'),
            e: sql("\\"),
        }).stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT '\\'' AS \`a\`, '\\0' AS \`b\`, '\\t' AS \`c\`, '\\"' AS \`d\`, '\\\\' AS \`e\``
        );
    });
    it("handles escaped values, not at start", () => {
        const q = fromNothing({
            a: sql("'abc'abc"),
            b: sql("\0abc\0abc"),
            c: sql("\tabc\tabc"),
            d: sql('"abc"abc'),
            e: sql("\\abc\\abc"),
        }).stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT '\\'abc\\'abc' AS \`a\`, '\\0abc\\0abc' AS \`b\`, '\\tabc\\tabc' AS \`c\`, '\\"abc\\"abc' AS \`d\`, '\\\\abc\\\\abc' AS \`e\``
        );
    });
});
