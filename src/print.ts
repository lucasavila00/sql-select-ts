import { Compound } from "./classes/compound";
import { CommonTableExpression } from "./classes/cte";
import { Joined } from "./classes/joined";
import { SelectStatement } from "./classes/select-statement";
import { StringifiedSelectStatement } from "./classes/stringified-select-statement";
import { Table } from "./classes/table";
import { isStarSymbol, isStarOfAliasSymbol } from "./data-wrappers";
import { isTheProxyObject } from "./proxy";
import type { SafeString } from "./safe-string";
import { ClickhouseWith, JoinConstraint, TableOrSubquery } from "./types";
import { absurd } from "./utils";
import { wrapAlias, wrapAliasSplitDots } from "./wrap-alias";

// re-define to avoid circular dependency
/* istanbul ignore next */
const isSafeString = (it: any): it is SafeString => it?._tag === "SafeString";

const printOrderBy = (orderBy: SafeString[]): string =>
    orderBy.length > 0
        ? `ORDER BY ${orderBy.map((it) => it.content).join(", ")}`
        : "";
const printGroupBy = (orderBy: SafeString[]): string =>
    orderBy.length > 0
        ? `GROUP BY ${orderBy.map((it) => it.content).join(", ")}`
        : "";
const printLimit = (limit: number | SafeString | null): string =>
    limit == null
        ? ""
        : typeof limit == "number"
        ? `LIMIT ${limit}`
        : `LIMIT ${limit.content}`;

export const printCompoundInternal = <
    Scope extends string,
    Selection extends string
>(
    compound: Compound<Scope, Selection>,
    parenthesis: boolean
): PrintInternalRet => {
    const sel = compound.__props.content
        .map((it) => printInternal(it, false).content)
        .join(` ${compound.__props.qualifier} `);

    const q = [
        sel,
        printOrderBy(compound.__props.orderBy),
        printLimit(compound.__props.limit),
    ]
        .filter((it) => it.length > 0)
        .join(" ");

    if (parenthesis) {
        return { content: `(${q})` };
    }
    return { content: q };
};

type PrintInternalRet = {
    content: string;
    with_?: string;
};

const printStringifiedSelectInternal = <Selection extends string>(
    it: StringifiedSelectStatement<Selection>
): PrintInternalRet => ({
    content: `(${it.__props.content.content})`,
});
const printCteInternal = <Selection extends string, Alias extends string>(
    cte: CommonTableExpression<Selection, Alias>
): PrintInternalRet => {
    const cols =
        cte.__props.columns.length > 0
            ? `(${cte.__props.columns.join(", ")})`
            : ``;
    const content = printInternal(cte.__props.select, false).content;
    const with_ = `${cte.__props.alias}${cols} AS (${content})`;
    return { content: cte.__props.alias, with_ };
};

const printTableInternal = <Selection extends string, Alias extends string>(
    table: Table<Selection, Alias>
): PrintInternalRet => {
    const final = table.__props.final ? ` FINAL` : "";
    if (table.__props.name === table.__props.alias) {
        return { content: wrapAliasSplitDots(table.__props.name) + final };
    }
    return {
        content: `${wrapAliasSplitDots(table.__props.name)} AS ${wrapAlias(
            table.__props.alias
        )}${final}`,
    };
};

const printConstraint = (c: JoinConstraint): { on: string; using: string } => {
    switch (c._tag) {
        case "no_constraint": {
            return {
                on: "",
                using: "",
            };
        }
        case "on": {
            const onJoined = c.on.map((it) => it.content).join(" AND ");
            const on = `ON ${onJoined}`;
            return { on, using: "" };
        }
        case "using": {
            return {
                on: "",
                using: `USING(${c.keys.map(wrapAlias).join(", ")})`,
            };
        }
    }
};

const printAliasedCode = (
    code: TableOrSubquery<any, any, any, any>,
    alias: string
): string => {
    const str = printInternal(code, true).content;
    if (code instanceof Table) {
        return str;
    }
    return `${str} AS ${wrapAlias(alias)}`;
};
const printJoinedInternal = <
    Selection extends string,
    Scope extends string,
    Aliases extends string,
    Ambiguous extends string
