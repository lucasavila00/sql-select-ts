import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import { isNumber } from "fp-ts/lib/number";
import { SelectStatement } from "./classes/select-statement";
import { isStarSymbol, isStarOfAliasSymbol } from "./data-wrappers";
import { SafeString } from "./safe-string";
import { TableOrSubquery } from "./types";
import { wrapAlias } from "./utils";

const printSelectStatementInternal = <
    With extends string,
    Scope extends string,
    Selection extends string
>(
    it: SelectStatement<With, Scope, Selection>,
    parenthesis: boolean
): string => {
    const sel = pipe(
        it.__selection,
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
        it.__where.length > 0
            ? `WHERE ${it.__where.map((it) => it.content).join(" AND ")}`
            : "";

    const orderBy =
        it.__orderBy.length > 0
            ? `ORDER BY ${it.__orderBy.map((it) => it.content).join(", ")}`
            : "";

    const limit = it.__limit
        ? isNumber(it.__limit)
            ? `LIMIT ${it.__limit}`
            : `LIMIT ${it.__limit.content}`
        : "";

    const from =
        it.__from != null ? `FROM ${printInternal(it.__from, true)}` : "";

    const doesSelectMainAlias = sel.includes("main_alias");

    const main_alias = doesSelectMainAlias ? "AS main_alias" : "";

    const content = [`SELECT ${sel}`, from, main_alias, where, orderBy, limit]
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
    throw new Error("not implemented");
};

export const printSelectStatement = <
    With extends string,
    Scope extends string,
    Selection extends string
>(
    it: SelectStatement<With, Scope, Selection>
): string => printSelectStatementInternal(it, false) + ";";
