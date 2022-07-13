/**
 *
 * Represents a table in the database.
 * It stores type information of the table Alias and Selection.
 * It also stores the table name and the alias.
 *
 * @since 0.0.0
 */
import { consumeRecordCallback } from "../consume-fields";
import { AliasedRows } from "../data-wrappers";
import { SafeString } from "../safe-string";
import {
    NoSelectFieldsCompileError,
    RecordOfSelection,
    ScopeShape,
    ScopeStorage,
    SelectionOfScope,
    TableOrSubquery,
} from "../types";
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

    private copy = (): Table<never, never, never> =>
        new Table({ ...this.__props });

    private setFinal = (final: boolean): this => {
        this.__props = { ...this.__props, final };
        return this;
    };

    /**
     * @since 0.0.0
     */
    public clickhouse = {
        /**
         * @since 0.0.0
         */
        final: (): Table<never, never, never> => this.copy().setFinal(true),
    };

    /**
     * @since 0.0.0
     */
    public select = <
        NewSelection extends string = never,
        SubSelection extends Selection = never,
        NewAlias extends string = never
    >(
        _:
            | ReadonlyArray<SubSelection>
            | ((
                  fields: RecordOfSelection<Selection> &
                      SelectionOfScope<Scope> &
                      NoSelectFieldsCompileError
              ) => Record<NewSelection, SafeString>),
        as?: NewAlias
    ): SelectStatement<NewSelection | SubSelection, NewAlias, Scope> =>
        SelectStatement.__fromTableOrSubquery(
            this,
            _ as any,
            as ? { [as]: void 0 } : {},
            as
        );

    // /**
    //  * @since 0.0.0
    //  */
    // public selectStar = (): SelectStatement<
    //     Selection | `${Alias}.${Selection}`,
    //     Selection
    // > => SelectStatement.__fromTableOrSubquery(this, [StarSymbol()]);

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

    // /**
    //  * @since 0.0.0
    //  */
    // public joinTable = <
    //     Scope2 extends string,
    //     Selection2 extends string,
    //     Alias2 extends string
    // >(
    //     operator: string,
    //     table: Table<Scope2, Selection2, Alias2>
    // ): JoinedFactory<
    //     Selection,
    //     | Exclude<Selection, Selection2>
    //     | Exclude<Selection2, Selection>
    //     | `${Alias}.${Selection}`
    //     | `${Alias2}.${Selection2}`,
    //     Alias | Alias2,
    //     Extract<Selection2, Selection>
    // > =>
    //     JoinedFactory.__fromAll(
    //         [
    //             {
    //                 code: this,
    //                 alias: this.__props.alias,
    //             },
    //         ],
    //         [],
    //         {
    //             code: table,
    //             alias: table.__props.alias,
    //             operator,
    //         }
    //     );

    // /**
    //  * @since 0.0.3
    //  */
    // public commaJoinStringifiedSelect = <
    //     Selection2 extends string,
    //     Alias2 extends string
    // >(
    //     selectAlias: Alias2,
    //     select: StringifiedSelectStatement<Selection2>
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
    //             code: select,
    //             alias: selectAlias,
    //         },
    //     ]);

    // /**
    //  * @since 0.0.0
    //  */
    // public commaJoinSelect = <
    //     Scope2 extends string,
    //     Selection2 extends string,
    //     Alias2 extends string
    // >(
    //     selectAlias: Alias2,
    //     select: SelectStatement<Scope2, Selection2>
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
    //             code: select,
    //             alias: selectAlias,
    //         },
    //     ]);

    // /**
    //  * @since 0.0.3
    //  */
    // public joinStringifiedSelect = <
    //     Selection2 extends string,
    //     Alias2 extends string
    // >(
    //     selectAlias: Alias2,
    //     operator: string,
    //     select: StringifiedSelectStatement<Selection2>
    // ): JoinedFactory<
    //     Selection,
    //     | Exclude<Selection, Selection2>
    //     | Exclude<Selection2, Selection>
    //     | `${Alias}.${Selection}`
    //     | `${Alias2}.${Selection2}`,
    //     Alias | Alias2,
    //     Extract<Selection2, Selection>
    // > =>
    //     JoinedFactory.__fromAll(
    //         [
    //             {
    //                 code: this,
    //                 alias: this.__props.alias,
    //             },
    //         ],
    //         [],
    //         {
    //             code: select,
    //             alias: selectAlias,
    //             operator,
    //         }
    //     );

    // /**
    //  * @since 0.0.0
    //  */
    // public joinSelect = <
    //     Scope2 extends string,
    //     Selection2 extends string,
    //     Alias2 extends string
    // >(
    //     selectAlias: Alias2,
    //     operator: string,
    //     select: SelectStatement<Scope2, Selection2>
    // ): JoinedFactory<
    //     Selection,
    //     | Exclude<Selection, Selection2>
    //     | Exclude<Selection2, Selection>
    //     | `${Alias}.${Selection}`
    //     | `${Alias2}.${Selection2}`,
    //     Alias | Alias2,
    //     Extract<Selection2, Selection>
    // > =>
    //     JoinedFactory.__fromAll(
    //         [
    //             {
    //                 code: this,
    //                 alias: this.__props.alias,
    //             },
    //         ],
    //         [],
    //         {
    //             code: select,
    //             alias: selectAlias,
    //             operator,
    //         }
    //     );

    // /**
    //  * @since 0.0.0
    //  */
    // public commaJoinCompound = <
    //     Selection2 extends string,
    //     Alias2 extends string
    // >(
    //     compoundAlias: Alias2,
    //     compound: Compound<Selection2, Selection2>
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
    //             code: compound,
    //             alias: compoundAlias,
    //         },
    //     ]);

    // /**
    //  * @since 0.0.0
    //  */
    // public joinCompound = <Selection2 extends string, Alias2 extends string>(
    //     compoundAlias: Alias2,
    //     operator: string,
    //     compound: Compound<Selection2, Selection2>
    // ): JoinedFactory<
    //     Selection,
    //     | Exclude<Selection, Selection2>
    //     | Exclude<Selection2, Selection>
    //     | `${Alias}.${Selection}`
    //     | `${Alias2}.${Selection2}`,
    //     Alias | Alias2,
    //     Extract<Selection2, Selection>
    // > =>
    //     JoinedFactory.__fromAll(
    //         [
    //             {
    //                 code: this,
    //                 alias: this.__props.alias,
    //             },
    //         ],
    //         [],
    //         {
    //             code: compound,
    //             alias: compoundAlias,
    //             operator,
    //         }
    //     );

    /**
     * @since 1.1.1
     */
    public apply = <Ret extends TableOrSubquery<any, any, any> = never>(
        fn: (it: this) => Ret
    ): Ret => fn(this);
}
