/**
 *
 * Represents https://www.sqlite.org/syntax/simple-select-stmt.html
 *
 * @since 0.0.0
 */
import { consumeArrayCallback, consumeRecordCallback } from "../consume-fields";
import { AliasedRows, StarOfAliasSymbol, StarSymbol } from "../data-wrappers";
import { printSelectStatement } from "../print";
import { proxy } from "../proxy";
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
    Selection extends string = never,
    Alias extends string = never,
    Scope extends ScopeShape = never
> {
    /* @internal */
    private constructor(
        /* @internal */
        public __props: {
            readonly from: TableOrSubquery<any, any, any> | null;
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
    public static __fromTableOrSubquery = (
        it: TableOrSubquery<any, any, any>,
        selection: SelectionRecordCallbackShape,
        scope: ScopeStorage,
        alias?: string
    ): SelectStatement<any, any, any> =>
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
    public static fromNothing = <
        NewSelection extends string = never,
        NewAlias extends string = never
    >(
        it: Record<NewSelection, SafeString>,
        as?: NewAlias
    ): SelectStatement<NewSelection, NewAlias, never> =>
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
                alias: as,
            }
        );

    private copy = (): SelectStatement<Selection, Alias, Scope> =>
        new SelectStatement({ ...this.__props });

    private setSelection = (selection: SelectionWrapperTypes): this => {
        this.__props = {
            ...this.__props,
            selection,
        };
        return this;
    };

    // private setReplace = (replace: ReplaceT<Selection>): this => {
    //     this.__props = {
    //         ...this.__props,
    //         replace,
    //     };
    //     return this;
    // };

    // private setWhere = (where: ReadonlyArray<SafeString>): this => {
    //     this.__props = {
    //         ...this.__props,
    //         where,
    //     };
    //     return this;
    // };

    // private setOrderBy = (orderBy: ReadonlyArray<SafeString>): this => {
    //     this.__props = {
    //         ...this.__props,
    //         orderBy,
    //     };
    //     return this;
    // };
    // private setGroupBy = (groupBy: ReadonlyArray<SafeString>): this => {
    //     this.__props = {
    //         ...this.__props,
    //         groupBy,
    //     };
    //     return this;
    // };
    // private setLimit = (limit: SafeString | number | null): this => {
    //     this.__props = {
    //         ...this.__props,
    //         limit,
    //     };
    //     return this;
    // };
    // private setDistinct = (distinct: boolean): this => {
    //     this.__props = {
    //         ...this.__props,
    //         distinct,
    //     };
    //     return this;
    // };
    // private setClickhouseWith = (
    //     clickhouseWith: ReadonlyArray<ClickhouseWith>
    // ): this => {
    //     this.__props = {
    //         ...this.__props,
    //         clickhouseWith,
    //     };
    //     return this;
    // };
    // private setCtes = (ctes: ReadonlyArray<CTE>): this => {
    //     this.__props = {
    //         ...this.__props,
    //         ctes,
    //     };
    //     return this;
    // };
    // /**
    //  * @internal
    //  */
    // public __setCtes = this.setCtes;
    // private setPrewhere = (prewhere: ReadonlyArray<SafeString>): this => {
    //     this.__props = {
    //         ...this.__props,
    //         prewhere,
    //     };
    //     return this;
    // };
    // private setHaving = (having: ReadonlyArray<SafeString>): this => {
    //     this.__props = {
    //         ...this.__props,
    //         having,
    //     };
    //     return this;
    // };
    // /**
    //  *
    //  * Clickhouse specific syntax extensions.
    //  *
    //  * @since 0.0.0
    //  */
    // public clickhouse = {
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

    //     /**
    //      * @since 0.0.0
    //      */
    //     prewhere: (
    //         f:
    //             | ReadonlyArray<Scope | Selection>
    //             | ((
    //                   fields: Record<Scope | Selection, SafeString>
    //               ) => ReadonlyArray<SafeString> | SafeString)
    //     ): SelectStatement<Alias, Scope, Selection> =>
    //         this.copy().setPrewhere([
    //             ...this.__props.prewhere,
    //             ...makeArray(consumeArrayCallback(f)),
    //         ]),

    //     /**
    //      * @since 0.0.0
    //      */
    //     replace: <NewSelection extends string>(
    //         f: (
    //             f: Record<Selection | Scope, SafeString> &
    //                 NoSelectFieldsCompileError
    //         ) => ReplaceT<Selection>
    //     ): SelectStatement<Alias, Scope, Selection | NewSelection> =>
    //         this.copy().setReplace([
    //             ...this.__props.replace,
    //             ...f(proxy),
    //         ]) as any,
    // };

    /**
     * @since 0.0.0
     */
    public select = <
        NewSelection extends string = never,
        SubSelection extends Selection = never,
        NewAlias extends string = never
    >(
        _:
            | ReadonlyArray<SubSelection>
            | ((
                  fields: RecordOfSelection<Selection> &
                      SelectionOfScope<{
                          [key in Alias]: Selection;
                      }> &
                      NoSelectFieldsCompileError
              ) => Record<NewSelection, SafeString>),
        as?: NewAlias
    ): SelectStatement<
        NewSelection | SubSelection,
        NewAlias,
        {
            [key in Alias]: Selection;
        }
    > =>
        SelectStatement.__fromTableOrSubquery(
            this,
            _ as any,
            this.__props.scope,
            as
        );

    // /**
    //  * @since 0.0.0
    //  */
    // public selectStar = (): SelectStatement<Alias, Selection, Selection> =>
    //     SelectStatement.__fromTableOrSubquery(this, [StarSymbol()]);

    // /**
    //  * @since 0.0.0
    //  */
    // public appendSelectStar = (): SelectStatement<
    //     Alias,
    //     Selection,
    //     Selection
    // > => this.copy().setSelection([...this.__props.selection, StarSymbol()]);

    /**
     * @since 0.0.0
     */
    public appendSelect = <NewSelection extends string = never>(
        _:
            | ReadonlyArray<Selection>
            | ((
                  fields: RecordOfSelection<Selection> &
                      SelectionOfScope<Scope> &
                      NoSelectFieldsCompileError
              ) => Record<NewSelection, SafeString>)
    ): SelectStatement<Selection | NewSelection, Alias, Scope> =>
        this.copy().setSelection([
            ...(this.__props.selection as any),
            consumeRecordCallback(_ as any, this.__props.scope),
        ]) as any;

    // /**
    //  * @since 0.0.0
    //  */
    // public where = (
    //     f:
    //         | ReadonlyArray<Scope | Selection>
    //         | ((
    //               fields: Record<Scope | Selection, SafeString>
    //           ) => ReadonlyArray<SafeString> | SafeString)
    // ): SelectStatement<Alias, Scope, Selection> =>
    //     this.copy().setWhere([
    //         ...this.__props.where,
    //         ...makeArray(consumeArrayCallback(f)),
    //     ]);

    // /**
    //  * @since 0.0.0
    //  */
    // public having = (
    //     f:
    //         | ReadonlyArray<Scope | Selection>
    //         | ((
    //               fields: Record<Scope | Selection, SafeString>
    //           ) => ReadonlyArray<SafeString> | SafeString)
    // ): SelectStatement<Alias, Scope, Selection> =>
    //     this.copy().setHaving([
    //         ...this.__props.having,
    //         ...makeArray(consumeArrayCallback(f)),
    //     ]);

    // /**
    //  * @since 0.0.0
    //  */
    // public distinct = (): SelectStatement<Alias, Scope, Selection> =>
    //     this.copy().setDistinct(true);

    // /**
    //  * @since 0.0.0
    //  */
    // public orderBy = (
    //     f:
    //         | ReadonlyArray<Scope | Selection>
    //         | ((
    //               fields: Record<Scope | Selection, SafeString>
    //           ) => ReadonlyArray<SafeString> | SafeString)
    // ): SelectStatement<Alias, Scope, Selection> =>
    //     this.copy().setOrderBy([
    //         ...this.__props.orderBy,
    //         ...makeArray(consumeArrayCallback(f)),
    //     ]);

    // /**
    //  * @since 0.0.0
    //  */
    // public groupBy = (
    //     f:
    //         | ReadonlyArray<Scope | Selection>
    //         | ((
    //               fields: Record<Scope | Selection, SafeString>
    //           ) => ReadonlyArray<SafeString> | SafeString)
    // ): SelectStatement<Alias, Scope, Selection> =>
    //     this.copy().setGroupBy([
    //         ...this.__props.groupBy,
    //         ...makeArray(consumeArrayCallback(f)),
    //     ]);

    // /**
    //  * @since 0.0.0
    //  */
    // public limit = (
    //     limit: SafeString | number
    // ): SelectStatement<Alias, Scope, Selection> => this.copy().setLimit(limit);

    // /**
    //  * @since 0.0.0
    //  */
    // public commaJoinTable = <
    //     Alias1 extends string,
    //     Scope2 extends string,
    //     Selection2 extends string,
    //     Alias2 extends string
    // >(
    //     thisQueryAlias: Alias1,
    //     table: Table<Scope2, Selection2, Alias2>
    // ): Joined<
    //     Selection,
    //     | Exclude<Selection, Selection2>
    //     | Exclude<Selection2, Selection>
    //     | `${Alias1}.${Selection}`,
    //     Alias1 | Alias2
    // > =>
    //     Joined.__fromCommaJoin([
    //         {
    //             code: this,
    //             alias: thisQueryAlias,
    //         },
    //         {
    //             code: table,
    //             alias: table.__props.alias,
    //         },
    //     ]);

    public join = <
        Selection2 extends string = never,
        Alias2 extends string = never,
        Scope2 extends ScopeShape = never
    >(
        operator: string,
        _: ValidAliasInSelection<Joinable<Selection2, Alias2, Scope2>, Alias2>
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
    public apply = <Ret extends TableOrSubquery<any, any, any> = never>(
        fn: (it: this) => Ret
    ): Ret => fn(this);

    /**
     * @since 0.0.0
     */
    public stringify = (): string => printSelectStatement(this);
}
