/**
 * Entry points of the library.
 *
 * @since 0.0.0
 */

import { Compound } from "./classes/compound";
import { CommonTableExpressionFactory } from "./classes/common-table-expression";
import { SelectStatement } from "./classes/select-statement";
import { Table } from "./classes/table";
import { StringifiedSelectStatement } from "./classes/stringified-select-statement";
import { SafeString } from "./safe-string";
import {
    NoSelectFieldsCompileError,
    RecordOfSelection,
    ScopeShape,
    SelectionOfScope,
    TableOrSubquery,
} from "./types";

/**
 *
 * Create a select statement from a raw string.
 *
 * @example
 *
 * import { fromStringifiedSelectStatement, castSafe } from "sql-select-ts";
 * const s1 = fromStringifiedSelectStatement(castSafe("SELECT * FROM `users`"))
 * assert.strictEqual(s1.selectStar().stringify(), "SELECT * FROM (SELECT * FROM `users`)");
 *
 * @category starter
 * @since 0.0.3
 */
export const fromStringifiedSelectStatement =
    StringifiedSelectStatement.fromSafeString;

/**
 *
 * Create a table definition. Optionally, you can provide an alias for the table, which can differ from it's name.
 *
 * @example
 *
 * import { table } from "sql-select-ts";
 * const t1 = table(["id", "name"], "users");
 * assert.strictEqual(t1.selectStar().stringify(), "SELECT * FROM `users`");
 *
 * const t2 = table(["id", "name"], "alias", "users");
 * assert.strictEqual(t2.selectStar().stringify(), "SELECT * FROM `users` AS `alias`");
 *
 * @category starter
 * @since 0.0.0
 */
export const table = Table.define;

/**
 *
 * Create a common table expression.
 *
 * @category starter
 * @since 1.0.0
 */
export const with_ = CommonTableExpressionFactory.define;

/**
 *
 * Create a common table expression, renaming the selection.
 *
 * @category starter
 * @since 1.0.0
 */
export const withR = CommonTableExpressionFactory.defineRenamed;

/**
 *
 * Select data from no source.
 *
 * @example
 *
 * import { fromNothing, dsql as sql } from "sql-select-ts";
 * const q1 = fromNothing({ a: sql(123) });
 * assert.strictEqual(q1.stringify(), "SELECT 123 AS `a`");
 *
 * @category starter
 * @since 0.0.0
 */
export const fromNothing = SelectStatement.fromNothing;

/**
 * Creates a compound query using 'UNION'
 *
 * @example
 * import { fromNothing, dsql as sql, union } from "sql-select-ts";
 * const q1 = fromNothing({ a: sql(123) });
 * const q2 = fromNothing({ a: sql(456) });
 *
 * const u = union([q1, q2]);
 * assert.strictEqual(u.stringify(), "SELECT 123 AS `a` UNION SELECT 456 AS `a`");
 *
 * @category compound
 * @since 0.0.0
 */
export const union = Compound.__fromQualifier("UNION");

/**
 * Creates a compound query using 'UNION ALL'
 *
 * @example
 * import { fromNothing, dsql as sql, unionAll } from "sql-select-ts";
 * const q1 = fromNothing({ a: sql(123) });
 * const q2 = fromNothing({ a: sql(456) });
 *
 * const u = unionAll([q1, q2]);
 * assert.strictEqual(u.stringify(), "SELECT 123 AS `a` UNION ALL SELECT 456 AS `a`");
 *
 * @category compound
 * @since 0.0.0
 */
export const unionAll = Compound.__fromQualifier("UNION ALL");

/**
 * Creates a compound query using 'INTERSECT'
 *
 * @example
 * import { fromNothing, dsql as sql, intersect } from "sql-select-ts";
 * const q1 = fromNothing({ a: sql(123) });
 * const q2 = fromNothing({ a: sql(456) });
 *
 * const u = intersect([q1, q2]);
 * assert.strictEqual(u.stringify(), "SELECT 123 AS `a` INTERSECT SELECT 456 AS `a`");
 *
 * @category compound
 * @since 0.0.1
 */
export const intersect = Compound.__fromQualifier("INTERSECT");

/**
 * Creates a compound query using 'EXCEPT'
 *
 * @example
 * import { fromNothing, dsql as sql, except } from "sql-select-ts";
 * const q1 = fromNothing({ a: sql(123) });
 * const q2 = fromNothing({ a: sql(456) });
 *
 * const u = except([q1, q2]);
 * assert.strictEqual(u.stringify(), "SELECT 123 AS `a` EXCEPT SELECT 456 AS `a`");
 *
 * @category compound
 * @since 0.0.1
 */
export const except = Compound.__fromQualifier("EXCEPT");

