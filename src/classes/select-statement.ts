/**
 *
 * Represents https://www.sqlite.org/syntax/simple-select-stmt.html
 *
 * @since 2.0.0
 */
import {
    consumeArrayCallback,
    consumeRecordCallback,
    consumeReplaceCallback,
} from "../consume-fields";
import { AliasedRows, StarSymbol } from "../data-wrappers";
import { printAliasedSelectStatement, printSelectStatement } from "../print";
import { SafeString, isSafeString } from "../safe-string";
import {
    ClickhouseWith,
    CTE,
    Fields,
    Joinable,
    NoSelectFieldsCompileError,
    ScopeStorage,
    SelectionRecord,
    SelectionRecordCallbackShape,
    SelectionWrapperTypes,
    TableOrSubquery,
} from "../types";
import { makeArray } from "../utils";
import { Joined, JoinedFactory } from "./joined";
import {
    AliasedStringifiedSelectStatement,
    StringifiedSelectStatement,
} from "./stringified-select-statement";

type ReplaceT = ReadonlyArray<readonly [string, SafeString | number]>;

/**
 *
 * Represents https://www.sqlite.org/syntax/simple-select-stmt.html
 *
 * This class is not meant to be used directly, but rather through the `fromNothing` function or from a table.
 *
 * @since 2.0.0
 */
export class SelectStatement {
    /**
     * @internal
     */
    protected constructor(
        /**
         * @internal
         */
        public __props: {
            readonly from: TableOrSubquery | null;
            readonly selection: SelectionWrapperTypes;
            readonly replace: ReplaceT;
            readonly orderBy: ReadonlyArray<SafeString>;
            readonly groupBy: ReadonlyArray<SafeString>;
            readonly limit: SafeString | number | null;
            readonly where: ReadonlyArray<SafeString>;
            readonly prewhere: ReadonlyArray<SafeString>;
            readonly except: ReadonlyArray<SafeString>;
            readonly having: ReadonlyArray<SafeString>;
            readonly distinct: boolean;
            readonly clickhouseWith: ReadonlyArray<ClickhouseWith>;
            readonly ctes: ReadonlyArray<CTE>;
            readonly alias?: string;
            readonly scope: ScopeStorage;
            readonly rollup: boolean;
        }
    ) {}

    /**
     * @internal
     */
    public static __fromTableOrSubqueryAndSelectionArray = (
        it: TableOrSubquery,
        selection: SelectionWrapperTypes,
        scope: ScopeStorage,
        alias?: string
    ): SelectStatement =>
        new SelectStatement({
            from: it,
            selection,
            replace: [],
            orderBy: [],
            groupBy: [],
            limit: null,
            where: [],
            prewhere: [],
            except: [],
            having: [],
            distinct: false,
            clickhouseWith: [],
            ctes: [],
            alias,
            scope,
            rollup: false,
        });

    /**
     * @internal
     */
    public static __fromTableOrSubquery = (
        it: TableOrSubquery,
        selection: SelectionRecordCallbackShape,
        scope: ScopeStorage,
        alias?: string
    ): SelectStatement =>
        new SelectStatement({
            from: it,
            selection: [consumeRecordCallback(selection, it.__props.scope)],
            replace: [],
            orderBy: [],
            groupBy: [],
            limit: null,
            where: [],
            prewhere: [],
            except: [],
            having: [],
            distinct: false,
            clickhouseWith: [],
            ctes: [],
            alias,
            scope,
            rollup: false,
        });