>(
    joined: Joined<Selection, Scope, Aliases, Ambiguous>
): PrintInternalRet => {
    const head = joined.__props.commaJoins
        .map((it) => printAliasedCode(it.code, it.alias))
        .join(", ");

    const tail = joined.__props.properJoins
        .map((it): string => {
            const { on, using } = printConstraint(it.constraint);
            return [
                it.operator,
                "JOIN",
                printAliasedCode(it.code, it.alias),
                on,
                using,
            ]
                .filter((it) => it.length > 0)
                .join(" ");
        })
        .join(" ");

    const content = [head, tail].filter((it) => it.length > 0).join(" ");
    return {
        content,
    };
};

const printClickhouseWith = (withes: ClickhouseWith[]): string =>
    withes
        .map((mapOfWith) =>
            Object.entries(mapOfWith).map(
                ([k, v]) =>
                    `${printInternal(v, true).content} AS ${wrapAlias(k)}`
            )
        )
        // flatten
        .reduce((p, c) => [...p, ...c], [])
        .join(", ");

export const printSelectStatementInternal = <
    Scope extends string,
    Selection extends string
>(
    selectStatement: SelectStatement<Scope, Selection>,
    parenthesis: boolean
): PrintInternalRet => {
    const selection = selectStatement.__props.selection
        .map((it) => {
            if (isStarSymbol(it)) {
                return ["*"];
            }
            if (isStarOfAliasSymbol(it)) {
                return it.aliases.map((alias) => `${alias}.*`);
            }
            // check if the proxy was returned in an identity function
            if (isTheProxyObject(it.content)) {
                throw new Error("not supported");
            }

            return Object.entries(it.content).map(([k, v]) => {
                return `${(v as SafeString).content} AS ${wrapAlias(k)}`;
            });
        })
        // flatten
        .reduce((p, c) => [...p, ...c], [])
        .join(", ");

    const replaceInner = selectStatement.__props.replace
        .map(([k, v]) => {
            const vContent = isSafeString(v) ? v.content : v;
            return `${vContent} AS ${wrapAlias(k)}`;
        })
        .join(", ");

    const replace =
        selectStatement.__props.replace.length > 0
            ? `REPLACE (${replaceInner})`
            : "";

    const where =
        selectStatement.__props.where.length > 0
            ? `WHERE ${selectStatement.__props.where
                  .map((it) => it.content)
                  .join(" AND ")}`
            : "";

    const prewhere =
        selectStatement.__props.prewhere.length > 0
            ? `PREWHERE ${selectStatement.__props.prewhere
                  .map((it) => it.content)
                  .join(" AND ")}`
            : "";
    const having =
        selectStatement.__props.having.length > 0
            ? `HAVING ${selectStatement.__props.having
                  .map((it) => it.content)
                  .join(" AND ")}`
            : "";
    const from =
        selectStatement.__props.from != null
            ? `FROM ${
                  printInternal(selectStatement.__props.from, true).content
              }`
            : "";

    const withFromCte =
        selectStatement.__props.from != null
            ? printInternal(selectStatement.__props.from, true).with_ ?? ""
            : "";

    const distinct = selectStatement.__props.distinct ? "DISTINCT" : "";

    const clickhouseWith =
        selectStatement.__props.clickhouseWith.length > 0
            ? printClickhouseWith(selectStatement.__props.clickhouseWith)
            : ``;
    const withKeyword =
        withFromCte.length > 0 || clickhouseWith.length > 0 ? "WITH" : "";

    const contentNoParenthesis = [
        withKeyword,
        withFromCte,
        clickhouseWith,
        "SELECT",
        distinct,
        selection,
        replace,
        from,
        prewhere,
        where,
        printGroupBy(selectStatement.__props.groupBy),
        having,
        printOrderBy(selectStatement.__props.orderBy),
        printLimit(selectStatement.__props.limit),
    ]
        .filter((it) => it.length > 0)
        .join(" ");

    const content = parenthesis
        ? `(${contentNoParenthesis})`
        : contentNoParenthesis;
    return {
        content,
    };
};

const printInternal = (
    it: TableOrSubquery<any, any, any, any>,
    parenthesis: boolean
): PrintInternalRet => {
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
    if (it instanceof CommonTableExpression) {
        return printCteInternal(it);
    }
    if (it instanceof StringifiedSelectStatement) {
        return printStringifiedSelectInternal(it);
    }
    /* istanbul ignore next */
    return absurd(it);
};

export const printSelectStatement = <
    Scope extends string,
    Selection extends string
>(
    it: SelectStatement<Scope, Selection>
): string => printSelectStatementInternal(it, false).content;

export const printCompound = <Scope extends string, Selection extends string>(
    it: Compound<Scope, Selection>
): string => printCompoundInternal(it, false).content;
