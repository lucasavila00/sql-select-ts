/**
 *
 * Represents https://www.sqlite.org/syntax/simple-select-stmt.html
 *
 * @since 0.0.0
 */
import { consumeArrayCallback, consumeRecordCallback } from "../consume-fields";
import { AliasedRows, StarOfAliasSymbol, StarSymbol } from "../data-wrappers";
import { printSelectStatement } from "../print";
import { SafeString } from "../safe-string";
import {
    TableOrSubquery,
    NoSelectFieldsCompileError,
    ClickhouseWith,
    CTE,
    ScopeShape,
    RecordOfSelection,
    SelectionOfScope,
    SelectionRecordCallbackShape,
    SelectionWrapperTypes,
    ScopeStorage,
    Joinable,
    CompileError,
    ValidAliasInSelection,
} from "../types";
import { hole, makeArray } from "../utils";
import { Compound } from "./compound";
import { Joined, JoinedFactory } from "./joined";
import { StringifiedSelectStatement } from "./stringified-select-statement";
import { Table } from "./table";

type ReplaceT<Selection extends string> = ReadonlyArray<
    readonly [Selection, SafeString | number]
>;

/**
 *
 * Represents https://www.sqlite.org/syntax/simple-select-stmt.html
 *
 * This class is not meant to be used directly, but rather through the `fromNothing` function or from a table.
 *
 * @since 0.0.0
 */
export class SelectStatement<
    // Selection extends string = never,
    // Alias extends string = never,
    // Scope extends ScopeShape = never,
    // FlatScope extends string = never
    Selection extends string,
    Alias extends string,
    Scope extends ScopeShape,
    FlatScope extends string
