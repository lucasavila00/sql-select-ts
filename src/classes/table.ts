import { AliasedRowsURI, SelectStarArgs, StarSymbol } from "../data-wrappers";
import { proxy } from "../proxy";
import { SafeString } from "../safe-string";
import { makeArray, wrapAlias } from "../utils";
import { Compound } from "./compound";
import { Joined } from "./joined";
import { SelectStatement } from "./select-statement";

export class Table<Selection extends string, Alias extends string> {
    private constructor(public __alias: string, public __name: string) {}

    public static define = <
        Selection extends string,
        Alias extends string = never
    >(
        _columns: Selection[],
        alias: Alias,
        name: string = alias
    ): Table<Selection, Alias> => new Table(alias, name);

    public select = <NewSelection extends string>(
        f: (
            f: Record<Selection | `${Alias}.${Selection}`, SafeString>
        ) => Record<NewSelection, SafeString>
    ): SelectStatement<
        never,
        Selection | `${Alias}.${Selection}`,
        NewSelection
    > =>
        SelectStatement.__fromTableOrSubquery(this, [
            { _tag: AliasedRowsURI, content: f(proxy) },
        ]);

    public selectStar = (
        args?: SelectStarArgs
    ): SelectStatement<
        never,
        Selection | `main_alias.${Selection}`,
        Selection
    > => SelectStatement.__fromTableOrSubquery(this, [StarSymbol(args)]);

    public commaJoinTable = <Selection2 extends string, Alias2 extends string>(
        table: Table<Selection2, Alias2>
    ): Joined<
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias}.${Selection}`
        | `${Alias2}.${Selection2}`,
        Alias | Alias2
    > =>
        Joined.__fromCommaJoinHead([
            {
                code: this.__name,
                alias: this.__alias,
            },
            {
                code: table.__name,
                alias: table.__alias,
            },
        ]);

    public joinTable = <Selection2 extends string, Alias2 extends string>(
        operator: string,
        table: Table<Selection2, Alias2>,
        on?: (
            f: Record<
                | Exclude<Selection, Selection2>
                | Exclude<Selection2, Selection>
                | `${Alias}.${Selection}`
                | `${Alias2}.${Selection2}`,
                SafeString
            >
        ) => SafeString | SafeString[]
    ): Joined<
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias}.${Selection}`
        | `${Alias2}.${Selection2}`,
        Alias | Alias2
    > =>
        Joined.__fromProperJoin(
            [
                {
                    code: this.__name,
                    alias: this.__alias,
                },
            ],
            [
                {
                    code: table,
                    alias: table.__alias,
                    operator,
                    constraint: on != null ? makeArray(on(proxy)) : [],
                },
            ]
        );

    public commaJoinQuery = <
        With2 extends string,
        Scope2 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        aliasOfQuery: Alias2,
        table: SelectStatement<With2, Scope2, Selection2>
    ): Joined<
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias}.${Selection}`
        | `${Alias2}.${Selection2}`,
        Alias | Alias2
    > =>
        Joined.__fromCommaJoinHead([
            {
                code: this.__name,
                alias: this.__alias,
            },
            {
                code: table.__printProtected(true),
                alias: aliasOfQuery,
            },
        ]);

    public commaJoinCompound = <
        Selection2 extends string,
        Alias2 extends string
    >(
        aliasOfCompound: Alias2,
        table: Compound<Selection2, Selection2>
    ): Joined<
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias2}.${Selection2}`,
        Alias | Alias2
    > =>
        Joined.__fromCommaJoinHead([
            {
                code: this.__name,
                alias: this.__alias,
            },
            {
                code: table.__printProtected(true),
                alias: aliasOfCompound,
            },
        ]);

    public __printProtected = (): string => {
        if (this.__name === this.__alias) {
            return this.__name;
        }
        return `${this.__name} AS ${wrapAlias(this.__alias)}`;
    };
}

export const table = Table.define;
