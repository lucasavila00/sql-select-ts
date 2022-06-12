import { absurd, hole, makeNonEmptyArray, makeArray } from "../../src/utils";

describe("makeArray", () => {
    it("works", () => {
        expect(() => makeArray([])).toMatchInlineSnapshot(`[Function]`);
        expect(makeArray("abc")).toMatchInlineSnapshot(`
            Array [
              "abc",
            ]
        `);
        expect(makeArray(123)).toMatchInlineSnapshot(`
            Array [
              123,
            ]
        `);
        expect(makeArray(["123"])).toMatchInlineSnapshot(`
            Array [
              "123",
            ]
        `);
    });
});
describe("makeNonEmptyArray", () => {
    it("works", () => {
        expect(() => makeNonEmptyArray([])).toThrow();
        expect(makeNonEmptyArray("abc")).toMatchInlineSnapshot(`
            Array [
              "abc",
            ]
        `);
        expect(makeNonEmptyArray(123)).toMatchInlineSnapshot(`
            Array [
              123,
            ]
        `);
        expect(makeNonEmptyArray(["123"])).toMatchInlineSnapshot(`
            Array [
              "123",
            ]
        `);
    });
});

describe("absurd", () => {
    it("throws", () => {
        expect(() =>
            absurd(
                // @ts-expect-error
                123
            )
        ).toThrow();
    });
});

describe("hole", () => {
    it("throws", () => {
        expect(() => hole()).toThrow();
    });
});
