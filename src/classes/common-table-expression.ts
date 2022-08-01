/**
 * @since 1.0.0
 */
import { CTE, ScopeShape } from "../types";
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
    > =>
        new CommonTableExpressionFactory({
            ctes: [{ columns, select }],
        });

    /*  @internal */
    public static define = <NSelection extends string, NAlias extends string>(
        select: AliasedSelectStatement<NSelection, NAlias, any, any>
    ): CommonTableExpressionFactory<
        NSelection,
        NAlias,
        { [key in NAlias]: NSelection },
        NSelection
    > =>
        new CommonTableExpressionFactory({
            ctes: [{ columns: [], select }],
        });

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
        const oldMap: any = {};
        for (const cte of this.__props.ctes) {
            oldMap[
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                cte.select.__props.alias!
            ] = Table.define(
                [],
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                cte.select.__props.alias!
            );
        }
        return this.copy().setCtes([
            ...this.__props.ctes,
            { columns: [], select: select(oldMap) },
        ]) as any;
    };
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
        const oldMap: any = {};
        for (const cte of this.__props.ctes) {
            oldMap[
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                cte.select.__props.alias!
            ] = Table.define(
                [],
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                cte.select.__props.alias!
            );
        }
        return this.copy().setCtes([
            ...this.__props.ctes,
            { columns, select: select(oldMap) },
        ]) as any;
    };

    /**
     * @since 1.0.0
     */
    public do = <
        NSelection extends string,
        NAlias extends string,
        NScope extends ScopeShape,
        NFlatScope extends string
    >(
        _: (acc: {
            [K in keyof Scope]: Table<
                Scope[K],
                never,
                { [k in K]: Scope[K] },
                Scope[K]
            >;
        }) => SelectStatement<NSelection, NAlias, NScope, NFlatScope>
    ): SelectStatement<NSelection, NAlias, NScope, NFlatScope> => {
        const oldMap: any = {};
        for (const cte of this.__props.ctes) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            oldMap[cte.select.__props.alias!] = Table.define(
                [],
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                cte.select.__props.alias!
            );
        }
        return _(oldMap).__setCtes(this.__props.ctes);
    };
}
