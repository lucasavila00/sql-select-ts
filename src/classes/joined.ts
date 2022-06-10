import {
    AliasedRowsURI,
    SelectStarArgs,
    StarSymbol,
    StarOfAliasesSymbol,
} from "../data-wrappers";
import { proxy } from "../proxy";
import { SafeString } from "../safe-string";
import { makeArray, wrapAlias } from "../utils";
import { SelectStatement } from "./select-statement";
import { Table } from "./table";

type CommaJoin = {
    code: string;
    alias: string;
}[];

type ProperJoin = {
    code: string;
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
                code: table.__name,
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
                code: table.__name,
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
                code: table.__printProtected(true),
                alias: alias,
            },
        ]);

    public __printProtected = (): string => {
        const head = this.__commaJoins
            .map((it) => {
                if (it.code === it.alias) {
                    return it.code;
                }
                return `${it.code} AS ${wrapAlias(it.alias)}`;
            })
            .join(", ");

        const tail = this.__properJoins
            .map((it) => {
                const onJoined = it.constraint
                    .map((it) => it.content)
                    .join(" AND ");

                const on = onJoined.length > 0 ? `ON ${onJoined}` : "";

                const alias =
                    it.code === it.alias ? "" : `AS ${wrapAlias(it.alias)}`;
                return [it.operator, "JOIN", it.code, alias, on]
                    .filter((it) => it.length > 0)
                    .join(" ");
            })
            .join(" ");

        return [head, tail].filter((it) => it.length > 0).join(" ");
    };
}
