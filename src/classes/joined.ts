/**
 *
 * Represents a source of data composed of JOINed tables or sub-selects.
 *
 * @since 0.0.0
 */
import { StarOfAliasesSymbol, StarSymbol, AliasedRows } from "../data-wrappers";
import { proxy } from "../proxy";
import { SafeString } from "../safe-string";
import {
    TableOrSubquery,
    NoSelectFieldsCompileError,
    JoinConstraint,
} from "../types";
import { makeNonEmptyArray } from "../utils";
import { Compound } from "./compound";
import { SelectStatement } from "./select-statement";
import { StringifiedSelectStatement } from "./stringified-select-statement";
import { Table } from "./table";

type CommaJoin = {
    code: TableOrSubquery<any, any, any, any>;
    alias: string;
}[];

type ProperJoinItem = {
    code: TableOrSubquery<any, any, any, any>;
    alias: string;
    operator: string;
    constraint: JoinConstraint;
};

type ProperJoin = ProperJoinItem[];

type RemoveAliasFromSelection<
    Alias extends string,
    Selection extends string
> = Selection extends `${Alias}.${infer R}` ? R : never;

/**
 *
 * Constructor for join queries.
 * Allows the selection of the constraint to be done in another method call.
 *
 * @since 0.0.0
 */
export class JoinedFactory<
    Selection extends string,
    Scope extends string,
    Aliases extends string,
    Ambiguous extends string,
    UsingPossibleKeys extends string
> {
    /* @internal */
    private constructor(
        /* @internal */
        public __props: {
            commaJoins: CommaJoin;
            properJoins: ProperJoin;
            newProperJoin: Omit<ProperJoinItem, "constraint">;
        }
    ) {}

    /* @internal */
    public static __fromAll = (
        commaJoins: CommaJoin,
        properJoins: ProperJoin,
        newProperJoin: Omit<ProperJoinItem, "constraint">
    ): JoinedFactory<any, any, any, any, any> =>
        new JoinedFactory({ commaJoins, properJoins, newProperJoin });

    /**
     * @since 0.0.0
     */
    public noConstraint = (): Joined<Selection, Scope, Aliases, Ambiguous> =>
        Joined.__fromAll(this.__props.commaJoins, [
            ...this.__props.properJoins,
            {
                ...this.__props.newProperJoin,
                constraint: { _tag: "no_constraint" },
            },
        ]);

    /**
     * @since 0.0.0
     */
    public on = (
        on: (fields: Record<Scope, SafeString>) => SafeString | SafeString[]
    ): Joined<Selection, Scope, Aliases, Ambiguous> =>
        Joined.__fromAll(this.__props.commaJoins, [
            ...this.__props.properJoins,
            {
                ...this.__props.newProperJoin,
                constraint: { _tag: "on", on: makeNonEmptyArray(on(proxy)) },
            },
        ]);

    /**
     * @since 0.0.0
     */
    public using = (
        keys: UsingPossibleKeys[]
    ): Joined<Selection, Scope, Aliases, Ambiguous> =>
        Joined.__fromAll(this.__props.commaJoins, [
            ...this.__props.properJoins,
            {
                ...this.__props.newProperJoin,
                constraint: { _tag: "using", keys },
            },
        ]);
}

/**
 *
 * Represents a source of data composed of JOINed tables or sub-selects.
 * This class is not meant to be used directly, but rather through methods in tables, or sub-selects.
 *
 * @since 0.0.0
 */
export class Joined<
    Selection extends string,
    Scope extends string,
    Aliases extends string,
    Ambiguous extends string
