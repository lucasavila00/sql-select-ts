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
        public __props: {
            from: TableOrSubquery<any, any, any, any> | null;
            selection: SelectionWrapperTypes<Selection>;
            orderBy: SafeString[];
            limit: SafeString | number | null;
            where: SafeString[];
            prewhere: SafeString[];
            distinct: boolean;
            clickhouseWith: ClickhouseWith[];
        }
    ) {}

    /* @internal */
    public static __fromTableOrSubquery = (
        it: TableOrSubquery<any, any, any, any>,
        selection: SelectionWrapperTypes<any>
    ): SelectStatement<any, any> =>
        new SelectStatement(
            //
            {
                from: it,
                selection,
                orderBy: [],
                limit: null,
                where: [],
                prewhere: [],
                distinct: false,
                clickhouseWith: [],
            }
        );
    /**
     * @internal
     */
    public static fromNothing = <NewSelection extends string>(
        it: Record<NewSelection, SafeString>
    ): SelectStatement<never, NewSelection> =>
        new SelectStatement(
            //
            {
                from: null,
                selection: [AliasedRows(it)],
                orderBy: [],
                limit: null,
                where: [],
                prewhere: [],
                distinct: false,
                clickhouseWith: [],
            }
        );

    private copy = (): SelectStatement<Scope, Selection> =>
        new SelectStatement({ ...this.__props });

    private setSelection = (
        selection: SelectionWrapperTypes<Selection>
    ): this => {
        this.__props = {
            ...this.__props,
            selection,
        };
        return this;
    };

    private setWhere = (where: SafeString[]): this => {
        this.__props = {
            ...this.__props,
            where,
        };
        return this;
    };

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
    private setDistinct = (distinct: boolean): this => {
        this.__props = {
            ...this.__props,
            distinct,
        };
        return this;
    };
    private setClickhouseWith = (clickhouseWith: ClickhouseWith[]): this => {
        this.__props = {
            ...this.__props,
            clickhouseWith,
        };
        return this;
    };
    private setPrewhere = (prewhere: SafeString[]): this => {
        this.__props = {
            ...this.__props,
            prewhere,
        };
        return this;
    };
    /**
     * @since 0.0.0
     */
    public clickhouse = {
        /**
         * @since 0.0.0
         */
        with_: <NewSelection extends string>(
            it: Record<NewSelection, SelectStatement<any, any>>
        ): SelectStatement<Scope | NewSelection, Selection> =>
            this.copy().setClickhouseWith([
                ...this.__props.clickhouseWith,
                it,
            ]) as any,

        /**
         * @since 0.0.0
         */
        prewhere: (
            f: (
                fields: Record<Scope | Selection, SafeString>
            ) => SafeString[] | SafeString
        ): SelectStatement<Scope, Selection> =>
            this.copy().setPrewhere([
                ...this.__props.prewhere,
                ...makeArray(f(proxy)),
            ]),
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
        this.copy().setSelection([...this.__props.selection, StarSymbol()]);

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
            ...(this.__props.selection as any),
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
        this.copy().setWhere([...this.__props.where, ...makeArray(f(proxy))]);

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
        this.copy().setOrderBy([
            ...this.__props.orderBy,
            ...makeArray(f(proxy)),
        ]);

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
                alias: table.__props.alias,
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
                alias: table.__props.alias,
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
