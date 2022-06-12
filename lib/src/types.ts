/**
 * Common types used in the library.
 *
 * @since 0.0.0
 */
import { Compound } from "./classes/compound";
import { Joined } from "./classes/joined";
import { SelectStatement } from "./classes/select-statement";
import { Table } from "./classes/table";

/**
 *
 * Represents a possible source for a select.
 *
 * @since 0.0.0
 */
export type TableOrSubquery<
    Alias extends string,
    With extends string,
    Scope extends string,
    Selection extends string
> =
    | SelectStatement<With, Scope, Selection>
    | Table<Alias, Selection>
    | Joined<Alias, Selection>
    | Compound<Scope, Selection>;

/**
 * Internal error type used to prevent selecting the entire fields object, as in `q.select(f=>f)`.
 * @since 0.0.0
 */
export type NoSelectFieldsCompileError = {
    ["✕"]: CompileError<["'.select(f => f)' is invalid"]>;
};

/**
 *
 * Internal error type used to provide custom compile error messages.
 *
 * @since 0.0.0
 */
export interface CompileError<ErrorMessageT extends any[]> {
    /**
     * There should never be a value of this type
     */
    readonly __compileError: never;
}
