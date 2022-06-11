import { AliasedRows, SelectStarArgs, StarSymbol } from "../data-wrappers";
import { proxy } from "../proxy";
import { SafeString } from "../safe-string";
import { NoSelectFieldsCompileError } from "../types";
import { makeArray } from "../utils";
import { Compound } from "./compound";
import { Joined, JoinedFactory } from "./joined";
import { SelectStatement } from "./select-statement";

export class Table<Selection extends string, Alias extends string> {
    private constructor(
        /* @internal */
        public __columns: string[],
        /* @internal */
        public __alias: string,
        /* @internal */
        public __name: string
    ) {}

    public static define = <
        Selection extends string,
        Alias extends string = never
    >(
        columns: Selection[],
        alias: Alias,
        name: string = alias
    ): Table<Selection, Alias> => new Table(columns, alias, name);

    public select = <NewSelection extends string>(
        f: (
            f: Record<Selection | `${Alias}.${Selection}`, SafeString> &
                NoSelectFieldsCompileError
        ) => Record<NewSelection, SafeString>
    ): SelectStatement<
        never,
        Selection | `${Alias}.${Selection}`,
        NewSelection
    > => SelectStatement.__fromTableOrSubquery(this, [AliasedRows(f(proxy))]);

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
        Joined.__fromCommaJoin([
            {
                code: this,
                alias: this.__alias,
            },
            {
                code: table,
                alias: table.__alias,
            },
        ]);

    public joinTable = <Selection2 extends string, Alias2 extends string>(
        operator: string,
        table: Table<Selection2, Alias2>
    ): JoinedFactory<
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias}.${Selection}`
        | `${Alias2}.${Selection2}`,
        Alias | Alias2,
        Extract<Selection2, Selection>
    > =>
        JoinedFactory.__fromAll(
            [
                {
                    code: this,
                    alias: this.__alias,
                },
            ],
            [],
            {
                code: table,
                alias: table.__alias,
                operator,
            }
        );

    public commaJoinSelect = <
        With2 extends string,
        Scope2 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        selectAlias: Alias2,
        select: SelectStatement<With2, Scope2, Selection2>
    ): Joined<
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias}.${Selection}`
        | `${Alias2}.${Selection2}`,
        Alias | Alias2
    > =>
        Joined.__fromCommaJoin([
            {
                code: this,
                alias: this.__alias,
            },
            {
                code: select,
                alias: selectAlias,
            },
        ]);

    public joinSelect = <
        With2 extends string,
        Scope2 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        selectAlias: Alias2,
        operator: string,
        select: SelectStatement<With2, Scope2, Selection2>
    ): JoinedFactory<
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias}.${Selection}`
        | `${Alias2}.${Selection2}`,
        Alias | Alias2,
        Extract<Selection2, Selection>
    > =>
        JoinedFactory.__fromAll(
            [
                {
                    code: this,
                    alias: this.__alias,
                },
            ],
            [],
            {
                code: select,
                alias: selectAlias,
                operator,
            }
        );

    public commaJoinCompound = <
        Selection2 extends string,
        Alias2 extends string
    >(
        compoundAlias: Alias2,
        compound: Compound<Selection2, Selection2>
    ): Joined<
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias2}.${Selection2}`,
        Alias | Alias2
    > =>
        Joined.__fromCommaJoin([
            {
                code: this,
                alias: this.__alias,
            },
            {
                code: compound,
                alias: compoundAlias,
            },
        ]);
}

export const table = Table.define;