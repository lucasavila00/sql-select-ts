import { Compound } from "./classes/compound";
import { SelectStatement } from "./classes/select-statement";
import { printCompoundInternal, printSelectStatementInternal } from "./print";
// moment.tz.setDefault("UTC");

export const SafeStringURI = "SafeString" as const;
export type SafeString = {
    _tag: typeof SafeStringURI;
    content: string;
};

export const castSafe = (content: string): SafeString => ({
    _tag: SafeStringURI,
    content,
});

export const safeStringKeys = (it: Record<string, unknown>): SafeString[] =>
    Object.keys(it).map(escapeIdentifier);

export const isSafeString = (it: any): it is SafeString =>
    it?._tag === SafeStringURI;

export type SqlSupportedTypes =
    | SafeString
    | string
    | number
    | boolean
    | null
    | undefined
    | SelectStatement<any, any, any>
    | Compound<any, any>;

export const escapeIdentifier = (it: string): SafeString =>
    castSafe(escapeNoQuotes(it));

// adapted from https://github.com/mysqljs/sqlstring/blob/master/lib/SqlString.js
var ID_GLOBAL_REGEXP = /`/g;
var QUAL_GLOBAL_REGEXP = /\./g;
var CHARS_GLOBAL_REGEXP = /[\0\b\t\n\r\x1a\"\'\\]/g; // eslint-disable-line no-control-regex
var CHARS_ESCAPE_MAP = {
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
const escapeNoQuotes = (val: string): string => {
    var chunkIndex = (CHARS_GLOBAL_REGEXP.lastIndex = 0);
    var escapedVal = "";
    var match;

    while ((match = CHARS_GLOBAL_REGEXP.exec(val))) {
        //@ts-ignore
        escapedVal +=
            val.slice(chunkIndex, match.index) +
            (CHARS_ESCAPE_MAP as any)[match[0]];
        chunkIndex = CHARS_GLOBAL_REGEXP.lastIndex;
    }

    if (chunkIndex === 0) {
        // Nothing was escaped
        return val;
    }

    if (chunkIndex < val.length) {
        return escapedVal + val.slice(chunkIndex);
    }

    return escapedVal;
};

const escapeId = function (val: string | number, forbidQualified = false) {
    if (Array.isArray(val)) {
        var sql = "";

        for (var i = 0; i < val.length; i++) {
            sql += (i === 0 ? "" : ", ") + escapeId(val[i], forbidQualified);
        }

        return sql;
    } else if (forbidQualified) {
        return "`" + String(val).replace(ID_GLOBAL_REGEXP, "``") + "`";
    } else {
        return (
            "`" +
            String(val)
                .replace(ID_GLOBAL_REGEXP, "``")
                .replace(QUAL_GLOBAL_REGEXP, "`.`") +
            "`"
        );
    }
};

export const escapeForSql = function (val: any, stringifyObjects = false) {
    if (val === undefined || val === null) {
        return "NULL";
    }

    switch (typeof val) {
        case "boolean":
            return val ? "1" : "0";
        case "number":
            return val + "";
        case "object":
            if (isSafeString(val)) {
                return val.content;
            } else if (val instanceof SelectStatement) {
                return printSelectStatementInternal(val, true);
            } else if (val instanceof Compound) {
                return printCompoundInternal(val, true);
            }
            //  else if (moment.isMoment(val)) {
            //     return dateToString(val);
            // }
            else if (Array.isArray(val)) {
                return arrayToList(val);
            } else if (Buffer.isBuffer(val)) {
                return bufferToString(val);
            } else if (typeof val.toSqlString === "function") {
                return String(val.toSqlString());
            } else if (stringifyObjects) {
                return escapeString(val.toString());
            } else {
                return objectToValues(val);
            }
        default:
            return escapeString(val);
    }
};

const arrayToList = function arrayToList<T>(array: T[]) {
    var sql = "";

    for (var i = 0; i < array.length; i++) {
        var val = array[i];

        if (Array.isArray(val)) {
            sql += (i === 0 ? "" : ", ") + "(" + arrayToList(val) + ")";
        } else {
            sql += (i === 0 ? "" : ", ") + escapeForSql(val, true);
        }
    }

    return sql;
};

// const dateToString = function dateToString(m: moment.Moment) {
//     const str = m.format("YYYY-MM-DD HH:mm:ss");
//     const tz = m.tz() ?? "UTC";
//     return `toDateTime('${str}', '${tz}')`;
// };

const bufferToString = function bufferToString(buffer: Buffer) {
    return "X" + escapeString(buffer.toString("hex"));
};

const objectToValues = function objectToValues(
    object: Record<string | number, any>
) {
    var sql = "";

    for (var key in object) {
        var val = object[key];

        if (typeof val === "function") {
            continue;
        }

        sql +=
            (sql.length === 0 ? "" : ", ") +
            escapeId(key) +
            " = " +
            escapeForSql(val, true);
    }

    return sql;
};
function escapeString(val: string) {
    var chunkIndex = (CHARS_GLOBAL_REGEXP.lastIndex = 0);
    var escapedVal = "";
    var match;

    while ((match = CHARS_GLOBAL_REGEXP.exec(val))) {
        //@ts-ignore
        escapedVal +=
            val.slice(chunkIndex, match.index) +
            (CHARS_ESCAPE_MAP as any)[match[0]];
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

type TemplateLiteralSql = [
    ReadonlyArray<string>,
    ...(SqlSupportedTypes | readonly SqlSupportedTypes[])[]
];

export function sql(it: string | number | null): SafeString;
export function sql(
    template: ReadonlyArray<string>,
    ...args: (SqlSupportedTypes | readonly SqlSupportedTypes[])[]
): SafeString;
export function sql(
    ...argsRaw: [string | number | null] | TemplateLiteralSql
): SafeString {
    const firstArg = argsRaw[0];
    if (Array.isArray(firstArg)) {
        const [template, ...args] = argsRaw as TemplateLiteralSql;
        let str = "";
        template.forEach((string, i) => {
            const item = args[i];

            if (args.length > i) {
                str += string + escapeForSql(item);
            } else {
                str += string;
            }
        });
        return castSafe(str);
    }

    // called as function
    return castSafe(escapeForSql(firstArg));
}
