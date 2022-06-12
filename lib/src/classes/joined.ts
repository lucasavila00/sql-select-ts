/**
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
import { makeArray } from "../utils";
import { SelectStatement } from "./select-statement";
import { Table } from "./table";

type CommaJoin = {
    code: TableOrSubquery<any, any, any, any>;
    alias: string;
}[];

/**
 * @since 0.0.0
 */

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
 * @since 0.0.0
 */
export class JoinedFactory<
    Selection extends string,
    Aliases extends string,
    UsingPossibleKeys extends string
> {
    /* @internal */
    private constructor(
        /* @internal */
        public __commaJoins: CommaJoin,
        /* @internal */
        public __properJoins: ProperJoin,
        /* @internal */
        public __newProperJoin: Omit<ProperJoinItem, "constraint">
    ) {}

    /* @internal */
    public static __fromAll = (
        commaJoins: CommaJoin,
        properJoins: ProperJoin,
        newProperJoin: Omit<ProperJoinItem, "constraint">
    ): JoinedFactory<any, any, any> =>
        new JoinedFactory(commaJoins, properJoins, newProperJoin);

    /**
     * @since 0.0.0
     */
    public noConstraint = (): Joined<Selection, Aliases> =>
        Joined.__fromAll(this.__commaJoins, [
            ...this.__properJoins,
            { ...this.__newProperJoin, constraint: { _tag: "no_constraint" } },
        ]);

    /**
     * @since 0.0.0
     */
    public on = (
        on: (fields: Record<Selection, SafeString>) => SafeString | SafeString[]
    ): Joined<Selection, Aliases> =>
        Joined.__fromAll(this.__commaJoins, [
            ...this.__properJoins,
            {
                ...this.__newProperJoin,
                constraint: { _tag: "on", on: makeArray(on(proxy)) },
            },
        ]);

    /**
     * @since 0.0.0
     */
    public using = (keys: UsingPossibleKeys[]): Joined<Selection, Aliases> =>
        Joined.__fromAll(this.__commaJoins, [
            ...this.__properJoins,
            {
                ...this.__newProperJoin,
                constraint: { _tag: "using", keys },
            },
        ]);
}

/**
 * @since 0.0.0
 */
export class Joined<Selection extends string, Aliases extends string> {
    private constructor(
        /* @internal */
        public __commaJoins: CommaJoin,
        /* @internal */
        public __properJoins: ProperJoin
    ) {}

    /* @internal */
    public static __fromCommaJoin = (commaJoins: CommaJoin): Joined<any, any> =>
        new Joined(commaJoins, []);

    /* @internal */
    public static __fromAll = (
        commaJoins: CommaJoin,
        properJoins: ProperJoin
    ): Joined<any, any> => new Joined(commaJoins, properJoins);

    /**
     * @since 0.0.0
     */
    public select = <NewSelection extends string>(
        f: (
            f: Record<Selection, SafeString> & NoSelectFieldsCompileError
        ) => Record<NewSelection, SafeString>
    ): SelectStatement<never, Selection, NewSelection> =>
        SelectStatement.__fromTableOrSubquery(this, [AliasedRows(f(proxy))]);

    /**
     * @since 0.0.0
     */
    public selectStar = (): SelectStatement<never, Selection, Selection> =>
        SelectStatement.__fromTableOrSubquery(this, [StarSymbol()]);

    /**
     * @since 0.0.0
     */
    public selectStarOfAliases = <TheAliases extends Aliases>(
        aliases: TheAliases[]
    ): SelectStatement<
        never,
        RemoveAliasFromSelection<TheAliases, Selection>,
        RemoveAliasFromSelection<TheAliases, Selection>
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
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias2}.${Selection2}`,
        Aliases | Alias2
    > =>
        Joined.__fromCommaJoin([
            ...this.__commaJoins,
            {
                code: table,
                alias: table.__alias,
            },
        ]);

    /**
     * @since 0.0.0
     */
    public joinTable = <Selection2 extends string, Alias2 extends string>(
        operator: string,
        table: Table<Selection2, Alias2>
    ): JoinedFactory<
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias2}.${Selection2}`,
        Aliases | Alias2,
        Extract<Selection, Selection2>
    > =>
        JoinedFactory.__fromAll(
            //
            this.__commaJoins,
            this.__properJoins,
            {
                code: table,
                alias: table.__alias,
                operator,
            }
        );

    /**
     * @since 0.0.0
     */
    public commaJoinSelect = <
        With2 extends string,
        Scope2 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        alias: Alias2,
        table: SelectStatement<With2, Scope2, Selection2>
    ): Joined<
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias2}.${Selection2}`,
        Aliases | Alias2
    > =>
        Joined.__fromCommaJoin([
            ...this.__commaJoins,
            {
                code: table,
                alias: alias,
            },
        ]);

    /**
     * @since 0.0.0
     */
    public joinSelect = <
        With2 extends string,
        Scope2 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        operator: string,
        alias: Alias2,
        table: SelectStatement<With2, Scope2, Selection2>
    ): JoinedFactory<
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias2}.${Selection2}`,
        Aliases | Alias2,
        Extract<Selection2, Selection>
    > =>
        JoinedFactory.__fromAll(this.__commaJoins, this.__properJoins, {
            code: table,
            alias: alias,
            operator,
        });
}
