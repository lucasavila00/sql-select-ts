/**
 * Safe String and it's building mechanisms allows us to have painless, injection safe SQL string building.
 *
 * @since 0.0.0
 */
import { Compound } from "./classes/compound";
import { SelectStatement } from "./classes/select-statement";
import { printCompoundInternal, printSelectStatementInternal } from "./print";

/**
 *
 * Tag used to discriminate a SafeString object.
 *
 * @since 0.0.0
 */
export const SafeStringURI = "SafeString" as const;

/**
 *
 * Type used to represent a string that is safe to use in a SQL query.
 *
 * @since 0.0.0
 */
export type SafeString = {
    _tag: typeof SafeStringURI;
    content: string;
};

/**
 * Creates a SafeString from a string.
 *
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
export const castSafe = (content: string): SafeString => ({
    _tag: SafeStringURI,
    content,
});

/**
 * Type guard to check if the value is a SafeString.
 *
 * @example
 *
 * import { isSafeString, sql } from "sql-select-ts";
 *
 * assert.strictEqual(isSafeString(sql(123)), true);
 *
 * @category string-builder
 * @since 0.0.0
 */
export const isSafeString = (it: any): it is SafeString =>
    it?._tag === SafeStringURI;

// adapted from https://github.com/mysqljs/sqlstring/blob/master/lib/SqlString.js
// eslint-disable-next-line no-useless-escape
const CHARS_GLOBAL_REGEXP = /[\0\b\t\n\r\x1a\"\'\\]/g; // eslint-disable-line no-control-regex
const CHARS_ESCAPE_MAP = {
    "\0": "\\0",
    "\b": "\\b",
    "\t": "\\t",
    "\n": "\\n",
    "\r": "\\r",
    "\x1a": "\\Z",
    '"': '\\"',
    "'": "\\'",
    "\\": "\\\\",
};

const escapeForSql = function (
    val: any,
    serializers: Serializer<any>[]
): string {
    const serializer = serializers.find((s) => s.check(val));
    if (serializer != null) {
        return serializer.serialize(val);
    }

    if (val === undefined || val === null) {
        return "NULL";
    }

    switch (typeof val) {
        case "number":
            return val + "";
        case "object":
            if (isSafeString(val)) {
                return val.content;
            } else if (val instanceof SelectStatement) {
                return printSelectStatementInternal(val, true).content;
            } else if (val instanceof Compound) {
                return printCompoundInternal(val, true).content;
            } else if (Array.isArray(val)) {
                return arrayToList(val, serializers);
            } else {
                throw new Error(
                    `unsupported value ${val} of type ${typeof val} `
                );
            }
        default:
            return escapeString(val);
    }
};

const arrayToList = function arrayToList<T>(
    array: T[],
    serializers: Serializer<any>[]
) {
    let sql = "";

    for (let i = 0; i < array.length; i++) {
        sql += (i === 0 ? "" : ", ") + escapeForSql(array[i], serializers);
    }

    return sql;
};

function escapeString(val: string) {
    let chunkIndex = (CHARS_GLOBAL_REGEXP.lastIndex = 0);
    let escapedVal = "";
    let match;

    while ((match = CHARS_GLOBAL_REGEXP.exec(val))) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        escapedVal +=
            val.slice(chunkIndex, match.index) +
            (CHARS_ESCAPE_MAP as any)[(match as any)[0]];
        chunkIndex = CHARS_GLOBAL_REGEXP.lastIndex;
    }

    if (chunkIndex === 0) {
        // Nothing was escaped
        return "'" + val + "'";
    }

    if (chunkIndex < val.length) {
        return "'" + escapedVal + val.slice(chunkIndex) + "'";
    }

    return "'" + escapedVal + "'";
}

type SqlSupportedTypes =
    | SafeString
    | string
    | number
    | null
    | undefined
    | SelectStatement<any, any>
    | Compound<any, any>;

type TemplateLiteralSql = [
    ReadonlyArray<string>,
    ...(SqlSupportedTypes | readonly SqlSupportedTypes[])[]
];

/**
 * A custom serializer for the SQL string builder.
 *
 * @since 0.0.1
 */
export type Serializer<T> = {
    check: (it: unknown) => it is T;
    serialize: (it: T) => string;
};

type SerializerInnerType<T extends Serializer<any>> = T extends Serializer<
    infer U
>
    ? U
    : never;

/**
 * A `sql` builder generic overloaded function.
 *
 * @since 0.0.1
 */
export interface SqlStringBuilderOverloadedFn<T> {
    (it: string | number | null | T): SafeString;
    (
        template: ReadonlyArray<string>,
        ...args: (SqlSupportedTypes | T | readonly (SqlSupportedTypes | T)[])[]
    ): SafeString;
}

type ArgsOfSerializerList<T extends Serializer<any>[]> = SerializerInnerType<
    T[number]
>;

/**
 * A `sql` builder type based on the serializer types.
 *
 * @since 0.0.1
 */
export type SqlStringBuilder<T extends Serializer<any>[]> =
    SqlStringBuilderOverloadedFn<ArgsOfSerializerList<T>>;
/**
 * Create one serializer.
 *
 * @category string-builder
 * @since 0.0.1
 */
export const buildSerializer = <T>(args: {
    check: (it: unknown) => it is T;
    serialize: (it: T) => string;
}): Serializer<T> => args;

/**
 * Create a custom version of the `sql` SafeString builder, using the serializers to serialize values.
 * The types allowed in the string templates will be inferred from the serializers.
 *
 * @category string-builder
 * @since 0.0.1
 */
export const buildSql =
    <T extends Serializer<any>[]>(serializers: T): SqlStringBuilder<T> =>
    (...argsRaw: [string | number | null] | TemplateLiteralSql): SafeString => {
        const firstArg = argsRaw[0];

        // called as template literal
        if (Array.isArray(firstArg)) {
            const [template, ...args] = argsRaw as TemplateLiteralSql;
            let str = "";
            template.forEach((string, i) => {
                const item = args[i];

                if (args.length > i) {
                    str += string + escapeForSql(item, serializers);
                } else {
                    str += string;
                }
            });
            return castSafe(str);
        }

        // called as function
        return castSafe(escapeForSql(firstArg, serializers));
    };

/**
 *
 * Safe-string builder. Works as a function or string template literal.
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
 * assert.strictEqual(sql`${name} IN ${q}`.content, "'A' IN (SELECT 123 AS `it`)");
 *
 * @category string-builder
 * @since 0.0.0
 */
export const sql = buildSql([]);
