/**
 *
 * Represents https://www.sqlite.org/syntax/simple-select-stmt.html
 *
 * @since 0.0.0
 */
import { AliasedRows, StarOfAliasSymbol, StarSymbol } from "../data-wrappers";
import { printSelectStatement } from "../print";
import { proxy } from "../proxy";
import { SafeString } from "../safe-string";
import {
    TableOrSubquery,
    NoSelectFieldsCompileError,
    ClickhouseWith,
} from "../types";
import { makeArray } from "../utils";
import { Compound } from "./compound";
import { Joined, JoinedFactory } from "./joined";
import { Table } from "./table";

type SelectionWrapperTypes<Selection extends string> = (
    | AliasedRows<Selection>
    | StarSymbol
    | StarOfAliasSymbol
)[];

/**
 *
 * Represents https://www.sqlite.org/syntax/simple-select-stmt.html
 *
 * This class is not meant to be used directly, but rather through the `fromNothing` function or from a table.
 *
 * @since 0.0.0
 */
export class SelectStatement<Scope extends string, Selection extends string> {
    /* @internal */
    private constructor(
        /* @internal */
        public __from: TableOrSubquery<any, any, any, any> | null,
        /* @internal */
        public __selection: SelectionWrapperTypes<Selection>,
        /* @internal */
        public __orderBy: SafeString[],
        /* @internal */
        public __limit: SafeString | number | null,
        /* @internal */
        public __where: SafeString[],
        /* @internal */
        public __distinct: boolean,
        /* @internal */
        public __clickhouseWith: ClickhouseWith[]
    ) {}

    /* @internal */
    public static __fromTableOrSubquery = (
        it: TableOrSubquery<any, any, any, any>,
        selection: SelectionWrapperTypes<any>
    ): SelectStatement<any, any> =>
        new SelectStatement(
            //
            it,
            selection,
            [],
            null,
            [],
            false,
            []
        );
    /**
     * @internal
     */
    public static fromNothing = <NewSelection extends string>(
        it: Record<NewSelection, SafeString>
    ): SelectStatement<never, NewSelection> =>
        new SelectStatement(
            //
            null,
            [AliasedRows(it)],
            [],
            null,
            [],
            false,
            []
        );

    private copy = (): SelectStatement<Scope, Selection> =>
        new SelectStatement(
            this.__from,
            this.__selection,
            this.__orderBy,
            this.__limit,
            this.__where,
            this.__distinct,
            this.__clickhouseWith
        );

    private setSelection = (
        selection: SelectionWrapperTypes<Selection>
    ): this => {
        this.__selection = selection;
        return this;
    };

    private setWhere = (where: SafeString[]): this => {
        this.__where = where;
        return this;
    };

    private setOrderBy = (orderBy: SafeString[]): this => {
        this.__orderBy = orderBy;
        return this;
    };
    private setLimit = (limit: SafeString | number | null): this => {
        this.__limit = limit;
        return this;
    };
    private setDistinct = (distinct: boolean): this => {
        this.__distinct = distinct;
        return this;
    };
    private setClickhouseWith = (clickhouseWith: ClickhouseWith[]): this => {
        this.__clickhouseWith = clickhouseWith;
        return this;
    };

    /**
     * @since 0.0.0
     */
    public clickhouse = {
        with_: <NewSelection extends string>(
            it: Record<NewSelection, SelectStatement<any, any>>
        ): SelectStatement<Scope | NewSelection, Selection> =>
            this.copy().setClickhouseWith([
                ...this.__clickhouseWith,
                it,
            ]) as any,
    };

    /**
     * @since 0.0.0
     */
    public select = <NewSelection extends string>(
        f: (
            f: Record<Selection | `main_alias.${Selection}`, SafeString> &
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
    public appendSelectStar = (): SelectStatement<Selection, Selection> =>
        this.copy().setSelection([...this.__selection, StarSymbol()]);

    /**
     * @since 0.0.0
     */
    public appendSelect = <NewSelection extends string>(
        f: (
            f: Record<Selection | Scope, SafeString> &
                NoSelectFieldsCompileError
        ) => Record<NewSelection, SafeString>
    ): SelectStatement<Scope, Selection | NewSelection> =>
        this.copy().setSelection([
            ...(this.__selection as any),
            AliasedRows(f(proxy)),
        ]) as any;

    /**
     * @since 0.0.0
     */
    public where = (
        f: (
            fields: Record<Scope | Selection, SafeString>
        ) => SafeString[] | SafeString
    ): SelectStatement<Scope, Selection> =>
        this.copy().setWhere([...this.__where, ...makeArray(f(proxy))]);

    /**
     * @since 0.0.0
     */
    public distinct = (): SelectStatement<Scope, Selection> =>
        this.copy().setDistinct(true);

    /**
     * @since 0.0.0
     */
    public orderBy = (
        f: (
            fields: Record<Scope | Selection, SafeString>
        ) => SafeString[] | SafeString
    ): SelectStatement<Scope, Selection> =>
        this.copy().setOrderBy([...this.__orderBy, ...makeArray(f(proxy))]);

    /**
     * @since 0.0.0
     */
    public limit = (
        limit: SafeString | number
    ): SelectStatement<Scope, Selection> => this.copy().setLimit(limit);

    /**
     * @since 0.0.0
     */
    public commaJoinTable = <
        Alias1 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        thisQueryAlias: Alias1,
        table: Table<Selection2, Alias2>
    ): Joined<
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias1}.${Selection}`,
        Alias1 | Alias2,
        Extract<Selection2, Selection>
    > =>
        Joined.__fromCommaJoin([
            {
                code: this,
                alias: thisQueryAlias,
            },
            {
                code: table,
                alias: table.__alias,
            },
        ]);

    /**
     * @since 0.0.0
     */
    public joinTable = <
        Alias1 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        thisQueryAlias: Alias1,
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
                    alias: thisQueryAlias,
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
        Alias1 extends string,
        Scope2 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        thisSelectAlias: Alias1,
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
                alias: thisSelectAlias,
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
        Alias1 extends string,
        Scope2 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        thisSelectAlias: Alias1,
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
                    alias: thisSelectAlias,
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
        Alias1 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        thisSelectAlias: Alias1,
        compoundAlias: Alias2,
        compound: Compound<Selection2, Selection2>
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
                code: compound,
                alias: compoundAlias,
            },
        ]);

    /**
     * @since 0.0.0
     */
    public joinCompound = <
        Alias1 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        thisSelectAlias: Alias1,
        operator: string,
        compoundAlias: Alias2,
        compound: Compound<Selection2, Selection2>
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
                    alias: thisSelectAlias,
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
    public print = (): string => printSelectStatement(this);
}
