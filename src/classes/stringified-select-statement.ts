/**
 *
 * Represents a select statement that was built from a raw string.
 *
 * @since 0.0.3
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
 * Represents a select statement that was built from a raw string.
 *
 * @since 0.0.3
 */
export class StringifiedSelectStatement<
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
    protected constructor(
        /* @internal */
        public __props: {
            readonly content: SafeString;
            readonly scope: ScopeStorage;
            readonly alias?: string;
        }
    ) {}

    public static fromSafeString = <NewSelection extends string = never>(
        content: SafeString
    ): StringifiedSelectStatement<NewSelection, never, never, never> =>
        new StringifiedSelectStatement(
            //
            {
                content,
                scope: {},
            }
        );

    /**
     * @since 0.0.3
     */
    public selectStar = (): SelectStatement<
        Selection,
        never,
        { [key in Alias]: Selection },
        Selection
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
        },
        Selection
    > => SelectStatement.__fromTableOrSubquery(this, _ as any, {}, undefined);

    /**
     * @since 1.1.1
     */
    public apply = <Ret extends TableOrSubquery<any, any, any, any> = never>(
        fn: (it: this) => Ret
    ): Ret => fn(this);

    public as = <NewAlias extends string = never>(
        as: NewAlias
    ): AliasedStringifiedSelectStatement<
        Selection,
        NewAlias,
        Scope,
        FlatScope
    > =>
        new AliasedStringifiedSelectStatement(this.__props).__setAlias(
            as
        ) as any;

    /**
     * @since 0.0.3
     */
    public stringify = (): string => this.__props.content.content;
}

export class AliasedStringifiedSelectStatement<
    // Selection extends string = never,
    // Alias extends string = never,
    // Scope extends ScopeShape = never,
    // FlatScope extends string = never
    Selection extends string,
    Alias extends string,
    Scope extends ScopeShape,
    FlatScope extends string
> extends StringifiedSelectStatement<Selection, Alias, Scope, FlatScope> {
    private __copy = (): AliasedStringifiedSelectStatement<
        Selection,
        Alias,
        Scope,
        FlatScope
    > => new AliasedStringifiedSelectStatement({ ...this.__props });

    public __setAlias = (alias: string): this => {
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
     * @since 1.1.1
     */
    public apply = <Ret extends TableOrSubquery<any, any, any, any> = never>(
        fn: (it: this) => Ret
    ): Ret => fn(this);

    public as = <NewAlias extends string = never>(
        as: NewAlias
    ): AliasedStringifiedSelectStatement<
        Selection,
        NewAlias,
        Scope,
        FlatScope
    > => this.__copy().__setAlias(as) as any;
}
