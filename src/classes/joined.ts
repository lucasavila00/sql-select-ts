/**
 *
 * Represents a source of data composed of JOINed tables or sub-selects.
 *
 * @since 0.0.0
 */
import { consumeArrayCallback, consumeRecordCallback } from "../consume-fields";
import { StarOfAliasesSymbol, StarSymbol, AliasedRows } from "../data-wrappers";
import { SafeString } from "../safe-string";
import {
    TableOrSubquery,
    NoSelectFieldsCompileError,
    JoinConstraint,
    ScopeShape,
    SelectionOfScope,
    ScopeStorage,
    RecordOfSelection,
    Joinable,
} from "../types";
import { hole, makeNonEmptyArray } from "../utils";
import { Compound } from "./compound";
import { SelectStatement } from "./select-statement";
import { StringifiedSelectStatement } from "./stringified-select-statement";
import { Table } from "./table";

type CommaJoin = ReadonlyArray<Joinable<any, any, any>>;

type ProperJoinItem = {
    readonly code: Joinable<any, any, any>;
    readonly operator: string;
    readonly constraint: JoinConstraint;
};

type ProperJoin = ReadonlyArray<ProperJoinItem>;

/**
 *
 * Constructor for join queries.
 * Allows the selection of the constraint to be done in another method call.
 *
 * @since 0.0.0
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
     * @since 0.0.0
     */
    public noConstraint = (): Joined<never, never, Scope> =>
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
     * @since 0.0.0
     */
    public on = (
        on: (
            fields: RecordOfSelection<Scope[keyof Scope]> &
                SelectionOfScope<Scope>
        ) => SafeString | ReadonlyArray<SafeString>
    ): Joined<never, never, Scope> =>
        Joined.__fromAll(
            this.__props.commaJoins,
            [
                ...this.__props.properJoins,
                {
                    ...this.__props.newProperJoin,
                    constraint: {
                        _tag: "on",
                        on: makeNonEmptyArray(
                            consumeArrayCallback(on as any, this.__props.scope)
                        ),
                    },
                },
            ],
            this.__props.scope
        );

    /**
     * @since 0.0.0
     */
    public using = (keys: ReadonlyArray<Using>): Joined<never, never, Scope> =>
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
 * @since 0.0.0
 */
export class Joined<
    Selection extends string = never,
    Alias extends string = never,
    Scope extends ScopeShape = never
