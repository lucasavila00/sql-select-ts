/**
 * Entry points of the library.
 *
 * @since 0.0.0
 */

import { SelectStatement } from "./classes/select-statement";
import { Table } from "./classes/table";
// import renaming, then re-export to make sure docs-ts can run the inline tests
import { castSafe as _castSafe, sql as _sql } from "./safe-string";

/**
 *
 * Create a table definition. Optinionally, you can provide an alias for the table, which can differ from it's name.
 *
 * @example
 *
 * import { table } from "sql-select-ts";
 * const t1 = table(["id", "name"], "users");
 * assert.strictEqual(t1.selectStar().print(), "SELECT * FROM users;");
 *
 * const t2 = table(["id", "name"], "alias", "users");
 * assert.strictEqual(t2.selectStar().print(), "SELECT * FROM users AS alias;");
 *
 * @category starter
 * @since 0.0.0
 */
export const table = Table.define;

/**
 *
 * Select data from no source.
 *
 * @example
 *
 * import { fromNothing, sql } from "sql-select-ts";
 * const q1 = fromNothing({ a: sql(123) });
 * assert.strictEqual(q1.print(), "SELECT 123 AS a;");
 *
 * @category starter
 * @since 0.0.0
 */
export const fromNothing = SelectStatement.fromNothing;

export {
    /**
     * @category compound
     * @since 0.0.0
     */
    union,
    /**
     * @category compound
     * @since 0.0.0
     */
    unionAll,
} from "./classes/compound";

/**
 *
 * Creates a SafeString from a string.
 * Useful for embedding other SQL statements in your SQL query, or building helper functions.
 *
 * @example
 *
 * import { castSafe, sql } from "sql-select-ts";
 *
 * assert.strictEqual(castSafe(";'abc'").content, ";'abc'");
 * assert.strictEqual(sql(";'abc'").content, "';\\'abc\\''");
 *
 * @category string-builder
 * @since 0.0.0
 */
export const castSafe = _castSafe;

/**
 *
 * Safe-string builder. Works as a function or string template literal.
 *
 * Check in depth docs in the safe-string.ts module.
 *
 * @example
 * import { fromNothing, sql } from "sql-select-ts";
 * assert.strictEqual(sql(";'abc'").content, "';\\'abc\\''");
 * assert.strictEqual(sql(123).content, "123");
 * assert.strictEqual(sql(null).content, "NULL");
 * assert.strictEqual(sql`${123} + 456`.content, "123 + 456");
 * const name = "A";
 * const names = ["A", "B", "C"];
 * assert.strictEqual(sql`${name} IN (${names})`.content, "'A' IN ('A', 'B', 'C')");
 * const q = fromNothing({ it: sql(123) });
 * assert.strictEqual(sql`${name} IN ${q}`.content, "'A' IN (SELECT 123 AS it)");
 *
 * @category string-builder
 * @since 0.0.0
 */
export const sql = _sql;

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
