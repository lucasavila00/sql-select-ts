/**
 *
 * Represents a select statement that was built from a raw string.
 *
 * @since 0.0.3
 */
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
import { Compound } from "./compound";
import { Joined, JoinedFactory } from "./joined";
import { SelectStatement } from "./select-statement";
import { Table } from "./table";
import { AliasedRows, StarSymbol } from "../data-wrappers";
import { consumeRecordCallback } from "../consume-fields";

/**
 *
 * Represents a select statement that was built from a raw string.
 *
 * @since 0.0.3
 */
export class StringifiedSelectStatement<
    Selection extends string = never,
    Alias extends string = never,
    Scope extends ScopeShape = never
> {
    /* @internal */
    private constructor(
        /* @internal */
        public __props: {
            readonly content: SafeString;
            readonly scope: ScopeStorage;
            readonly alias?: string;
        }
    ) {}

    public static fromSafeString = <NewSelection extends string = never>(
        content: SafeString
    ): StringifiedSelectStatement<NewSelection, never, never> =>
        new StringifiedSelectStatement(
            //
            {
                content,
                scope: {},
            }
        );

    private copy = (): StringifiedSelectStatement<Selection, Alias, Scope> =>
        new StringifiedSelectStatement({ ...this.__props });

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
     * @since 0.0.3
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
     * @since 0.0.3
     */
    public select = <
        NewSelection extends string = never,
        SubSelection extends Selection = never
    >(
        _:
            | ReadonlyArray<SubSelection>
            | ((
                  fields: RecordOfSelection<Selection> &
                      SelectionOfScope<{
                          [key in Alias]: Selection;
                      }> &
                      NoSelectFieldsCompileError
              ) => Record<NewSelection, SafeString>)
    ): SelectStatement<
        NewSelection | SubSelection,
        never,
        {
            [key in Alias]: Selection;
        }
    > => SelectStatement.__fromTableOrSubquery(this, _ as any, {}, undefined);
    /**
     * @since 0.0.3
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
    //     /**
    //      * @since 0.0.3
    //      */
    //     public commaJoinTable = <
    //         Alias1 extends string,
    //         Scope2 extends string,
    //         Selection2 extends string,
    //         Alias2 extends string
    //     >(
    //         thisQueryAlias: Alias1,
    //         table: Table<Scope2, Selection2, Alias2>
    //     ): Joined<
    //         Selection,
    //         | Exclude<Selection, Selection2>
    //         | Exclude<Selection2, Selection>
    //         | `${Alias1}.${Selection}`,
    //         Alias1 | Alias2
    //     > =>
    //         Joined.__fromCommaJoin([
    //             {
    //                 code: this,
    //                 alias: thisQueryAlias,
    //             },
    //             {
    //                 code: table,
    //                 alias: table.__props.alias,
    //             },
    //         ]);

    /**
     * @since 1.1.1
     */
    public apply = <Ret extends TableOrSubquery<any, any, any> = never>(
        fn: (it: this) => Ret
    ): Ret => fn(this);

    public as = <NewAlias extends string = never>(
        as: NewAlias
    ): StringifiedSelectStatement<Selection, NewAlias, Scope> =>
        this.copy().setAlias(as) as any;

    /**
     * @since 0.0.3
     */
    public stringify = (): string => this.__props.content.content;
}
