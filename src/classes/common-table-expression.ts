/**
 * @since 2.0.0
 */
import { CTE } from "../types";
import { AliasedSelectStatement, SelectStatement } from "./select-statement";
import { Table } from "./table";

/**
 * @since 2.0.0
 */
export class CommonTableExpressionFactory {
    /* @internal */
    private constructor(
        /* @internal */
        public __props: {
            readonly ctes: ReadonlyArray<CTE>;
        }
    ) {}

    /*  @internal */
    public static defineRenamed = (
        select: AliasedSelectStatement,
        columns: ReadonlyArray<string>
    ): CommonTableExpressionFactory =>
        new CommonTableExpressionFactory({
            ctes: [{ columns, select }],
        });

    /*  @internal */
    public static define = (
        select: AliasedSelectStatement
    ): CommonTableExpressionFactory =>
        new CommonTableExpressionFactory({
            ctes: [{ columns: [], select }],
        });

    private copy = (): CommonTableExpressionFactory =>
        new CommonTableExpressionFactory({ ...this.__props });

    private setCtes = (ctes: ReadonlyArray<CTE>): this => {
        this.__props = {
            ...this.__props,
            ctes,
        };
        return this;
    };
    /**
     * @since 2.0.0
     */
    public with_ = (
        select: (acc: Record<string, Table>) => AliasedSelectStatement
    ): CommonTableExpressionFactory => {
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
     * @since 2.0.0
     */
    public withR = (
        select: (acc: Record<string, Table>) => AliasedSelectStatement,
        columns: ReadonlyArray<string>
    ): CommonTableExpressionFactory => {
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
     * @since 2.0.0
     */
    public do = (
        _: (acc: Record<string, Table>) => SelectStatement
    ): SelectStatement => {
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
