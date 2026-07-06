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
    Fields,
    Joinable,
    JoinConstraint,
    NoSelectFieldsCompileError,
    ScopeStorage,
    SelectionRecord,
    TableOrSubquery,
} from "../types";
import { makeNonEmptyArray } from "../utils";
import { SelectStatement } from "./select-statement";

type CommaJoin = ReadonlyArray<Joinable>;

type ProperJoinItem = {
    readonly code: Joinable;
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
export class JoinedFactory {
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
    ): JoinedFactory =>
        new JoinedFactory({ commaJoins, properJoins, newProperJoin, scope });

    /**
     * @since 2.0.0
     */
    public noConstraint = (): Joined =>
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
            fields: Fields
        ) => SafeString | ReadonlyArray<SafeString>
    ): Joined =>
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
        keys: ReadonlyArray<string>
    ): Joined =>
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
export class Joined {
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
    ): Joined => new Joined({ commaJoins, properJoins, scope });

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
            this.__props.scope as any,
            undefined
        );

    /**
     * @since 2.0.0
     */
    public selectStar = (): SelectStatement =>
        SelectStatement.__fromTableOrSubqueryAndSelectionArray(
            this,
            [StarSymbol()],
            this.__props.scope as any,
            undefined
        );

    /**
     * @since 2.0.0
     */
    public selectStarOfAliases = (
        aliases: ReadonlyArray<string>
    ): SelectStatement =>
        SelectStatement.__fromTableOrSubqueryAndSelectionArray(
            this,
            [StarOfAliasesSymbol(aliases as any)],
            this.__props.scope,
            undefined
        ) as any;
    /**
     * @since 2.0.0
     */
    public join = (operator: string, _: Joinable): JoinedFactory =>
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
    public commaJoin = (_: Joinable): Joined =>
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
    public apply = <Ret extends TableOrSubquery = TableOrSubquery>(
        fn: (it: this) => Ret
    ): Ret => fn(this);
}