export {
    /**
     * Type guard to check if the value is a SafeString.
     *
     * @example
     *
     * import { isSafeString, dsql as sql } from "sql-select-ts";
     *
     * assert.strictEqual(isSafeString(sql(123)), true);
     *
     * @category string-builder
     * @since 0.0.0
     */
    isSafeString,
    /**
     *
     * Creates a SafeString from a string.
     *
     * Useful for embedding other SQL statements in your SQL query, or building helper functions.
     *
     * @example
     *
     * import { castSafe, dsql as sql } from "sql-select-ts";
     *
     * assert.strictEqual(castSafe(";'abc'").content, ";'abc'");
     * assert.strictEqual(sql(";'abc'").content, "';\\'abc\\''");
     *
     * @category string-builder
     * @since 0.0.0
     */
    castSafe,
    /**
     *
     * Safe-string builder. Works as a function or string template literal.
     *
     * Check in depth docs in the safe-string.ts module.
     *
     * @example
     * import { fromNothing, dsql as sql } from "sql-select-ts";
     * assert.strictEqual(sql(";'abc'").content, "';\\'abc\\''");
     * assert.strictEqual(sql(123).content, "123");
     * assert.strictEqual(sql(null).content, "NULL");
     * assert.strictEqual(sql`${123} + 456`.content, "123 + 456");
     * const name = "A";
     * const names = ["A", "B", "C"];
     * assert.strictEqual(sql`${name} IN (${names})`.content, "'A' IN ('A', 'B', 'C')");
     * const q = fromNothing({ it: sql(123) });
     * assert.strictEqual(sql`${name} IN ${q}`.content, "'A' IN (SELECT 123 AS `it`)");
     *
     * @category string-builder
     * @since 1.0.0
     */
    dsql,
    /**
     *
     * @category string-builder
     * @since 0.0.1
     */
    buildSerializer,
    /**
     *
     * @category string-builder
     * @since 0.0.1
     */
    buildSql,
} from "./safe-string";

export type {
    /**
     *
     * A wrapper over a string, We assume that strings inside the wrapper are safe to write as plain SQL.
     *
     * @category string-builder
     * @since 0.0.0
     */
    SafeString,
} from "./safe-string";

export type {
    /**
     * Return an array of objects, where the object keys are the columns of the selection.
     *
     * @example
     *
     * import { table, RowsArray } from "sql-select-ts";
     * const t1 = table(["id", "name"], "users");
     * const q = t1.selectStar();
     * type Ret = RowsArray<typeof q>;
     * const ret: Ret = [];
     * console.log(ret?.[0]?.id)
     * console.log(ret?.[0]?.name)
     * //@ts-expect-error
     * console.log(ret?.[0]?.abc)
     *
     * @since 0.0.1
     */
    RowsArray,
    /**
     * Given a printable object, returns the union of the selection keys.
     *
     * @example
     *
     * import { table, SelectionOf } from "sql-select-ts";
     * const t1 = table(["id", "name"], "users");
     * const q = t1.selectStar();
     * type Key = SelectionOf<typeof q>;
     * const k: Key = 'id';
     * assert.strictEqual(k, 'id');
     * //@ts-expect-error
     * const k2: Key = 'abc';
     *
     * @since 0.0.1
     */
    SelectionOf,
    /**
     * @since 0.0.1
     */
    AnyPrintable,
    /**
     * Return a objects, where the keys are the columns of the selection.
     *
     * @example
     *
     * import { table, RowOf } from "sql-select-ts";
     * const t1 = table(["id", "name"], "users");
     * const q = t1.selectStar();
     * type Ret = RowOf<typeof q>;
     * const ret: Ret = {id: 1, name: null}
     * console.log(ret.id)
     * console.log(ret.name)
     * //@ts-expect-error
     * console.log(ret.abc)
     *
     * @since 0.0.1
     */
    RowOf,
} from "./ts-helpers";

/**
 * Creates a query selecting from the second parameter.
 *
 * @category starter
 * @since 1.0.0
 */
export const select = <
    FromSelection extends string = never,
    FromAlias extends string = never,
    FromScope extends ScopeShape = never,
    FromFlatScope extends string = never,
    NewSelection extends string = never,
    SubSelection extends FromSelection = never
>(
    _:
        | ReadonlyArray<SubSelection>
        | ((
              fields: RecordOfSelection<FromSelection> &
                  SelectionOfScope<FromScope> &
                  NoSelectFieldsCompileError
          ) => Record<NewSelection, SafeString>),
    from: TableOrSubquery<FromSelection, FromAlias, FromScope, FromFlatScope>
): SelectStatement<
    NewSelection | SubSelection,
    never,
    FromScope,
    FromFlatScope
> =>
    //@ts-expect-error
    from.select(_);

/**
 *
 * Creates a query selecting all from the second parameter.
 *
 * @category starter
 * @since 1.0.0
 */
export const selectStar = <
    FromSelection extends string = never,
    FromAlias extends string = never,
    FromScope extends ScopeShape = never,
    FromFlatScope extends string = never
>(
    from: TableOrSubquery<FromSelection, FromAlias, FromScope, FromFlatScope>
): SelectStatement<FromSelection, never, never, FromSelection> =>
    //@ts-expect-error
    from.selectStar();
