/**
 *
 * Represents a table in the database.
 * It also stores the table name and the alias.
 *
 * @since 2.0.0
 */
import { StarSymbol } from "../data-wrappers";
import {
    Fields,
    Joinable,
    NoSelectFieldsCompileError,
    ScopeStorage,
    SelectionRecord,
    TableOrSubquery,
} from "../types";
import { Joined, JoinedFactory } from "./joined";
import { SelectStatement } from "./select-statement";

/**
 *
 * Represents a table in the database.
 * It also stores the table name and the alias.
 *
 * This class is not meant to be used directly, but rather through the `table` function.
 *
 * @since 2.0.0
 */
export class Table {
    /* @internal */
    private constructor(
        /* @internal */
        public __props: {
            readonly columns: ReadonlyArray<string>;
            readonly alias: string;
            readonly name: string;
            readonly final: boolean;
            readonly scope: ScopeStorage;
        }
    ) {}

    /*  @internal */
    public static define = (
        columns: ReadonlyArray<string>,
        alias: string,
        name: string = alias
    ): Table =>
        new Table({
            columns,
            alias,
            name,
            final: false,
            scope: { [alias]: void 0 },
        });

    private copy = (): Table =>
        new Table({ ...this.__props });

    private setFinal = (final: boolean): this => {
        this.__props = { ...this.__props, final };
        return this;
    };
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

    /**
     * @since 2.0.0
     */
    public clickhouse = {
        /**
         * @since 2.0.0
         */
        final: (): Table =>
            this.copy().setFinal(true),
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
        SelectStatement.__fromTableOrSubquery(
            this,
            _ as any,
            {
                [this.__props.alias]: void 0,
            },
            undefined
        );

    /**
     * @since 2.0.0
     */
    public selectStar = (): SelectStatement =>
        SelectStatement.__fromTableOrSubqueryAndSelectionArray(
            this,
            [StarSymbol()],
            {
                [this.__props.alias]: void 0,
            },
            undefined
        );

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
    public as = (as: string): Table => this.copy().setAlias(as) as any;
}
