import { SafeString } from "./safe-string";

const StarSymbolURI = "StarSymbolURI" as const;

export type StarSymbol = { _tag: typeof StarSymbolURI; distinct: boolean };
export const isStarSymbol = (it: any): it is StarSymbol =>
    it?._tag === StarSymbolURI;

export type SelectStarArgs = {
    distinct?: boolean;
};
export const StarSymbol = ({
    distinct = false,
}: SelectStarArgs = {}): StarSymbol => ({
    _tag: StarSymbolURI,
    distinct,
});

const StarOfAliasSymbolURI = "StarOfAliasSymbol" as const;
export type StarOfAliasSymbol = {
    _tag: typeof StarOfAliasSymbolURI;
    distinct: boolean;
    aliases: string[];
};
export const isStarOfAliasSymbol = (it: any): it is StarOfAliasSymbol =>
    it?._tag === StarOfAliasSymbolURI;

export const StarOfAliasesSymbol = (
    aliases: string[],
    { distinct = false }: SelectStarArgs = {}
): StarOfAliasSymbol => ({
    _tag: StarOfAliasSymbolURI,
    distinct,
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
