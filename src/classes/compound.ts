/**
 * Represents https://www.sqlite.org/syntax/compound-select-stmt.html
 *
 *
 * @since 0.0.0
 */
import { consumeArrayCallback, consumeRecordCallback } from "../consume-fields";
import { AliasedRows, StarSymbol } from "../data-wrappers";
import { printCompound } from "../print";
import { SafeString } from "../safe-string";
import {
    TableOrSubquery,
    NoSelectFieldsCompileError,
    SelectionOfSelectStatement,
    ScopeStorage,
    ScopeOfSelectStatement,
    ScopeShape,
    RecordOfSelection,
    SelectionOfScope,
    UnionToIntersection,
    ValidAliasInSelection,
    Joinable,
} from "../types";
import { makeArray } from "../utils";
import { Joined, JoinedFactory } from "./joined";
import { SelectStatement } from "./select-statement";
import { StringifiedSelectStatement } from "./stringified-select-statement";
import { Table } from "./table";

/**
 * Represents https://www.sqlite.org/syntax/compound-select-stmt.html
 *
 * This class is not meant to be used directly, but rather through the `union`, `union`, `intersect`, `except` functions.
 *
 * @since 0.0.0
 */
export class Compound<
    Selection extends string = never,
    Alias extends string = never,
    Scope extends ScopeShape = never
> {
    /* @internal */
    private constructor(
        /* @internal */
        public __props: {
            readonly content: ReadonlyArray<TableOrSubquery<any, any, any>>;
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
    public static union = <
        C extends SelectStatement<any, any, any>,
        CS extends ReadonlyArray<SelectStatement<any, any, any>>
    >(
        content: CS & {
            0: C;
        }
    ): Compound<
        SelectionOfSelectStatement<C>,
        never,
        ScopeOfSelectStatement<C> &
            UnionToIntersection<ScopeOfSelectStatement<CS[number]>>
    > =>
        new Compound({
            content,
            qualifier: "UNION",
            orderBy: [],
            limit: null,
            scope: Object.fromEntries(
                content.map((it) => [it.__props.alias, void 0])
            ),
        });

    /**
     * @internal
     */
    public static unionAll = <
        C extends SelectStatement<any, any, any>,
        CS extends ReadonlyArray<SelectStatement<any, any, any>>
    >(
        content: CS & {
            0: C;
        }
    ): Compound<
        SelectionOfSelectStatement<C>,
        never,
        ScopeOfSelectStatement<C> &
            UnionToIntersection<ScopeOfSelectStatement<CS[number]>>
    > =>
        new Compound({
            content,
            qualifier: "UNION ALL",
            orderBy: [],
            limit: null,
            scope: Object.fromEntries(
                content.map((it) => [it.__props.alias, void 0])
            ),
        });

    /**
     * @internal
     */
    public static intersect = <
        C extends SelectStatement<any, any, any>,
        CS extends ReadonlyArray<SelectStatement<any, any, any>>
    >(
        content: CS & {
            0: C;
        }
    ): Compound<
        SelectionOfSelectStatement<C>,
        never,
        ScopeOfSelectStatement<C> &
            UnionToIntersection<ScopeOfSelectStatement<CS[number]>>
    > =>
        new Compound({
            content,
            qualifier: "INTERSECT",
            orderBy: [],
            limit: null,
            scope: Object.fromEntries(
                content.map((it) => [it.__props.alias, void 0])
            ),
        });

    /**
     * @internal
     */
    public static except = <
        C extends SelectStatement<any, any, any>,
        CS extends ReadonlyArray<SelectStatement<any, any, any>>
    >(
        content: CS & {
            0: C;
        }
    ): Compound<
        SelectionOfSelectStatement<C>,
        never,
        ScopeOfSelectStatement<C> &
            UnionToIntersection<ScopeOfSelectStatement<CS[number]>>
    > =>
        new Compound({
            content,
            qualifier: "EXCEPT",
            orderBy: [],
            limit: null,
            scope: Object.fromEntries(
                content.map((it) => [it.__props.alias, void 0])
            ),
        });
    private copy = (): Compound<Selection, Alias, Scope> =>
        new Compound({ ...this.__props });

    private setAlias = (alias: string): this => {
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
            | ReadonlyArray<Selection | Scope[keyof Scope]>
            | ((
                  fields: Record<Selection | Scope[keyof Scope], SafeString>
              ) => ReadonlyArray<SafeString> | SafeString)
    ): Compound<Selection, Alias, Scope> =>
        this.copy().setOrderBy([
            ...this.__props.orderBy,
            ...makeArray(consumeArrayCallback(f as any, this.__props.scope)),
        ]);

    /**
     * @since 0.0.0
     */
    public limit = (
        limit: SafeString | number
    ): Compound<Selection, Alias, Scope> => this.copy().setLimit(limit);

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
                  fields: RecordOfSelection<Scope[keyof Scope]> &
                      SelectionOfScope<Scope> &
                      NoSelectFieldsCompileError
              ) => Record<NewSelection, SafeString>)
    ): SelectStatement<NewSelection | SubSelection, never, Scope> =>
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
        { [key in Alias]: Selection }
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
    // /**
    //  * @since 0.0.0
    //  */
    // public commaJoinTable = <
    //     Alias1 extends string,
    //     Scope2 extends string,
    //     Selection2 extends string,
    //     Alias2 extends string
    // >(
    //     thisSelectAlias: Alias1,
    //     table: Table<Scope2, Selection2, Alias2>
    // ): Joined<
    //     Selection,
    //     | Exclude<Selection, Selection2>
    //     | Exclude<Selection2, Selection>
    //     | `${Alias1}.${Selection}`
    //     | `${Alias2}.${Selection2}`,
    //     Alias1 | Alias2
    // > =>
    //     Joined.__fromCommaJoin([
    //         {
    //             code: this,
    //             alias: thisSelectAlias,
    //         },
    //         {
    //             code: table,
    //             alias: table.__props.alias,
    //         },
    //     ]);

    /**
     * @since 0.0.0
     */
    public stringify = (): string => printCompound(this);

    /**
     * @since 1.1.1
     */
    public apply = <Ret extends TableOrSubquery<any, any, any> = never>(
        fn: (it: this) => Ret
    ): Ret => fn(this);

    public as = <NewAlias extends string = never>(
        as: NewAlias
    ): Compound<Selection, NewAlias, Scope> => this.copy().setAlias(as) as any;
}
