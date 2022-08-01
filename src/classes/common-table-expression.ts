/**
 * @since 1.0.0
 */
import { CTE, ScopeShape, TableOrSubquery } from "../types";
import { hole } from "../utils";
import { AliasedSelectStatement, SelectStatement } from "./select-statement";
import { Table } from "./table";

/**
 * @since 1.0.0
 */
export class CommonTableExpressionFactory<
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
    private constructor(
        /* @internal */
        public __props: {
            readonly ctes: ReadonlyArray<CTE>;
        }
    ) {}

    // /*  @internal */
    // public static defineRenamed = <
    //     Selection extends string,
    //     Alias extends string
    // >(
    //     alias: Alias,
    //     columns: ReadonlyArray<Selection>,
    //     select: SelectStatement<any, any, any>
    // ): CommonTableExpressionFactory<`${Alias}.${Selection}`, Alias> =>
    //     new CommonTableExpressionFactory({
    //         ctes: [{ columns, alias, select }],
    //     });
    /*  @internal */
    public static defineRenamed = <
        NSelection extends string,
        NAlias extends string
    >(
        select: AliasedSelectStatement<any, NAlias, any, any>,
        columns: ReadonlyArray<NSelection>
    ): CommonTableExpressionFactory<
        NSelection,
        NAlias,
        { [key in NAlias]: NSelection },
        NSelection
    > => {
        console.error("should prevent no-alias");
        return new CommonTableExpressionFactory({
            ctes: [{ columns, select }],
        });
    };

    /*  @internal */
    public static define = <NSelection extends string, NAlias extends string>(
        select: AliasedSelectStatement<NSelection, NAlias, any, any>
    ): CommonTableExpressionFactory<
        NSelection,
        NAlias,
        { [key in NAlias]: NSelection },
        NSelection
    > => {
        console.error("should prevent no-alias");
        return new CommonTableExpressionFactory({
            ctes: [{ columns: [], select }],
        });
    };

    private copy = (): CommonTableExpressionFactory<
        Selection,
        Alias,
        Scope,
        FlatScope
    > => new CommonTableExpressionFactory({ ...this.__props });

    private setCtes = (ctes: ReadonlyArray<CTE>): this => {
        this.__props = {
            ...this.__props,
            ctes,
        };
        return this;
    };
    /**
     * @since 1.0.0
     */
    public with_ = <NSelection extends string, NAlias extends string>(
        select: (acc: {
            [K in keyof Scope]: Table<
                Scope[K],
                never,
                { [k in K]: Scope[K] },
                Scope[K]
            >;
        }) => AliasedSelectStatement<NSelection, NAlias, any, any>
    ): CommonTableExpressionFactory<
        Selection,
        Alias,
        Scope & { [key in NAlias]: NSelection },
        FlatScope | NSelection
    > => {
        console.error("should prevent no-alias");

        return hole();
    };
    // public with_ = <Selection2 extends string, Alias2 extends string>(
    //     alias: Alias2,
    //     select: (acc: {
    //         [K in Aliases]: Table<never, FilterStarting<Scope, K>, K>;
    //     }) => SelectStatement<any, any, Selection2>
    // ): CommonTableExpressionFactory<
    //     `${Alias2}.${Selection2}` | Scope,
    //     Aliases | Alias2
    // > => {
    //     const oldMap: any = {};
    //     for (const cte of this.__props.ctes) {
    //         oldMap[cte.alias] = Table.define([], cte.alias);
    //     }
    //     return this.copy().setCtes([
    //         ...this.__props.ctes,
    //         { columns: [], alias, select: select(oldMap) },
    //     ]) as any;
    // };

    /**
     * @since 1.0.0
     */
    public withR = <NSelection extends string, NAlias extends string>(
        select: (acc: {
            [K in keyof Scope]: Table<
                Scope[K],
                never,
                { [k in K]: Scope[K] },
                Scope[K]
            >;
        }) => AliasedSelectStatement<any, NAlias, any, any>,
        columns: ReadonlyArray<NSelection>
    ): CommonTableExpressionFactory<
        Selection,
        Alias,
        Scope & { [key in NAlias]: NSelection },
        FlatScope | NSelection
    > => {
        console.error("should prevent no-alias");

        return hole();
    };
    // public withR = <Selection2 extends string, Alias2 extends string>(
    //     alias: Alias2,
    //     columns: ReadonlyArray<Selection2>,
    //     select: (acc: {
    //         [K in Aliases]: Table<never, FilterStarting<Scope, K>, K>;
    //     }) => SelectStatement<any, any, any>
    // ): CommonTableExpressionFactory<
    //     `${Alias2}.${Selection2}` | Scope,
    //     Aliases | Alias2
    // > => {
    //     const oldMap: any = {};
    //     for (const cte of this.__props.ctes) {
    //         oldMap[cte.alias] = Table.define([], cte.alias);
    //     }
    //     return this.copy().setCtes([
    //         ...this.__props.ctes,
    //         { columns, alias, select: select(oldMap) },
    //     ]) as any;
    // };

    /**
     * @since 1.0.0
     */
    public do = <
        NSelection extends string,
        NAlias extends string,
        NScope extends ScopeShape,
        NFlatScope extends string
    >(
        select: (acc: {
            [K in keyof Scope]: Table<
                Scope[K],
                never,
                { [k in K]: Scope[K] },
                Scope[K]
            >;
        }) => SelectStatement<NSelection, NAlias, NScope, NFlatScope>
    ): SelectStatement<NSelection, NAlias, NScope, NFlatScope> => hole();
    // public do = <A extends string, B extends string>(
    //     f: (acc: {
    //         [K in Aliases]: TableOrSubquery<
    //             K,
    //             Scope,
    //             FilterStarting<Scope, K> | `${K}.${FilterStarting<Scope, K>}`
    //         >;
    //     }) => SelectStatement<never, A, B>
    // ): SelectStatement<never, A, B> => {
    //     const oldMap: any = {};
    //     for (const cte of this.__props.ctes) {
    //         oldMap[cte.alias] = Table.define([], cte.alias);
    //     }
    //     return f(oldMap).__setCtes(this.__props.ctes);
    // };
}
