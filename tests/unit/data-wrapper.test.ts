import {
    isStarOfAliasSymbol,
    isStarSymbol,
    StarOfAliasesSymbol,
    StarSymbol,
} from "../../src/data-wrappers";

describe("isStarSymbol", () => {
    it("works", () => {
        expect(isStarSymbol(false)).toBe(false);
        expect(isStarSymbol(null)).toBe(false);
        expect(isStarSymbol(undefined)).toBe(false);
        expect(isStarSymbol("abc")).toBe(false);
        expect(isStarSymbol(123)).toBe(false);
        expect(isStarSymbol(StarSymbol())).toBe(true);
    });
});

describe("isStarOfAliasSymbol", () => {
    it("works", () => {
        expect(isStarOfAliasSymbol(false)).toBe(false);
        expect(isStarOfAliasSymbol(null)).toBe(false);
        expect(isStarOfAliasSymbol(undefined)).toBe(false);
        expect(isStarOfAliasSymbol("abc")).toBe(false);
        expect(isStarOfAliasSymbol(123)).toBe(false);
        expect(isStarOfAliasSymbol(StarOfAliasesSymbol(["a"]))).toBe(true);
    });
});
