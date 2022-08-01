/**
 * Represents https://www.sqlite.org/syntax/compound-select-stmt.html
 *
 *
 * @since 0.0.0
 */
import { consumeArrayCallback } from "../consume-fields";
import { StarSymbol } from "../data-wrappers";
import { printCompound } from "../print";
import { SafeString } from "../safe-string";
import {
    Joinable,
    NoSelectFieldsCompileError,
    RecordOfSelection,
    ScopeOfSelectStatement,
    ScopeShape,
    ScopeStorage,
    SelectionOfScope,
    SelectionOfSelectStatement,
    TableOrSubquery,
    UnionToIntersection,
    ValidAliasInSelection,
} from "../types";
import { makeArray } from "../utils";
import { Joined, JoinedFactory } from "./joined";
import { AliasedSelectStatement, SelectStatement } from "./select-statement";

/**
 * Represents https://www.sqlite.org/syntax/compound-select-stmt.html
 *
 * This class is not meant to be used directly, but rather through the `union`, `union`, `intersect`, `except` functions.
 *
 * @since 0.0.0
 */
export class Compound<
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
            readonly content: ReadonlyArray<
                TableOrSubquery<any, any, any, any>
            >;
            readonly qualifier: "UNION" | "UNION ALL" | "INTERSECT" | "EXCEPT";
            readonly orderBy: ReadonlyArray<SafeString>;
            readonly limit: SafeString | number | null;
            readonly scope: ScopeStorage;
            readonly alias?: string;
        }
    ) {}

    /**
     * @internal
     */
    public static __fromQualifier =
        (qualifier: "UNION" | "UNION ALL" | "INTERSECT" | "EXCEPT") =>
        <
            C extends
                | SelectStatement<any, any, any, any>
                | AliasedSelectStatement<any, any, any, any>,
            CS extends ReadonlyArray<
                | SelectStatement<any, any, any, any>
                | AliasedSelectStatement<any, any, any, any>
            >
        >(
            content: CS & {
                0: C;
            }
        ): Compound<
            SelectionOfSelectStatement<C>,
            never,
            ScopeOfSelectStatement<C> &
                UnionToIntersection<ScopeOfSelectStatement<CS[number]>>,
            | SelectionOfSelectStatement<C>
            | SelectionOfSelectStatement<CS[number]>
        > =>
            new Compound({
                content,
                qualifier,
                orderBy: [],
                limit: null,
                scope: Object.fromEntries(
                    content.map((it) => [it.__props.alias, void 0])
                ),
            });

    private copy = (): Compound<Selection, Alias, Scope, FlatScope> =>
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
        f:
            | ReadonlyArray<Selection | FlatScope>
            | ((
                  fields: Record<Selection | FlatScope, SafeString>
              ) => ReadonlyArray<SafeString> | SafeString)
    ): Compound<Selection, Alias, Scope, FlatScope> =>
        this.copy().setOrderBy([
            ...this.__props.orderBy,
            ...makeArray(consumeArrayCallback(f as any, this.__props.scope)),
        ]);

    /**
     * @since 0.0.0
     */
    public limit = (
        limit: SafeString | number
    ): Compound<Selection, Alias, Scope, FlatScope> =>
        this.copy().setLimit(limit);

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
                  fields: RecordOfSelection<FlatScope> &
                      SelectionOfScope<Scope> &
                      NoSelectFieldsCompileError
              ) => Record<NewSelection, SafeString>)
    ): SelectStatement<NewSelection | SubSelection, never, Scope, FlatScope> =>
        SelectStatement.__fromTableOrSubquery(
            this,
            _ as any,
            this.__props.scope as any,
            undefined
        );

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
    public stringify = (): string => printCompound(this);

    /**
     * @since 1.1.1
     */
    public apply = <Ret extends TableOrSubquery<any, any, any, any> = never>(
        fn: (it: this) => Ret
    ): Ret => fn(this);

    public as = <NewAlias extends string = never>(
        as: NewAlias
    ): AliasedCompound<Selection, NewAlias, Scope, FlatScope> =>
        new AliasedCompound(this.__props).__setAlias(as) as any;
}
export class AliasedCompound<
    // Selection extends string = never,
    // Alias extends string = never,
    // Scope extends ScopeShape = never,
    // FlatScope extends string = never
    Selection extends string,
    Alias extends string,
    Scope extends ScopeShape,
    FlatScope extends string
> extends Compound<Selection, Alias, Scope, FlatScope> {
    private __copy = (): AliasedCompound<Selection, Alias, Scope, FlatScope> =>
        new AliasedCompound({ ...this.__props });

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
     * @since 1.1.1
     */
    public apply = <Ret extends TableOrSubquery<any, any, any, any> = never>(
        fn: (it: this) => Ret
    ): Ret => fn(this);

    public as = <NewAlias extends string = never>(
        as: NewAlias
    ): AliasedCompound<Selection, NewAlias, Scope, FlatScope> =>
        this.__copy().__setAlias(as) as any;
}
