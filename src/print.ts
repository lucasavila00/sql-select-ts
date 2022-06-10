import * as A from "fp-ts/lib/Array";
import { absurd, pipe } from "fp-ts/lib/function";
import { isNumber } from "fp-ts/lib/number";
import { Compound } from "./classes/compound";
import { Joined } from "./classes/joined";
import { SelectStatement } from "./classes/select-statement";
import { Table } from "./classes/table";
import { isStarSymbol, isStarOfAliasSymbol } from "./data-wrappers";
import { SafeString } from "./safe-string";
import { TableOrSubquery } from "./types";

const wrapAlias = (alias: string) => {
    // FIXME should escape - / etc
    if (alias[0].charCodeAt(0) >= 48 && alias[0].charCodeAt(0) <= 57) {
        return `\`${alias}\``;
    }
    if (alias.includes(" ")) {
        return `\`${alias}\``;
    }
    return alias;
};

const printOrderBy = (orderBy: SafeString[]): string =>
    orderBy.length > 0
        ? `ORDER BY ${orderBy.map((it) => it.content).join(", ")}`
        : "";

const printLimit = (limit: number | SafeString | null): string =>
    limit == null
        ? ""
        : isNumber(limit)
        ? `LIMIT ${limit}`
        : `LIMIT ${limit.content}`;

export const printCompoundInternal = <
    Scope extends string,
    Selection extends string
>(
    compound: Compound<Scope, Selection>,
    parenthesis: boolean
): string => {
    const sel = compound.__content
        .map((it) => printInternal(it, false))
        .join(` ${compound.__qualifier} `);

    const q = [
        sel,
        printOrderBy(compound.__orderBy),
        printLimit(compound.__limit),
    ]
        .filter((it) => it.length > 0)
        .join(" ");

    if (parenthesis) {
        return `(${q})`;
    }
    return q;
};
const printTableInternal = <Selection extends string, Alias extends string>(
    table: Table<Selection, Alias>
): string => {
    if (table.__name === table.__alias) {
        return table.__name;
    }
    return `${table.__name} AS ${wrapAlias(table.__alias)}`;
};

const printJoinedInternal = <Selection extends string, Aliases extends string>(
    joined: Joined<Selection, Aliases>
): string => {
    const head = joined.__commaJoins
        .map((it) => {
            const code = printInternal(it.code, true);
            if (it.code instanceof Table) {
                return code;
            }
            return `${code} AS ${wrapAlias(it.alias)}`;
        })
        .join(", ");

    const tail = joined.__properJoins
        .map((it) => {
            const onJoined = it.constraint
                .map((it) => it.content)
                .join(" AND ");

            const on = onJoined.length > 0 ? `ON ${onJoined}` : "";

            return [it.operator, "JOIN", printInternal(it.code, false), on]
                .filter((it) => it.length > 0)
                .join(" ");
        })
        .join(" ");

    return [head, tail].filter((it) => it.length > 0).join(" ");
};

export const printSelectStatementInternal = <
    With extends string,
    Scope extends string,
    Selection extends string
>(
    selectStatement: SelectStatement<With, Scope, Selection>,
    parenthesis: boolean
): string => {
    const sel = pipe(
        selectStatement.__selection,
        A.chain((it) => {
            if (isStarSymbol(it)) {
                if (it.distinct) {
                    return ["DISTINCT *"];
                }
                return ["*"];
            }
            if (isStarOfAliasSymbol(it)) {
                const content = it.aliases.map((alias) => `${alias}.*`);
                if (it.distinct) {
                    return [`DISTINCT ${content.join(", ")}`];
                }
                return content;
            }
            // check if the proxy was returned in an identity function
            if ((it.content as any)?.SQL_PROXY_TARGET != null) {
                return ["*"];
            }
            return Object.entries(it.content).map(([k, v]) => {
                return `${(v as SafeString).content} AS ${wrapAlias(k)}`;
            });
        }),
        (it) => it.join(", ")
    );

    const where =
        selectStatement.__where.length > 0
            ? `WHERE ${selectStatement.__where
                  .map((it) => it.content)
                  .join(" AND ")}`
            : "";

    const from =
        selectStatement.__from != null
            ? `FROM ${printInternal(selectStatement.__from, true)}`
            : "";

    const doesSelectMainAlias = sel.includes("main_alias");

    const main_alias = doesSelectMainAlias ? "AS main_alias" : "";

    const content = [
        `SELECT ${sel}`,
        from,
        main_alias,
        where,
        printOrderBy(selectStatement.__orderBy),
        printLimit(selectStatement.__limit),
    ]
        .filter((it) => it.length > 0)
        .join(" ");

    return parenthesis ? `(${content})` : content;
};

const printInternal = (
    it: TableOrSubquery<any, any, any, any>,
    parenthesis: boolean
): string => {
    if (it instanceof SelectStatement) {
        return printSelectStatementInternal(it, parenthesis);
    }
    if (it instanceof Joined) {
        return printJoinedInternal(it);
    }
    if (it instanceof Table) {
        return printTableInternal(it);
    }
    if (it instanceof Compound) {
        return printCompoundInternal(it, parenthesis);
    }
    return absurd(it);
};

export const printSelectStatement = <
    With extends string,
    Scope extends string,
    Selection extends string
>(
    it: SelectStatement<With, Scope, Selection>
): string => printSelectStatementInternal(it, false) + ";";

export const printCompound = <Scope extends string, Selection extends string>(
    it: Compound<Scope, Selection>
): string => printCompoundInternal(it, false) + ";";
