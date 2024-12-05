import { castSafe, fromNothing, isSafeString, dsql } from "../../src";
import { addSimpleStringSerializer } from "../utils";
addSimpleStringSerializer();

describe("castSafe", () => {
    it("works", () => {
        expect(castSafe("abc").content).toBe("abc");
        expect(castSafe('"\'"').content).toBe('"\'"');
    });
});

describe("serialize array", () => {
    it("works", () => {
        expect(dsql(["a", "b", "c"]).content).toMatchInlineSnapshot(`abc`);
        expect(dsql`${["a", "b", "c"]}`.content).toMatchInlineSnapshot(
            `'a', 'b', 'c'`
        );
    });
});
describe("chaining", () => {
    it("works", () => {
        const base = dsql`base`;
        expect(
            base.equals(1).greaterThan(2).lessThanOrEqual(3).content
        ).toMatchInlineSnapshot(`(((base = 1) > 2) <= 3)`);

        expect(
            base.different(1).lessThan(2).greaterThanOrEqual(3).content
        ).toMatchInlineSnapshot(`(((base != 1) < 2) >= 3)`);

        expect(base.and(1).or(2).content).toMatchInlineSnapshot(
            `((base AND 1) OR 2)`
        );

        expect(base.add(1).subtract(2).content).toMatchInlineSnapshot(
            `((base + 1) - 2)`
        );

        expect(base.multiply(1).divide(2).content).toMatchInlineSnapshot(
            `((base * 1) / 2)`
        );

        expect(base.desc().content).toMatchInlineSnapshot(`base DESC`);
        expect(base.asc().content).toMatchInlineSnapshot(`base ASC`);

        expect(base.in("a").content).toMatchInlineSnapshot(`(base IN 'a')`);
        expect(base.notIn("a").content).toMatchInlineSnapshot(
            `(base NOT IN 'a')`
        );
    });
});

describe("isSafeString", () => {
    it("works", () => {
        expect(isSafeString(dsql(123))).toBe(true);
        expect(isSafeString(dsql("123"))).toBe(true);
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
            string: dsql("abc"),
            number: dsql(123),
            null: dsql(null),
        }).stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT 'abc' AS \`string\`, 123 AS \`number\`, NULL AS \`null\``
        );
    });

    it("throws if invalid type", () => {
        expect(() => dsql(new Map() as any)).toThrow();
    });

    it("works as template string", () => {
        const q = fromNothing({
            raw: dsql`abc`,
            string: dsql`${"abc"}`,
            number: dsql`${123}`,
            null: dsql`${null}`,
        }).stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT abc AS \`raw\`, 'abc' AS \`string\`, 123 AS \`number\`, NULL AS \`null\``
        );
    });

    it("works as template string with arrays", () => {
        const q = fromNothing({
            it: dsql`${["abc"]}`,
        }).stringify();
        expect(q).toMatchInlineSnapshot(`SELECT 'abc' AS \`it\``);
    });

    it("handles escaped values", () => {
        const q = fromNothing({
            a: dsql("'"),
            b: dsql("\0"),
            c: dsql("\t"),
            d: dsql('"'),
            e: dsql("\\"),
        }).stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT '''' AS \`a\`, '\\0' AS \`b\`, '\\t' AS \`c\`, '\\"' AS \`d\`, '\\\\' AS \`e\``
        );
    });
    it("handles escaped values, not at start", () => {
        const q = fromNothing({
            a: dsql("'abc'abc"),
            b: dsql("\0abc\0abc"),
            c: dsql("\tabc\tabc"),
            d: dsql('"abc"abc'),
            e: dsql("\\abc\\abc"),
        }).stringify();
        expect(q).toMatchInlineSnapshot(
            `SELECT '''abc''abc' AS \`a\`, '\\0abc\\0abc' AS \`b\`, '\\tabc\\tabc' AS \`c\`, '\\"abc\\"abc' AS \`d\`, '\\\\abc\\\\abc' AS \`e\``
        );
    });
});
