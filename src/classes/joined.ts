/**
 *
 * Represents a source of data composed of JOINed tables or sub-selects.
 *
 * @since 2.0.0
 */
import { consumeArrayCallback } from "../consume-fields";
import { StarOfAliasesSymbol, StarSymbol } from "../data-wrappers";
import { SafeString } from "../safe-string";
import {
    Joinable,
    JoinConstraint,
    NoSelectFieldsCompileError,
    RecordOfSelection,
    ScopeShape,
    ScopeStorage,
    SelectionOfScope,
    TableOrSubquery,
    ValidAliasInSelection,
} from "../types";
import { makeNonEmptyArray } from "../utils";
import { SelectStatement } from "./select-statement";

type CommaJoin = ReadonlyArray<Joinable<any, any, any, any>>;

type ProperJoinItem = {
    readonly code: Joinable<any, any, any, any>;
    readonly operator: string;
    readonly constraint: JoinConstraint;
};

type ProperJoin = ReadonlyArray<ProperJoinItem>;

/**
 *
 * Constructor for join queries.
 * Allows the selection of the constraint to be done in another method call.
 *
 * @since 2.0.0
 */
export class JoinedFactory<
    Scope extends ScopeShape = never,
    Using extends string = never
> {
    /* @internal */
    private constructor(
        /* @internal */
        public __props: {
            readonly commaJoins: CommaJoin;
            readonly properJoins: ProperJoin;
            readonly newProperJoin: Omit<ProperJoinItem, "constraint">;
            readonly scope: ScopeStorage;
        }
    ) {}

    /* @internal */
    public static __fromAll = (
        commaJoins: CommaJoin,
        properJoins: ProperJoin,
        newProperJoin: Omit<ProperJoinItem, "constraint">,
        scope: ScopeStorage
    ): JoinedFactory<any, any> =>
        new JoinedFactory({ commaJoins, properJoins, newProperJoin, scope });

    /**
     * @since 2.0.0
     */
    public noConstraint = (): Joined<never, never, Scope, Scope[keyof Scope]> =>
        Joined.__fromAll(
            this.__props.commaJoins,
            [
                ...this.__props.properJoins,
                {
                    ...this.__props.newProperJoin,
                    constraint: { _tag: "no_constraint" },
                },
            ],
            this.__props.scope
        );

    /**
     * @since 2.0.0
     */
    public on = (
        _: (
            fields: RecordOfSelection<Scope[keyof Scope]> &
                SelectionOfScope<Scope>
        ) => SafeString | ReadonlyArray<SafeString>
    ): Joined<never, never, Scope, Scope[keyof Scope]> =>
        Joined.__fromAll(
            this.__props.commaJoins,
            [
                ...this.__props.properJoins,
                {
                    ...this.__props.newProperJoin,
                    constraint: {
                        _tag: "on",
                        on: makeNonEmptyArray(
                            consumeArrayCallback(_ as any, this.__props.scope)
                        ),
                    },
                },
            ],
            this.__props.scope
        );

    /**
     * @since 2.0.0
     */
    public using = (
        keys: ReadonlyArray<Using>
    ): Joined<never, never, Scope, Scope[keyof Scope]> =>
        Joined.__fromAll(
            this.__props.commaJoins,
            [
                ...this.__props.properJoins,
                {
                    ...this.__props.newProperJoin,
                    constraint: { _tag: "using", keys },
                },
            ],
            this.__props.scope
        );
}

/**
 *
 * Represents a source of data composed of JOINed tables or sub-selects.
 * This class is not meant to be used directly, but rather through methods in tables, or sub-selects.
 *
 * @since 2.0.0
 */
export class Joined<
    Selection extends string = never,
    _Alias extends string = never,
    Scope extends ScopeShape = never,
    FlatScope extends string = never
> {
    private constructor(
        /* @internal */
        public __props: {
            readonly commaJoins: CommaJoin;
            readonly properJoins: ProperJoin;
            readonly scope: ScopeStorage;
        }
    ) {}

    /* @internal */
    public static __fromAll = (
        commaJoins: CommaJoin,
        properJoins: ProperJoin,
        scope: ScopeStorage
    ): Joined<any, any, any> => new Joined({ commaJoins, properJoins, scope });

    /**
     * @since 2.0.0
     */
    public select = <
        NewSelection extends string = never,
        SubSelection extends Selection | FlatScope = never
    >(
        _:
            | ReadonlyArray<SubSelection>
            | ((
                  fields: RecordOfSelection<Scope[keyof Scope]> &
                      SelectionOfScope<Scope> &
                      NoSelectFieldsCompileError
              ) => Record<NewSelection, SafeString>)
    ): SelectStatement<NewSelection | SubSelection, never, Scope, FlatScope> =>
        SelectStatement.__fromTableOrSubquery(
            this,
            _ as any,
            this.__props.scope as any,
            undefined
        );

    /**
     * @since 2.0.0
     */
    public selectStar = (): SelectStatement<
        Scope[keyof Scope],
        never,
        Scope,
        FlatScope
    > =>
        SelectStatement.__fromTableOrSubqueryAndSelectionArray(
            this,
            [StarSymbol()],
            this.__props.scope as any,
            undefined
        );

    /**
     * @since 2.0.0
     */
    public selectStarOfAliases = <TheAliases extends keyof Scope>(
        aliases: ReadonlyArray<TheAliases>
    ): SelectStatement<Scope[TheAliases], never, Scope, FlatScope> =>
        SelectStatement.__fromTableOrSubqueryAndSelectionArray(
            this,
            [StarOfAliasesSymbol(aliases as any)],
            {},
            undefined
        ) as any;
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
        Scope & {
            [key in Alias2]: Selection2;
        },
        Extract<Selection | Scope[keyof Scope], Selection2>
    > =>
        JoinedFactory.__fromAll(
            this.__props.commaJoins,
            this.__props.properJoins,
            {
                code: _ as any,
                operator,
            },
            {
                ...(_ as any).__props.scope,
                ...this.__props.scope,
            }
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
        Scope & {
            [key in Alias2]: Selection2;
        }
    > =>
        Joined.__fromAll(
            [...this.__props.commaJoins, _ as any],
            this.__props.properJoins,
            {
                ...(_ as any).__props.scope,
                ...this.__props.scope,
            }
        );

    /**
     * @since 2.0.0
     */
    public apply = <Ret extends TableOrSubquery<any, any, any, any> = never>(
        fn: (it: this) => Ret
    ): Ret => fn(this);
}
