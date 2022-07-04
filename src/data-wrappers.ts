import { SafeString } from "./safe-string";

const StarSymbolURI = "StarSymbolURI" as const;

export type StarSymbol = { _tag: typeof StarSymbolURI };
export const isStarSymbol = (it: any): it is StarSymbol =>
    it?._tag === StarSymbolURI;

export const StarSymbol = (): StarSymbol => ({
    _tag: StarSymbolURI,
});

const StarOfAliasSymbolURI = "StarOfAliasSymbol" as const;
export type StarOfAliasSymbol = {
    _tag: typeof StarOfAliasSymbolURI;
    aliases: ReadonlyArray<string>;
};
export const isStarOfAliasSymbol = (it: any): it is StarOfAliasSymbol =>
    it?._tag === StarOfAliasSymbolURI;

export const StarOfAliasesSymbol = (
    aliases: ReadonlyArray<string>
): StarOfAliasSymbol => ({
    _tag: StarOfAliasSymbolURI,
    aliases,
});

const AliasedRowsURI = "AliasedRows" as const;
export type AliasedRows<Selection extends string> = {
    _tag: typeof AliasedRowsURI;
    content: Record<Selection, SafeString>;
};

export const AliasedRows = <Selection extends string>(
    content: Record<Selection, SafeString>
): AliasedRows<Selection> => ({
    _tag: AliasedRowsURI,
    content,
});
