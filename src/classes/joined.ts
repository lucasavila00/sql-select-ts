import { hole } from "fp-ts/lib/function";
import {
    SelectStarArgs,
    StarOfAliasesSymbol,
    StarSymbol,
    AliasedRows,
} from "../data-wrappers";
import { proxy } from "../proxy";
import { SafeString } from "../safe-string";
import { TableOrSubquery, NoSelectFieldsCompileError } from "../types";
import { makeArray } from "../utils";
import { SelectStatement } from "./select-statement";
import { Table } from "./table";

type CommaJoin = {
    code: TableOrSubquery<any, any, any, any>;
    alias: string;
}[];

export type JoinConstraint =
    | {
          _tag: "no_constraint";
      }
    | { _tag: "on"; on: SafeString[] }
    | { _tag: "using"; keys: string[] };

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

export class JoinedFactory<
    Selection extends string,
    Aliases extends string,
    UsingPossibleKeys extends string
> {
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

    public noConstraint = (): Joined<Selection, Aliases> =>
        Joined.__fromAll(this.__commaJoins, [
            ...this.__properJoins,
            { ...this.__newProperJoin, constraint: { _tag: "no_constraint" } },
        ]);

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

    public using = (keys: UsingPossibleKeys[]): Joined<Selection, Aliases> =>
        Joined.__fromAll(this.__commaJoins, [
            ...this.__properJoins,
            {
                ...this.__newProperJoin,
                constraint: { _tag: "using", keys },
            },
        ]);
}

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

    public select = <NewSelection extends string>(
        f: (
            f: Record<Selection, SafeString> & NoSelectFieldsCompileError
        ) => Record<NewSelection, SafeString>
    ): SelectStatement<never, Selection, NewSelection> =>
        SelectStatement.__fromTableOrSubquery(this, [AliasedRows(f(proxy))]);

    public selectStar = (
        args?: SelectStarArgs
    ): SelectStatement<never, Selection, Selection> =>
        SelectStatement.__fromTableOrSubquery(this, [StarSymbol(args)]);

    public selectStarOfAliases = <TheAliases extends Aliases>(
        aliases: TheAliases[],
        args?: SelectStarArgs
    ): SelectStatement<
        never,
        RemoveAliasFromSelection<TheAliases, Selection>,
        RemoveAliasFromSelection<TheAliases, Selection>
    > =>
        SelectStatement.__fromTableOrSubquery(this, [
            StarOfAliasesSymbol(aliases, args),
        ]);

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
