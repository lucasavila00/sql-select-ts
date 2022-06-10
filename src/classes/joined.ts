import {
    AliasedRowsURI,
    SelectStarArgs,
    StarOfAliasesSymbol,
    StarSymbol,
} from "../data-wrappers";
import { proxy } from "../proxy";
import { SafeString } from "../safe-string";
import { TableOrSubquery } from "../types";
import { makeArray } from "../utils";
import { SelectStatement } from "./select-statement";
import { Table } from "./table";

type CommaJoin = {
    code: TableOrSubquery<any, any, any, any>;
    alias: string;
}[];

type ProperJoin = {
    code: TableOrSubquery<any, any, any, any>;
    alias: string;
    operator: string;
    constraint: SafeString[];
}[];

type RemoveAliasFromSelection<
    Alias extends string,
    Selection extends string
> = Selection extends `${Alias}.${infer R}` ? R : never;

export class Joined<Selection extends string, Aliases extends string> {
    private constructor(
        public __commaJoins: CommaJoin,
        public __properJoins: ProperJoin
    ) {}

    public static __fromCommaJoinHead = (
        commaJoins: CommaJoin
    ): Joined<any, any> => new Joined(commaJoins, []);

    public static __fromProperJoin = (
        commaJoins: CommaJoin,
        properJoins: ProperJoin
    ): Joined<any, any> => new Joined(commaJoins, properJoins);

    public select = <NewSelection extends string>(
        f: (
            f: Record<Selection, SafeString>
        ) => Record<NewSelection, SafeString>
    ): SelectStatement<never, Selection, NewSelection> =>
        SelectStatement.__fromTableOrSubquery(this, [
            { _tag: AliasedRowsURI, content: f(proxy) },
        ]);

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
        Joined.__fromCommaJoinHead([
            ...this.__commaJoins,
            {
                code: table,
                alias: table.__alias,
            },
        ]);

    public joinTable = <Selection2 extends string, Alias2 extends string>(
        operator: string,
        table: Table<Selection2, Alias2>,
        on?: (
            f: Record<
                Exclude<Selection, Selection2> | Exclude<Selection2, Selection>,
                SafeString
            >
        ) => SafeString | SafeString[]
    ): Joined<
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias2}.${Selection2}`,
        Aliases | Alias2
    > =>
        Joined.__fromProperJoin(this.__commaJoins, [
            ...this.__properJoins,
            {
                code: table,
                alias: table.__alias,
                operator,
                constraint: on != null ? makeArray(on(proxy)) : [],
            },
        ]);

    public commaJoinQuery = <
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
        Joined.__fromCommaJoinHead([
            ...this.__commaJoins,
            {
                code: table,
                alias: alias,
            },
        ]);
}