> {
    private constructor(
        /* @internal */
        public __props: {
            commaJoins: CommaJoin;
            properJoins: ProperJoin;
        }
    ) {}

    /* @internal */
    public static __fromCommaJoin = (
        commaJoins: CommaJoin
    ): Joined<any, any, any, any> =>
        new Joined({ commaJoins, properJoins: [] });

    /* @internal */
    public static __fromAll = (
        commaJoins: CommaJoin,
        properJoins: ProperJoin
    ): Joined<any, any, any, any> => new Joined({ commaJoins, properJoins });

    /**
     * @since 0.0.0
     */
    public select = <NewSelection extends string>(
        f: (
            f: Record<Selection | Scope, SafeString> &
                NoSelectFieldsCompileError
        ) => Record<NewSelection, SafeString>
    ): SelectStatement<Selection | Scope, NewSelection> =>
        SelectStatement.__fromTableOrSubquery(this, [AliasedRows(f(proxy))]);

    /**
     * @since 0.0.0
     */
    public selectStar = (): SelectStatement<Selection | Scope, Selection> =>
        SelectStatement.__fromTableOrSubquery(this, [StarSymbol()]);

    /**
     * @since 0.0.0
     */
    public selectStarOfAliases = <TheAliases extends Aliases>(
        aliases: TheAliases[]
    ): SelectStatement<
        Selection | Scope,
        RemoveAliasFromSelection<TheAliases, Selection | Scope>
    > =>
        SelectStatement.__fromTableOrSubquery(this, [
            StarOfAliasesSymbol(aliases),
        ]);

    /**
     * @since 0.0.0
     */
    public commaJoinTable = <Selection2 extends string, Alias2 extends string>(
        table: Table<Selection2, Alias2>
    ): Joined<
        Selection,
        | Scope
        | Exclude<Selection, Selection2>
        | Exclude<Exclude<Selection2, Selection>, Ambiguous>
        | Exclude<Selection2, Ambiguous>
        | `${Alias2}.${Selection2}`,
        Aliases | Alias2,
        Ambiguous | Extract<Selection2, Selection>
    > =>
        Joined.__fromAll(
            [
                ...this.__props.commaJoins,
                {
                    code: table,
                    alias: table.__props.alias,
                },
            ],
            this.__props.properJoins
        );

    /**
     * @since 0.0.0
     */
    public joinTable = <Selection2 extends string, Alias2 extends string>(
        operator: string,
        table: Table<Selection2, Alias2>
    ): JoinedFactory<
        Selection,
        | Scope
        | Exclude<Selection, Selection2>
        | Exclude<Exclude<Selection2, Selection>, Ambiguous>
        | `${Alias2}.${Selection2}`,
        Aliases | Alias2,
        Extract<Selection, Selection2>,
        Ambiguous | Extract<Selection2, Selection>
    > =>
        JoinedFactory.__fromAll(
            //
            this.__props.commaJoins,
            this.__props.properJoins,
            {
                code: table,
                alias: table.__props.alias,
                operator,
            }
        );
    /**
     * @since 0.0.3
     */
    public commaJoinStringifiedSelect = <
        Selection2 extends string,
        Alias2 extends string
    >(
        alias: Alias2,
        select: StringifiedSelectStatement<Selection2>
    ): Joined<
        Selection,
        | Scope
        | Exclude<Selection, Selection2>
        | Exclude<Exclude<Selection2, Selection>, Ambiguous>
        | `${Alias2}.${Selection2}`,
        Aliases | Alias2,
        Ambiguous | Extract<Selection2, Selection>
    > =>
        Joined.__fromAll(
            [
                ...this.__props.commaJoins,
                {
                    code: select,
                    alias: alias,
                },
            ],
            this.__props.properJoins
        );

    /**
     * @since 0.0.0
     */
    public commaJoinSelect = <
        Scope2 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        alias: Alias2,
        select: SelectStatement<Scope2, Selection2>
    ): Joined<
        Selection,
        | Scope
        | Exclude<Selection, Selection2>
        | Exclude<Exclude<Selection2, Selection>, Ambiguous>
        | `${Alias2}.${Selection2}`,
        Aliases | Alias2,
        Ambiguous | Extract<Selection2, Selection>
    > =>
        Joined.__fromAll(
            [
                ...this.__props.commaJoins,
                {
                    code: select,
                    alias: alias,
                },
            ],
            this.__props.properJoins
        );

    /**
     * @since 0.0.3
     */
    public joinStringifiedSelect = <
        Selection2 extends string,
        Alias2 extends string
    >(
        operator: string,
        alias: Alias2,
        table: StringifiedSelectStatement<Selection2>
    ): JoinedFactory<
        Selection,
        | Scope
        | Exclude<Selection, Selection2>
        | Exclude<Exclude<Selection2, Selection>, Ambiguous>
        | `${Alias2}.${Selection2}`,
        Aliases | Alias2,
        Ambiguous | Extract<Selection2, Selection>,
        Extract<Selection2, Selection>
    > =>
        JoinedFactory.__fromAll(
            this.__props.commaJoins,
            this.__props.properJoins,
            {
                code: table,
                alias: alias,
                operator,
            }
        );

    /**
     * @since 0.0.0
     */
    public joinSelect = <
        Scope2 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        operator: string,
        alias: Alias2,
        table: SelectStatement<Scope2, Selection2>
    ): JoinedFactory<
        Selection,
        | Scope
        | Exclude<Selection, Selection2>
        | Exclude<Exclude<Selection2, Selection>, Ambiguous>
        | `${Alias2}.${Selection2}`,
        Aliases | Alias2,
        Ambiguous | Extract<Selection2, Selection>,
        Extract<Selection2, Selection>
    > =>
        JoinedFactory.__fromAll(
            this.__props.commaJoins,
            this.__props.properJoins,
            {
                code: table,
                alias: alias,
                operator,
            }
        );

    /**
     * @since 0.0.0
     */
    public commaJoinCompound = <
        Scope2 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        alias: Alias2,
        compound: Compound<Scope2, Selection2>
    ): Joined<
        Selection,
        | Scope
        | Exclude<Selection, Selection2>
        | Exclude<Exclude<Selection2, Selection>, Ambiguous>
        | `${Alias2}.${Selection2}`,
        Aliases | Alias2,
        Ambiguous | Extract<Selection2, Selection>
    > =>
        Joined.__fromAll(
            [
                ...this.__props.commaJoins,
                {
                    code: compound,
                    alias: alias,
                },
            ],
            this.__props.properJoins
        );

    /**
     * @since 0.0.0
     */
    public joinCompound = <
        Scope2 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        operator: string,
        alias: Alias2,
        compound: Compound<Scope2, Selection2>
    ): JoinedFactory<
        Selection,
        | Scope
        | Exclude<Selection, Selection2>
        | Exclude<Exclude<Selection2, Selection>, Ambiguous>
        | `${Alias2}.${Selection2}`,
        Aliases | Alias2,
        Ambiguous | Extract<Selection2, Selection>,
        Extract<Selection2, Selection>
    > =>
        JoinedFactory.__fromAll(
            this.__props.commaJoins,
            this.__props.properJoins,
            {
                code: compound,
                alias: alias,
                operator,
            }
        );
}
