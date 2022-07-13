/**
 * @since 1.0.0
 */
import { CTE, TableOrSubquery } from "../types";
import { SelectStatement } from "./select-statement";
import { Table } from "./table";

type FilterStarting<
    All extends string,
    Start extends string
> = All extends `${Start}.${infer U}` ? U : never;

/**
 * @since 1.0.0
 */
export class CommonTableExpressionFactory<
    Alias extends string,
    Scope extends string,
    Selection extends string
> {
    /* @internal */
    private constructor(
        /* @internal */
        public __props: {
            readonly ctes: ReadonlyArray<CTE>;
        }
    ) {}

    /*  @internal */
    public static defineRenamed = <
        Selection extends string,
        Alias extends string
    >(
        alias: Alias,
        columns: ReadonlyArray<Selection>,
        select: SelectStatement<any, any, any>
    ): CommonTableExpressionFactory<`${Alias}.${Selection}`, Alias> =>
        new CommonTableExpressionFactory({
            ctes: [{ columns, alias, select }],
        });

    /*  @internal */
    public static define = <Selection extends string, Alias extends string>(
        alias: Alias,
        select: SelectStatement<any, any, Selection>
    ): CommonTableExpressionFactory<`${Alias}.${Selection}`, Alias> =>
        new CommonTableExpressionFactory({
            ctes: [{ columns: [], alias, select }],
        });

    private copy = (): CommonTableExpressionFactory<Scope, Aliases> =>
        new CommonTableExpressionFactory({ ...this.__props });

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
    public with_ = <Selection2 extends string, Alias2 extends string>(
        alias: Alias2,
        select: (acc: {
            [K in Aliases]: Table<never, FilterStarting<Scope, K>, K>;
        }) => SelectStatement<any, any, Selection2>
    ): CommonTableExpressionFactory<
        `${Alias2}.${Selection2}` | Scope,
        Aliases | Alias2
    > => {
        const oldMap: any = {};
        for (const cte of this.__props.ctes) {
            oldMap[cte.alias] = Table.define([], cte.alias);
        }
        return this.copy().setCtes([
            ...this.__props.ctes,
            { columns: [], alias, select: select(oldMap) },
        ]) as any;
    };

    /**
     * @since 1.0.0
     */
    public withR = <Selection2 extends string, Alias2 extends string>(
        alias: Alias2,
        columns: ReadonlyArray<Selection2>,
        select: (acc: {
            [K in Aliases]: Table<never, FilterStarting<Scope, K>, K>;
        }) => SelectStatement<any, any, any>
    ): CommonTableExpressionFactory<
        `${Alias2}.${Selection2}` | Scope,
        Aliases | Alias2
    > => {
        const oldMap: any = {};
        for (const cte of this.__props.ctes) {
            oldMap[cte.alias] = Table.define([], cte.alias);
        }
        return this.copy().setCtes([
            ...this.__props.ctes,
            { columns, alias, select: select(oldMap) },
        ]) as any;
    };

    /**
     * @since 1.0.0
     */
    public do = <A extends string, B extends string>(
        f: (acc: {
            [K in Aliases]: TableOrSubquery<
                K,
                Scope,
                FilterStarting<Scope, K> | `${K}.${FilterStarting<Scope, K>}`
            >;
        }) => SelectStatement<never, A, B>
    ): SelectStatement<never, A, B> => {
        const oldMap: any = {};
        for (const cte of this.__props.ctes) {
            oldMap[cte.alias] = Table.define([], cte.alias);
        }
        return f(oldMap).__setCtes(this.__props.ctes);
    };
}
