import { Compound } from "./classes/compound";
import { Joined } from "./classes/joined";
import { SelectStatement } from "./classes/select-statement";
import { StringifiedSelectStatement } from "./classes/stringified-select-statement";
import { Table } from "./classes/table";
import { isTheProxyObject } from "./consume-fields";
import { isStarSymbol, isStarOfAliasSymbol } from "./data-wrappers";
import type { SafeString } from "./safe-string";
import { ClickhouseWith, CTE, JoinConstraint, TableOrSubquery } from "./types";
import { absurd } from "./utils";
import { wrapAlias } from "./wrap-alias";

// re-define to avoid circular dependency
/* istanbul ignore next */
const isSafeString = (it: any): it is SafeString => it?._tag === "SafeString";

const printOrderBy = (orderBy: ReadonlyArray<SafeString>): string =>
    orderBy.length > 0
        ? `ORDER BY ${orderBy.map((it) => it.content).join(", ")}`
        : "";
const printGroupBy = (orderBy: ReadonlyArray<SafeString>): string =>
    orderBy.length > 0
        ? `GROUP BY ${orderBy.map((it) => it.content).join(", ")}`
        : "";
const printLimit = (limit: number | SafeString | null): string =>
    limit == null
        ? ""
        : typeof limit == "number"
        ? `LIMIT ${limit}`
        : `LIMIT ${limit.content}`;

export const printCompoundInternal = (
    compound: Compound<any, any, any>,
    parenthesis: boolean
): PrintInternalRet => {
    console.error("handle alias");
    const sel = compound.__props.content
        .map((it) => printInternal(it, false))
        .join(` ${compound.__props.qualifier} `);

    const q = [
        sel,
        printOrderBy(compound.__props.orderBy),
        printLimit(compound.__props.limit),
    ]
        .filter((it) => it.length > 0)
        .join(" ");

    if (parenthesis) {
        return `(${q})`;
    }
    return q;
};

type PrintInternalRet = string;

const printStringifiedSelectInternal = <Selection extends string>(
    it: StringifiedSelectStatement<Selection>
): PrintInternalRet => {
    console.error("handle alias");
    return `(${it.__props.content.content})`;
};

const printTableInternal = (table: Table<any, any, any>): PrintInternalRet => {
    const final = table.__props.final ? ` FINAL` : "";
    if (table.__props.name === table.__props.alias) {
        return wrapAlias(table.__props.name) + final;
    }
    return `${wrapAlias(table.__props.name)} AS ${wrapAlias(
        table.__props.alias
    )}${final}`;
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

const printJoinedInternal = (
    joined: Joined<any, any, any>
): PrintInternalRet => {
    const head = joined.__props.commaJoins
        .map((it) => printInternal(it, true))
        .join(", ");

    const tail = joined.__props.properJoins
        .map((it): string => {
            const { on, using } = printConstraint(it.constraint);
            return [
                it.operator,
                "JOIN",
                printInternal(it.code, true),
                on,
                using,
            ]
                .filter((it) => it.length > 0)
                .join(" ");
        })
        .join(" ");

    const content = [head, tail].filter((it) => it.length > 0).join(" ");
    return content;
};
const printCtes = (ctes: ReadonlyArray<CTE>): string =>
    ctes
        .map((cte) => {
            const cols =
                cte.columns.length > 0
                    ? `(${cte.columns.map(wrapAlias).join(", ")})`
                    : ``;
            const content = printInternal(cte.select, false);
            return `${wrapAlias(cte.alias)}${cols} AS (${content})`;
        })
        .join(", ");

const printClickhouseWith = (withes: ReadonlyArray<ClickhouseWith>): string =>
    withes
        .map((mapOfWith) =>
            Object.entries(mapOfWith).map(
                ([k, v]) => `${printInternal(v, true)} AS ${wrapAlias(k)}`
            )
        )
        // flatten
        .reduce((p, c) => [...p, ...c], [])
        .join(", ");

export const printSelectStatementInternal = (
    selectStatement: SelectStatement<any, any, any>,
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
            ? `FROM ${printInternal(selectStatement.__props.from, true)}`
            : "";

    const distinct = selectStatement.__props.distinct ? "DISTINCT" : "";

    const clickhouseWith =
        selectStatement.__props.clickhouseWith.length > 0
            ? printClickhouseWith(selectStatement.__props.clickhouseWith)
            : ``;

    const withFromCte =
        selectStatement.__props.ctes.length > 0
            ? printCtes(selectStatement.__props.ctes)
            : "";

    const withKeyword =
        withFromCte.length > 0 || clickhouseWith.length > 0 ? "WITH" : "";

    const contentNoParenthesis = [
        withKeyword,
        clickhouseWith,
        withFromCte,
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

    const alias =
        selectStatement.__props.alias != null
            ? ` AS ${wrapAlias(selectStatement.__props.alias)}`
            : "";

    const content = parenthesis
        ? `(${contentNoParenthesis})${alias}`
        : contentNoParenthesis;
    return content;
};

const printInternal = (
    it: TableOrSubquery<any, any, any>,
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
    if (it instanceof StringifiedSelectStatement) {
        return printStringifiedSelectInternal(it);
    }
    /* istanbul ignore next */
    return absurd(it);
};

export const printSelectStatement = (
    it: SelectStatement<any, any, any>
): string => printSelectStatementInternal(it, false);

export const printCompound = (it: Compound<any, any, any>): string =>
    printCompoundInternal(it, false);