> {
    /* @internal */
    protected constructor(
        /* @internal */
        public __props: {
            readonly from: TableOrSubquery<any, any, any, any> | null;
            readonly selection: SelectionWrapperTypes;
            readonly replace: ReplaceT<Selection>;
            readonly orderBy: ReadonlyArray<SafeString>;
            readonly groupBy: ReadonlyArray<SafeString>;
            readonly limit: SafeString | number | null;
            readonly where: ReadonlyArray<SafeString>;
            readonly prewhere: ReadonlyArray<SafeString>;
            readonly having: ReadonlyArray<SafeString>;
            readonly distinct: boolean;
            readonly clickhouseWith: ReadonlyArray<ClickhouseWith>;
            readonly ctes: ReadonlyArray<CTE>;
            readonly alias?: string;
            readonly scope: ScopeStorage;
        }
    ) {}

    /* @internal */
    public static __fromTableOrSubqueryAndSelectionArray = (
        it: TableOrSubquery<any, any, any, any>,
        selection: SelectionWrapperTypes,
        scope: ScopeStorage,
        alias?: string
    ): SelectStatement<any, any, any, any> =>
        new SelectStatement({
            from: it,
            selection,
            replace: [],
            orderBy: [],
            groupBy: [],
            limit: null,
            where: [],
            prewhere: [],
            having: [],
            distinct: false,
            clickhouseWith: [],
            ctes: [],
            alias,
            scope,
        });

    /* @internal */
    public static __fromTableOrSubquery = (
        it: TableOrSubquery<any, any, any, any>,
        selection: SelectionRecordCallbackShape,
        scope: ScopeStorage,
        alias?: string
    ): SelectStatement<any, any, any, any> =>
        new SelectStatement({
            from: it,
            selection: [consumeRecordCallback(selection, it.__props.scope)],
            replace: [],
            orderBy: [],
            groupBy: [],
            limit: null,
            where: [],
            prewhere: [],
            having: [],
            distinct: false,
            clickhouseWith: [],
            ctes: [],
            alias,
            scope,
        });

    /**
     * @internal
     */
    public static fromNothing = <NewSelection extends string = never>(
        it: Record<NewSelection, SafeString>
    ): SelectStatement<NewSelection, never, never, never> =>
        new SelectStatement(
            //
            {
                from: null,
                selection: [AliasedRows(it)],
                replace: [],
                orderBy: [],
                groupBy: [],
                limit: null,
                where: [],
                prewhere: [],
                having: [],
                distinct: false,
                clickhouseWith: [],
                ctes: [],
                scope: {},
                alias: undefined,
            }
        );

    private copy = (): SelectStatement<Selection, Alias, Scope, FlatScope> =>
        new SelectStatement({ ...this.__props });

    private setSelection = (selection: SelectionWrapperTypes): this => {
        this.__props = {
            ...this.__props,
            selection,
        };
        return this;
    };

    private setReplace = (replace: ReplaceT<Selection>): this => {
        this.__props = {
            ...this.__props,
            replace,
        };
        return this;
    };

    private setWhere = (where: ReadonlyArray<SafeString>): this => {
        this.__props = {
            ...this.__props,
            where,
        };
        return this;
    };

    private setOrderBy = (orderBy: ReadonlyArray<SafeString>): this => {
        this.__props = {
            ...this.__props,
            orderBy,
        };
        return this;
    };
    private setGroupBy = (groupBy: ReadonlyArray<SafeString>): this => {
        this.__props = {
            ...this.__props,
            groupBy,
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
    private setClickhouseWith = (
        clickhouseWith: ReadonlyArray<ClickhouseWith>
    ): this => {
        this.__props = {
            ...this.__props,
            clickhouseWith,
        };
        return this;
    };
    private setCtes = (ctes: ReadonlyArray<CTE>): this => {
        this.__props = {
            ...this.__props,
            ctes,
        };
        return this;
    };
    /**
     * @internal
     */
    public __setCtes = this.setCtes;
    private setPrewhere = (prewhere: ReadonlyArray<SafeString>): this => {
        this.__props = {
            ...this.__props,
            prewhere,
        };
        return this;
    };
    private setHaving = (having: ReadonlyArray<SafeString>): this => {
        this.__props = {
            ...this.__props,
            having,
        };
        return this;
    };

    /**
     *
     * Clickhouse specific syntax extensions.
     *
     * @since 0.0.0
     */
    public clickhouse = {
        //     /**
        //      * @since 0.0.0
        //      */
        //     with_: <NewSelection extends string>(
        //         it: Record<
        //             NewSelection,
        //             SelectStatement<any, any, any> | StringifiedSelectStatement<any>
        //         >
        //     ): SelectStatement<Alias, Scope | NewSelection, Selection> =>
        //         this.copy().setClickhouseWith([
        //             ...this.__props.clickhouseWith,
        //             it,
        //         ]) as any,

        /**
         * @since 0.0.0
         */
        prewhere: (
            f:
                | ReadonlyArray<Selection | FlatScope>
                | ((
                      fields: Record<Selection | FlatScope, SafeString>
                  ) => ReadonlyArray<SafeString> | SafeString)
        ): SelectStatement<Selection, Alias, Scope, FlatScope> =>
            this.copy().setPrewhere([
                ...this.__props.prewhere,
                ...makeArray(
                    consumeArrayCallback(f as any, this.__props.scope)
                ),
            ]),

        // /**
        //  * @since 0.0.0
        //  */
        // replace: <NewSelection extends string>(
        //     f: (
        //         f: Record<Selection | Scope, SafeString> &
        //             NoSelectFieldsCompileError
        //     ) => ReplaceT<Selection>
        // ): SelectStatement<Alias, Scope, Selection | NewSelection> =>
        //     this.copy().setReplace([
        //         ...this.__props.replace,
        //         ...f(proxy),
        //     ]) as any,
    };

    /**
     * @since 0.0.0
     */
    public select = <
        NewSelection extends string = never,
        SubSelection extends Selection = never
    >(
        _:
            | ReadonlyArray<SubSelection>
            | ((
                  fields: RecordOfSelection<Selection> &
                      SelectionOfScope<{
                          [key in Alias]: Selection;
                      }> &
                      NoSelectFieldsCompileError
              ) => Record<NewSelection, SafeString>)
    ): SelectStatement<
        NewSelection | SubSelection,
        never,
        {
            [key in Alias]: Selection;
        },
        Selection
    > => SelectStatement.__fromTableOrSubquery(this, _ as any, {}, undefined);

    /**
     * @since 0.0.0
     */
    public selectStar = (): SelectStatement<
        Selection,
        never,
        { [key in Alias]: Selection },
        Selection
    > =>
        SelectStatement.__fromTableOrSubqueryAndSelectionArray(
            this,
            [StarSymbol()],
            {},
            undefined
        );

    /**
     * @since 0.0.0
     */
    public appendSelectStar = (): SelectStatement<
        Selection,
        Alias,
        Scope & { [key in Alias]: Selection },
        Selection
    > => this.copy().setSelection([...this.__props.selection, StarSymbol()]);

    /**
     * @since 0.0.0
     */
    public appendSelect = <NewSelection extends string = never>(
        _:
            | ReadonlyArray<Selection>
            | ((
                  fields: RecordOfSelection<Selection> &
                      RecordOfSelection<FlatScope> &
                      SelectionOfScope<Scope> &
                      NoSelectFieldsCompileError
              ) => Record<NewSelection, SafeString>)
    ): SelectStatement<Selection | NewSelection, Alias, Scope, FlatScope> =>
        this.copy().setSelection([
            ...(this.__props.selection as any),
            consumeRecordCallback(_ as any, this.__props.scope),
        ]) as any;

    /**
     * @since 0.0.0
     */
    public where = (
        f:
            | ReadonlyArray<Selection | FlatScope>
            | ((
                  fields: Record<Selection | FlatScope, SafeString> &
                      SelectionOfScope<Scope>
              ) => ReadonlyArray<SafeString> | SafeString)
    ): SelectStatement<Selection, Alias, Scope, FlatScope> =>
        this.copy().setWhere([
            ...this.__props.where,
            ...makeArray(consumeArrayCallback(f as any, this.__props.scope)),
        ]);

    /**
     * @since 0.0.0
     */
    public having = (
        f:
            | ReadonlyArray<Selection | FlatScope>
            | ((
                  fields: Record<Selection | FlatScope, SafeString>
              ) => ReadonlyArray<SafeString> | SafeString)
    ): SelectStatement<Selection, Alias, Scope, FlatScope> =>
        this.copy().setHaving([
            ...this.__props.having,
            ...makeArray(consumeArrayCallback(f as any, this.__props.scope)),
        ]);

    /**
     * @since 0.0.0
     */
    public distinct = (): SelectStatement<Selection, Alias, Scope, FlatScope> =>
        this.copy().setDistinct(true);

    /**
     * @since 0.0.0
     */
    public orderBy = (
        f:
            | ReadonlyArray<Selection | FlatScope>
            | ((
                  fields: Record<Selection | FlatScope, SafeString> &
                      SelectionOfScope<Scope>
              ) => ReadonlyArray<SafeString> | SafeString)
    ): SelectStatement<Selection, Alias, Scope, FlatScope> =>
        this.copy().setOrderBy([
            ...this.__props.orderBy,
            ...makeArray(consumeArrayCallback(f as any, this.__props.scope)),
        ]);

    /**
     * @since 0.0.0
     */
    public groupBy = (
        f:
            | ReadonlyArray<Selection | FlatScope>
            | ((
                  fields: Record<Selection | FlatScope, SafeString>
              ) => ReadonlyArray<SafeString> | SafeString)
    ): SelectStatement<Selection, Alias, Scope, FlatScope> =>
        this.copy().setGroupBy([
            ...this.__props.groupBy,
            ...makeArray(consumeArrayCallback(f as any, this.__props.scope)),
        ]);

    /**
     * @since 0.0.0
     */
    public limit = (
        limit: SafeString | number
    ): SelectStatement<Selection, Alias, Scope, FlatScope> =>
        this.copy().setLimit(limit);

    /**
     * @since 1.1.1
     */
    public apply = <Ret extends TableOrSubquery<any, any, any, any> = never>(
        fn: (it: this) => Ret
    ): Ret => fn(this);

    /**
     * @since 0.0.0
     */
    public stringify = (): string => printSelectStatement(this);

    public as = <NewAlias extends string = never>(
        as: NewAlias
    ): AliasedSelectStatement<Selection, NewAlias, Scope, FlatScope> =>
        new AliasedSelectStatement(this.__props).__setAlias(as) as any;
}

export class AliasedSelectStatement<
    // Selection extends string = never,
    // Alias extends string = never,
    // Scope extends ScopeShape = never,
    // FlatScope extends string = never
    Selection extends string,
    Alias extends string,
    Scope extends ScopeShape,
    FlatScope extends string
> extends SelectStatement<Selection, Alias, Scope, FlatScope> {
    private __copy = (): AliasedSelectStatement<
        Selection,
        Alias,
        Scope,
        FlatScope
    > => new AliasedSelectStatement({ ...this.__props });

    public __setAlias = (alias: string): this => {
        this.__props = {
            ...this.__props,
            alias,
            scope: {
                ...this.__props.scope,
                [alias]: void 0,
            },
        };
        return this;
    };

    public commaJoin = <
        Selection2 extends string = never,
        Alias2 extends string = never,
        Scope2 extends ScopeShape = never,
        FlatScope2 extends string = never
    >(
        _: ValidAliasInSelection<
            Joinable<Selection2, Alias2, Scope2, FlatScope2>,
            Alias2
        >
    ): Joined<
        never,
        never,
        {
            [key in Alias]: Selection;
        } & {
            [key in Alias2]: Selection2;
        },
        Selection | Selection2
    > =>
        Joined.__fromAll([this, _ as any], [], {
            [String(this.__props.alias)]: void 0,
            ...(_ as any).__props.scope,
        });

    /**
     * @since 0.0.0
     */
    public join = <
        Selection2 extends string = never,
        Alias2 extends string = never,
        Scope2 extends ScopeShape = never,
        FlatScope2 extends string = never
    >(
        operator: string,
        _: ValidAliasInSelection<
            Joinable<Selection2, Alias2, Scope2, FlatScope2>,
            Alias2
        >
    ): JoinedFactory<
        {
            [key in Alias]: Selection;
        } & {
            [key in Alias2]: Selection2;
        },
        Extract<Selection, Selection2>
    > =>
        JoinedFactory.__fromAll(
            [this],
            [],
            {
                code: _ as any,
                operator,
            },
            {
                [String(this.__props.alias)]: void 0,
                ...(_ as any).__props.scope,
            }
        );

    /**
     * @since 1.1.1
     */
    public apply = <Ret extends TableOrSubquery<any, any, any, any> = never>(
        fn: (it: this) => Ret
    ): Ret => fn(this);

    /**
     * @since 0.0.0
     */
    public stringify = (): string => printSelectStatement(this);

    public as = <NewAlias extends string = never>(
        as: NewAlias
    ): AliasedSelectStatement<Selection, NewAlias, Scope, FlatScope> =>
        this.__copy().__setAlias(as) as any;
}
