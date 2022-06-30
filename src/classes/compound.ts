/**
 * Represents https://www.sqlite.org/syntax/compound-select-stmt.html
 *
 *
 * @since 0.0.0
 */
import { AliasedRows, StarSymbol } from "../data-wrappers";
import { printCompound } from "../print";
import { proxy } from "../proxy";
import { SafeString } from "../safe-string";
import { TableOrSubquery, NoSelectFieldsCompileError } from "../types";
import { makeArray } from "../utils";
import { Joined, JoinedFactory } from "./joined";
import { SelectStatement } from "./select-statement";
import { Table } from "./table";

type SelectionOfSelectStatement<T> = T extends SelectStatement<
    infer _Scope,
    infer Selection
>
    ? Selection
    : never;

/**
 * Represents https://www.sqlite.org/syntax/compound-select-stmt.html
 *
 * This class is not meant to be used directly, but rather through the `union`, `union`, `insersect`, `except` functions.
 *
 * @since 0.0.0
 */
export class Compound<Scope extends string, Selection extends string> {
    /* @internal */
    private constructor(
        /* @internal */
        public __props: {
            content: TableOrSubquery<any, any, any, any>[];
            qualifier: "UNION" | "UNION ALL" | "INTERSECT" | "EXCEPT";
            orderBy: SafeString[];
            limit: SafeString | number | null;
        }
    ) {}

    /**
     * @internal
     */
    public static union = <
        C extends SelectStatement<any, any>,
        CS extends SelectStatement<any, any>[]
    >(
        content: [C, ...CS]
    ): Compound<
        SelectionOfSelectStatement<C> | SelectionOfSelectStatement<CS[number]>,
        SelectionOfSelectStatement<C>
    > =>
        new Compound({ content, qualifier: "UNION", orderBy: [], limit: null });

    /**
     * @internal
     */
    public static unionAll = <
        C extends SelectStatement<any, any>,
        CS extends SelectStatement<any, any>[]
    >(
        content: [C, ...CS]
    ): Compound<
        SelectionOfSelectStatement<C> | SelectionOfSelectStatement<CS[number]>,
        SelectionOfSelectStatement<C>
    > =>
        new Compound({
            content,
            qualifier: "UNION ALL",
            orderBy: [],
            limit: null,
        });

    private copy = (): Compound<Scope, Selection> =>
        new Compound({ ...this.__props });

    private setOrderBy = (orderBy: SafeString[]): this => {
        this.__props = {
            ...this.__props,
            orderBy,
        };
        return this;
    };

    private setLimit = (limit: SafeString | number | null): this => {
        this.__props = {
            ...this.__props,
            limit,
        };
        return this;
    };

    /**
     * @since 0.0.0
     */
    public orderBy = (
        f: (
            fields: Record<Scope | Selection, SafeString>
        ) => SafeString[] | SafeString
    ): Compound<Scope, Selection> =>
        this.copy().setOrderBy([
            ...this.__props.orderBy,
            ...makeArray(f(proxy)),
        ]);

    /**
     * @since 0.0.0
     */
    public limit = (limit: SafeString | number): Compound<Scope, Selection> =>
        this.copy().setLimit(limit);

    /**
     * @since 0.0.0
     */
    public select = <NewSelection extends string>(
        f: (
            fields: Record<Selection | `main_alias.${Selection}`, SafeString> &
                NoSelectFieldsCompileError
        ) => Record<NewSelection, SafeString>
    ): SelectStatement<Selection | `main_alias.${Selection}`, NewSelection> =>
        SelectStatement.__fromTableOrSubquery(this, [AliasedRows(f(proxy))]);

    /**
     * @since 0.0.0
     */
    public selectStar = (): SelectStatement<Selection, Selection> =>
        SelectStatement.__fromTableOrSubquery(this, [StarSymbol()]);

    /**
     * @since 0.0.0
     */
    public joinTable = <
        Alias1 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        thisCompoundAlias: Alias1,
        operator: string,
        table: Table<Selection2, Alias2>
    ): JoinedFactory<
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias1}.${Selection}`
        | `${Alias2}.${Selection2}`,
        Alias1 | Alias2,
        Extract<Selection2, Selection>,
        Extract<Selection2, Selection>
    > =>
        JoinedFactory.__fromAll(
            [
                {
                    code: this,
                    alias: thisCompoundAlias,
                },
            ],
            [],
            {
                code: table,
                alias: table.__props.alias,
                operator,
            }
        );
    /**
     * @since 0.0.0
     */
    public commaJoinTable = <
        Alias1 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        thisSelectAlias: Alias1,
        table: Table<Selection2, Alias2>
    ): Joined<
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias1}.${Selection}`
        | `${Alias2}.${Selection2}`,
        Alias1 | Alias2,
        Extract<Selection2, Selection>
    > =>
        Joined.__fromCommaJoin([
            {
                code: this,
                alias: thisSelectAlias,
            },
            {
                code: table,
                alias: table.__props.alias,
            },
        ]);

    /**
     * @since 0.0.0
     */
    public joinSelect = <
        Alias1 extends string,
        Scope2 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        thisCompoundAlias: Alias1,
        operator: string,
        selectAlias: Alias2,
        select: SelectStatement<Scope2, Selection2>
    ): JoinedFactory<
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias2}.${Selection2}`
        | `${Alias1}.${Selection}`,
        Alias1 | Alias2,
        Extract<Selection2, Selection>,
        Extract<Selection2, Selection>
    > =>
        JoinedFactory.__fromAll(
            [
                {
                    code: this,
                    alias: thisCompoundAlias,
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
    public commaJoinSelect = <
        Alias1 extends string,
        Scope2 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        thisCompoundAlias: Alias1,
        selectAlias: Alias2,
        select: SelectStatement<Scope2, Selection2>
    ): Joined<
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias2}.${Selection2}`
        | `${Alias1}.${Selection}`,
        Alias1 | Alias2,
        Extract<Selection2, Selection>
    > =>
        Joined.__fromCommaJoin([
            {
                code: this,
                alias: thisCompoundAlias,
            },
            { code: select, alias: selectAlias },
        ]);

    /**
     * @since 0.0.0
     */
    public joinCompound = <
        Alias1 extends string,
        Scope2 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        thisCompoundAlias: Alias1,
        operator: string,
        compoundAlias: Alias2,
        compound: Compound<Scope2, Selection2>
    ): JoinedFactory<
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias2}.${Selection2}`
        | `${Alias1}.${Selection}`,
        Alias1 | Alias2,
        Extract<Selection2, Selection>,
        Extract<Selection2, Selection>
    > =>
        JoinedFactory.__fromAll(
            [
                {
                    code: this,
                    alias: thisCompoundAlias,
                },
            ],
            [],
            {
                code: compound,
                alias: compoundAlias,
                operator,
            }
        );

    /**
     * @since 0.0.0
     */
    public commaJoinCompound = <
        Alias1 extends string,
        Scope2 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        thisCompoundAlias: Alias1,
        compoundAlias: Alias2,
        compound: Compound<Scope2, Selection2>
    ): Joined<
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias2}.${Selection2}`
        | `${Alias1}.${Selection}`,
        Alias1 | Alias2,
        Extract<Selection2, Selection>
    > =>
        Joined.__fromCommaJoin([
            {
                code: this,
                alias: thisCompoundAlias,
            },
            {
                code: compound,
                alias: compoundAlias,
            },
        ]);

    /**
     * @since 0.0.0
     */
    public stringify = (): string => printCompound(this);
}