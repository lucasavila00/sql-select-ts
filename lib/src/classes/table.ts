/**
 * @since 0.0.0
 */
import { AliasedRows, StarSymbol } from "../data-wrappers";
import { proxy } from "../proxy";
import { SafeString } from "../safe-string";
import { NoSelectFieldsCompileError } from "../types";
import { Compound } from "./compound";
import { Joined, JoinedFactory } from "./joined";
import { SelectStatement } from "./select-statement";

/**
 * @since 0.0.0
 */
export class Table<Selection extends string, Alias extends string> {
    /* @internal */
    private constructor(
        /* @internal */
        public __columns: string[],
        /* @internal */
        public __alias: string,
        /* @internal */
        public __name: string
    ) {}

    /*  @internal */
    public static define = <Selection extends string, Alias extends string>(
        columns: Selection[],
        alias: Alias,
        name: string = alias
    ): Table<Selection, Alias> => new Table(columns, alias, name);

    /**
     * @since 0.0.0
     */
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

    /**
     * @since 0.0.0
     */
    public selectStar = (): SelectStatement<
        never,
        Selection | `main_alias.${Selection}`,
        Selection
    > => SelectStatement.__fromTableOrSubquery(this, [StarSymbol()]);

    /**
     * @since 0.0.0
     */
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

    /**
     * @since 0.0.0
     */
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

    /**
     * @since 0.0.0
     */
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

    /**
     * @since 0.0.0
     */
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

    /**
     * @since 0.0.0
     */
    public commaJoinCompound = <
        Selection2 extends string,
        Alias2 extends string
    >(
        compoundAlias: Alias2,
        compound: Compound<Selection2, Selection2>
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
                code: compound,
                alias: compoundAlias,
            },
        ]);

    /**
     * @since 0.0.0
     */
    public joinCompound = <Selection2 extends string, Alias2 extends string>(
        compoundAlias: Alias2,
        operator: string,
        compound: Compound<Selection2, Selection2>
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
                code: compound,
                alias: compoundAlias,
                operator,
            }
        );
}