> {
    private constructor(
        /* @internal */
        public __props: {
            readonly commaJoins: CommaJoin;
            readonly properJoins: ProperJoin;
            readonly scope: ScopeStorage;
        }
    ) {}
    //     /* @internal */
    //     public static __fromCommaJoin = (
    //         commaJoins: CommaJoin
    //     ): Joined<any, any, any> => new Joined({ commaJoins, properJoins: [] });
    /* @internal */
    public static __fromAll = (
        commaJoins: CommaJoin,
        properJoins: ProperJoin,
        scope: ScopeStorage
    ): Joined<any, any, any> => new Joined({ commaJoins, properJoins, scope });

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
                  fields: RecordOfSelection<Scope[keyof Scope]> &
                      SelectionOfScope<Scope> &
                      NoSelectFieldsCompileError
              ) => Record<NewSelection, SafeString>),
        as?: NewAlias
    ): SelectStatement<NewSelection | SubSelection, NewAlias, Scope> =>
        SelectStatement.__fromTableOrSubquery(
            this,
            _ as any,
            this.__props.scope as any,
            as
        );
    //     /**
    //      * @since 0.0.0
    //      */
    //     public select = <
    //         NewSelection extends string = never,
    //         SubSelection extends Selection | Scope = never
    //     >(
    //         f:
    //             | ReadonlyArray<SubSelection>
    //             | ((
    //                   f: Record<Selection | Scope, SafeString> &
    //                       NoSelectFieldsCompileError
    //               ) => Record<NewSelection, SafeString>)
    //     ): SelectStatement<Selection | Scope, NewSelection | SubSelection> =>
    //         SelectStatement.__fromTableOrSubquery(this, [
    //             AliasedRows(consumeRecordCallback(f)),
    //         ]);
    //     /**
    //      * @since 0.0.0
    //      */
    //     public selectStar = (): SelectStatement<Selection | Scope, Selection> =>
    //         SelectStatement.__fromTableOrSubquery(this, [StarSymbol()]);
    //     /**
    //      * @since 0.0.0
    //      */
    //     public selectStarOfAliases = <TheAliases extends Aliases>(
    //         aliases: ReadonlyArray<TheAliases>
    //     ): SelectStatement<
    //         Selection | Scope,
    //         RemoveAliasFromSelection<TheAliases, Selection | Scope>
    //     > =>
    //         SelectStatement.__fromTableOrSubquery(this, [
    //             StarOfAliasesSymbol(aliases),
    //         ]);
    //     /**
    //      * @since 0.0.0
    //      */
    //     public commaJoinTable = <
    //         Scope2 extends string,
    //         Selection2 extends string,
    //         Alias2 extends string
    //     >(
    //         table: Table<Scope2, Selection2, Alias2>
    //     ): Joined<
    //         Selection,
    //         | Scope
    //         | Exclude<Selection, Selection2>
    //         | Exclude<Selection2, Selection>
    //         | `${Alias2}.${Selection2}`,
    //         Aliases | Alias2
    //     > =>
    //         Joined.__fromAll(
    //             [
    //                 ...this.__props.commaJoins,
    //                 {
    //                     code: table,
    //                     alias: table.__props.alias,
    //                 },
    //             ],
    //             this.__props.properJoins
    //         );
    //     /**
    //      * @since 0.0.0
    //      */
    //     public joinTable = <
    //         Scope2 extends string,
    //         Selection2 extends string,
    //         Alias2 extends string
    //     >(
    //         operator: string,
    //         table: Table<Scope2, Selection2, Alias2>
    //     ): JoinedFactory<
    //         Selection,
    //         | Scope
    //         | Exclude<Selection, Selection2>
    //         | Exclude<Selection2, Selection>
    //         | `${Alias2}.${Selection2}`,
    //         Aliases | Alias2,
    //         Extract<Selection, Selection2>
    //     > =>
    //         JoinedFactory.__fromAll(
    //             //
    //             this.__props.commaJoins,
    //             this.__props.properJoins,
    //             {
    //                 code: table,
    //                 alias: table.__props.alias,
    //                 operator,
    //             }
    //         );
    //     /**
    //      * @since 0.0.3
    //      */
    //     public commaJoinStringifiedSelect = <
    //         Selection2 extends string,
    //         Alias2 extends string
    //     >(
    //         alias: Alias2,
    //         select: StringifiedSelectStatement<Selection2>
    //     ): Joined<
    //         Selection,
    //         | Scope
    //         | Exclude<Selection, Selection2>
    //         | Exclude<Selection2, Selection>
    //         | `${Alias2}.${Selection2}`,
    //         Aliases | Alias2
    //     > =>
    //         Joined.__fromAll(
    //             [
    //                 ...this.__props.commaJoins,
    //                 {
    //                     code: select,
    //                     alias: alias,
    //                 },
    //             ],
    //             this.__props.properJoins
    //         );
    //     /**
    //      * @since 0.0.0
    //      */
    //     public commaJoinSelect = <
    //         Scope2 extends string,
    //         Selection2 extends string,
    //         Alias2 extends string
    //     >(
    //         alias: Alias2,
    //         select: SelectStatement<Scope2, Selection2>
    //     ): Joined<
    //         Selection,
    //         | Scope
    //         | Exclude<Selection, Selection2>
    //         | Exclude<Selection2, Selection>
    //         | `${Alias2}.${Selection2}`,
    //         Aliases | Alias2
    //     > =>
    //         Joined.__fromAll(
    //             [
    //                 ...this.__props.commaJoins,
    //                 {
    //                     code: select,
    //                     alias: alias,
    //                 },
    //             ],
    //             this.__props.properJoins
    //         );
    //     /**
    //      * @since 0.0.3
    //      */
    //     public joinStringifiedSelect = <
    //         Selection2 extends string,
    //         Alias2 extends string
    //     >(
    //         operator: string,
    //         alias: Alias2,
    //         table: StringifiedSelectStatement<Selection2>
    //     ): JoinedFactory<
    //         Selection,
    //         | Scope
    //         | Exclude<Selection, Selection2>
    //         | Exclude<Selection2, Selection>
    //         | `${Alias2}.${Selection2}`,
    //         Aliases | Alias2,
    //         Extract<Selection2, Selection>
    //     > =>
    //         JoinedFactory.__fromAll(
    //             this.__props.commaJoins,
    //             this.__props.properJoins,
    //             {
    //                 code: table,
    //                 alias: alias,
    //                 operator,
    //             }
    //         );
    //     /**
    //      * @since 0.0.0
    //      */
    //     public joinSelect = <
    //         Scope2 extends string,
    //         Selection2 extends string,
    //         Alias2 extends string
    //     >(
    //         operator: string,
    //         alias: Alias2,
    //         table: SelectStatement<Scope2, Selection2>
    //     ): JoinedFactory<
    //         Selection,
    //         | Scope
    //         | Exclude<Selection, Selection2>
    //         | Exclude<Selection2, Selection>
    //         | `${Alias2}.${Selection2}`,
    //         Aliases | Alias2,
    //         Extract<Selection2, Selection>
    //     > =>
    //         JoinedFactory.__fromAll(
    //             this.__props.commaJoins,
    //             this.__props.properJoins,
    //             {
    //                 code: table,
    //                 alias: alias,
    //                 operator,
    //             }
    //         );
    //     /**
    //      * @since 0.0.0
    //      */
    //     public commaJoinCompound = <
    //         Scope2 extends string,
    //         Selection2 extends string,
    //         Alias2 extends string
    //     >(
    //         alias: Alias2,
    //         compound: Compound<Scope2, Selection2>
    //     ): Joined<
    //         Selection,
    //         | Scope
    //         | Exclude<Selection, Selection2>
    //         | Exclude<Selection2, Selection>
    //         | `${Alias2}.${Selection2}`,
    //         Aliases | Alias2
    //     > =>
    //         Joined.__fromAll(
    //             [
    //                 ...this.__props.commaJoins,
    //                 {
    //                     code: compound,
    //                     alias: alias,
    //                 },
    //             ],
    //             this.__props.properJoins
    //         );
    //     /**
    //      * @since 0.0.0
    //      */
    //     public joinCompound = <
    //         Scope2 extends string,
    //         Selection2 extends string,
    //         Alias2 extends string
    //     >(
    //         operator: string,
    //         alias: Alias2,
    //         compound: Compound<Scope2, Selection2>
    //     ): JoinedFactory<
    //         Selection,
    //         | Scope
    //         | Exclude<Selection, Selection2>
    //         | Exclude<Selection2, Selection>
    //         | `${Alias2}.${Selection2}`,
    //         Aliases | Alias2,
    //         Extract<Selection2, Selection>
    //     > =>
    //         JoinedFactory.__fromAll(
    //             this.__props.commaJoins,
    //             this.__props.properJoins,
    //             {
    //                 code: compound,
    //                 alias: alias,
    //                 operator,
    //             }
    //         );
    //     /**
    //      * @since 1.1.1
    //      */
    //     public apply = <Ret extends TableOrSubquery<any, any, any> = never>(
    //         fn: (it: this) => Ret
    //     ): Ret => fn(this);
}
