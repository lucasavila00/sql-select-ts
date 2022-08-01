/**
 *
 * Represents a table in the database.
 * It stores type information of the table Alias and Selection.
 * It also stores the table name and the alias.
 *
 * @since 2.0.0
 */
import { StarSymbol } from "../data-wrappers";
import { SafeString } from "../safe-string";
import {
    Joinable,
    NoSelectFieldsCompileError,
    RecordOfSelection,
    ScopeShape,
    ScopeStorage,
    SelectionOfScope,
    TableOrSubquery,
    ValidAliasInSelection,
} from "../types";
import { Joined, JoinedFactory } from "./joined";
import { SelectStatement } from "./select-statement";

/**
 *
 * Represents a table in the database.
 * It stores type information of the table Alias and Selection.
 * It also stores the table name and the alias.
 *
 * This class is not meant to be used directly, but rather through the `table` function.
 *
 * @since 2.0.0
 */
export class Table<
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
            readonly columns: ReadonlyArray<string>;
            readonly alias: string;
            readonly name: string;
            readonly final: boolean;
            readonly scope: ScopeStorage;
        }
    ) {}

    /*  @internal */
    public static define = <Selection extends string, Alias extends string>(
        columns: ReadonlyArray<Selection>,
        alias: Alias,
        name: string = alias
    ): Table<Selection, Alias, { [key in Alias]: Selection }, Selection> =>
        new Table({
            columns,
            alias,
            name,
            final: false,
            scope: { [alias]: void 0 },
        });

    private copy = (): Table<Selection, Alias, Scope, FlatScope> =>
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
        final: (): Table<Selection, Alias, Scope, FlatScope> =>
            this.copy().setFinal(true),
    };

    /**
     * @since 2.0.0
     */
    public select = <
        NewSelection extends string = never,
        SubSelection extends Selection = never
    >(
        _:
            | ReadonlyArray<SubSelection>
            | ((
                  fields: RecordOfSelection<Selection> &
                      SelectionOfScope<Scope> &
                      NoSelectFieldsCompileError
              ) => Record<NewSelection, SafeString>)
    ): SelectStatement<NewSelection | SubSelection, never, Scope, FlatScope> =>
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
    public selectStar = (): SelectStatement<
        Selection,
        never,
        Scope,
        FlatScope
    > =>
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
     * @since 2.0.0
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
     * @since 2.0.0
     */
    public apply = <Ret extends TableOrSubquery<any, any, any, any> = never>(
        fn: (it: this) => Ret
    ): Ret => fn(this);

    /**
     * @since 2.0.0
     */
    public as = <NewAlias extends string = never>(
        as: NewAlias
    ): Table<Selection, NewAlias, Scope, FlatScope> =>
        this.copy().setAlias(as) as any;
}
