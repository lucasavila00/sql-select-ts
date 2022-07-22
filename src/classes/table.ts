/**
 *
 * Represents a table in the database.
 * It stores type information of the table Alias and Selection.
 * It also stores the table name and the alias.
 *
 * @since 0.0.0
 */
import { consumeRecordCallback } from "../consume-fields";
import { AliasedRows, StarSymbol } from "../data-wrappers";
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
import { JoinedFactory } from "./joined";
import { SelectStatement } from "./select-statement";

/**
 *
 * Represents a table in the database.
 * It stores type information of the table Alias and Selection.
 * It also stores the table name and the alias.
 *
 * This class is not meant to be used directly, but rather through the `table` function.
 *
 * @since 0.0.0
 */
export class Table<
    Selection extends string = never,
    Alias extends string = never,
    Scope extends ScopeShape = never
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
    ): Table<Selection, Alias, { [key in Alias]: Selection }> =>
        new Table({
            columns,
            alias,
            name,
            final: false,
            scope: alias ? { [alias]: void 0 } : {},
        });

    private copy = (): Table<Selection, Alias, Scope> =>
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
     * @since 0.0.0
     */
    public clickhouse = {
        /**
         * @since 0.0.0
         */
        final: (): Table<Selection, Alias, Scope> => this.copy().setFinal(true),
    };

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
                  fields: RecordOfSelection<Selection> &
                      SelectionOfScope<Scope> &
                      NoSelectFieldsCompileError
              ) => Record<NewSelection, SafeString>)
    ): SelectStatement<NewSelection | SubSelection, never, Scope> =>
        SelectStatement.__fromTableOrSubquery(this, _ as any, {}, undefined);

    /**
     * @since 0.0.0
     */
    public selectStar = (): SelectStatement<Selection, never, Scope> =>
        SelectStatement.__fromTableOrSubqueryAndSelectionArray(
            this,
            [StarSymbol()],
            {},
            undefined
        );

    // /**
    //  * @since 0.0.0
    //  */
    // public commaJoinTable = <
    //     Scope2 extends string,
    //     Selection2 extends string,
    //     Alias2 extends string
    // >(
    //     table: Table<Scope2, Selection2, Alias2>
    // ): Joined<
    //     Selection,
    //     | Exclude<Selection, Selection2>
    //     | Exclude<Selection2, Selection>
    //     | `${Alias}.${Selection}`
    //     | `${Alias2}.${Selection2}`,
    //     Alias | Alias2
    // > =>
    //     Joined.__fromCommaJoin([
    //         {
    //             code: this,
    //             alias: this.__props.alias,
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

    public as = <NewAlias extends string = never>(
        as: NewAlias
    ): Table<Selection, NewAlias, Scope> => this.copy().setAlias(as) as any;
}