    /**
     * @internal
     */
    public static fromNothing = (it: Record<string, SafeString>): SelectStatement =>
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
                except: [],
                having: [],
                distinct: false,
                clickhouseWith: [],
                ctes: [],
                scope: {},
                alias: undefined,
                rollup: false,
            }
        );

    private copy = (): SelectStatement =>
        new SelectStatement({ ...this.__props });

    /**
     * @internal
     */
    protected setSelection = (selection: SelectionWrapperTypes): this => {
        this.__props = {
            ...this.__props,
            selection,
        };
        return this;
    };

    private setRollup = (rollup: boolean): this => {
        this.__props = {
            ...this.__props,
            rollup,
        };
        return this;
    };

    private setReplace = (replace: ReplaceT): this => {
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
    private setExcept = (except: ReadonlyArray<SafeString>): this => {
        this.__props = {
            ...this.__props,
            except,
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
     * @since 2.0.0
     */
    public clickhouse = {
        /**
         * @since 2.0.0
         */
        with_: (
            it: Record<
                string,
                | SelectStatement
                | AliasedSelectStatement
                | StringifiedSelectStatement
                | AliasedStringifiedSelectStatement
                | SafeString
            >
        ): SelectStatement =>
            this.copy().setClickhouseWith([
                ...this.__props.clickhouseWith,
                Object.fromEntries(
                    Object.entries(it).map(([key, value]) => [
                        key,
                        isSafeString(value)
                            ? StringifiedSelectStatement.fromSafeString(value)
                            : value,
                    ])
                ) as any,
            ]) as any,

        /**
         * @since 2.0.0
         */
        prewhere: (
            f:
                | ReadonlyArray<string>
                | ((
                      fields: Fields
                  ) => ReadonlyArray<SafeString> | SafeString)
        ): SelectStatement =>
            this.copy().setPrewhere([
                ...this.__props.prewhere,
                ...makeArray(
                    consumeArrayCallback(f as any, this.__props.scope)
                ),
            ]),

        /**
         * @since 2.0.0
         */
        except: (
            f:
                | ReadonlyArray<string>
                | ((
                      fields: Fields
                  ) => ReadonlyArray<SafeString> | SafeString)
        ): SelectStatement =>
            this.copy().setExcept([
                ...this.__props.except,
                ...makeArray(
                    consumeArrayCallback(f as any, this.__props.scope)
                ),
            ]),
        /**
         * @since 2.0.0
         */
        replace: (
            _: (
                f: Fields & NoSelectFieldsCompileError
            ) => ReplaceT
        ): SelectStatement =>
            this.copy().setReplace([
                ...this.__props.replace,
                ...(consumeReplaceCallback(
                    _ as any,
                    this.__props.scope
                ) as any),
            ]),

        withRollup: (): SelectStatement =>
            this.copy().setRollup(true),
    };

    /**
     * @since 2.0.0
     */
    public select = (
        _:
            | ReadonlyArray<string>
            | ((
                  fields: Fields & NoSelectFieldsCompileError
              ) => SelectionRecord)
    ): SelectStatement =>
        SelectStatement.__fromTableOrSubquery(this, _ as any, {}, undefined);

    /**
     * @since 2.0.0
     */
    public selectStar = (): SelectStatement =>
        SelectStatement.__fromTableOrSubqueryAndSelectionArray(
            this,
            [StarSymbol()],
            {},
            undefined
        );

    /**
     * @since 2.0.0
     */
    public appendSelectStar = (): SelectStatement =>
        this.copy().setSelection([...this.__props.selection, StarSymbol()]);

    /**
     * @since 2.0.0
     */
    public appendSelect = (
        _:
            | ReadonlyArray<string>
            | ((
                  fields: Fields & NoSelectFieldsCompileError
              ) => SelectionRecord)
    ): SelectStatement =>
        this.copy().setSelection([
            ...(this.__props.selection as any),
            consumeRecordCallback(_ as any, this.__props.scope),
        ]) as any;

    /**
     * @since 2.0.0
     */
    public where = (
        f:
            | ReadonlyArray<string>
            | ((
                  fields: Fields
              ) => ReadonlyArray<SafeString> | SafeString)
    ): SelectStatement =>
        this.copy().setWhere([
            ...this.__props.where,
            ...makeArray(consumeArrayCallback(f as any, this.__props.scope)),
        ]);

    /**
     * @since 2.0.0
     */
    public having = (
        f:
            | ReadonlyArray<string>
            | ((fields: Fields) => ReadonlyArray<SafeString> | SafeString)
    ): SelectStatement =>
        this.copy().setHaving([
            ...this.__props.having,
            ...makeArray(consumeArrayCallback(f as any, this.__props.scope)),
        ]);

    /**
     * @since 2.0.0
     */
    public distinct = (): SelectStatement =>
        this.copy().setDistinct(true);

    /**
     * @since 2.0.0
     */
    public orderBy = (
        f:
            | ReadonlyArray<string>
            | ((
                  fields: Fields
              ) => ReadonlyArray<SafeString> | SafeString)
    ): SelectStatement =>
        this.copy().setOrderBy([
            ...this.__props.orderBy,
            ...makeArray(consumeArrayCallback(f as any, this.__props.scope)),
        ]);

    /**
     * @since 2.0.0
     */
    public groupBy = (
        f:
            | ReadonlyArray<string>
            | ((fields: Fields) => ReadonlyArray<SafeString> | SafeString)
    ): SelectStatement =>
        this.copy().setGroupBy([
            ...this.__props.groupBy,
            ...makeArray(consumeArrayCallback(f as any, this.__props.scope)),
        ]);

    /**
     * @since 2.0.0
     */
    public limit = (
        limit: SafeString | number
    ): SelectStatement =>
        this.copy().setLimit(limit);

    /**
     * @since 2.0.0
     */
    public apply = <Ret extends TableOrSubquery = TableOrSubquery>(
        fn: (it: this) => Ret
    ): Ret => fn(this);

    /**
     * @since 2.0.0
     */
    public stringify = (): string => printSelectStatement(this);

    /**
     * @since 2.0.0
     */
    public as = (as: string): AliasedSelectStatement =>
        new AliasedSelectStatement(this.__props).__setAlias(as) as any;
}

/**
 * @since 2.0.0
 */
export class AliasedSelectStatement extends SelectStatement {
    private __copy = (): AliasedSelectStatement =>
        new AliasedSelectStatement({ ...this.__props });

    /**
     * @internal
     */
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

    /**
     * @since 2.0.0
     */
    public commaJoin = (_: Joinable): Joined =>
        Joined.__fromAll([this, _ as any], [], {
            [String(this.__props.alias)]: void 0,
            ...(_ as any).__props.scope,
        });

    /**
     * @since 2.0.0
     */
    public join = (operator: string, _: Joinable): JoinedFactory =>
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
     * @since 2.0.0
     */
    public apply = <Ret extends TableOrSubquery = TableOrSubquery>(
        fn: (it: this) => Ret
    ): Ret => fn(this);

    /**
     * @since 2.0.0
     */
    public stringify = (): string => printAliasedSelectStatement(this);

    /**
     * @since 2.0.0
     */
    public select = (
        _:
            | ReadonlyArray<string>
            | ((
                  fields: Fields & NoSelectFieldsCompileError
              ) => SelectionRecord)
    ): SelectStatement =>
        SelectStatement.__fromTableOrSubquery(this, _ as any, {}, undefined);

    /**
     * @since 2.0.0
     */
    public selectStar = (): SelectStatement =>
        SelectStatement.__fromTableOrSubqueryAndSelectionArray(
            this,
            [StarSymbol()],
            {},
            undefined
        );

    /**
     * @since 2.0.0
     */
    public appendSelectStar = (): AliasedSelectStatement =>
        this.__copy().setSelection([...this.__props.selection, StarSymbol()]);

    /**
     * @since 2.0.0
     */
    public as = (as: string): AliasedSelectStatement =>
        this.__copy().__setAlias(as) as any;
}
