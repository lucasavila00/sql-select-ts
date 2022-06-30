/**
 * Common types used in the library.
 *
 * @since 0.0.0
 */
import { Compound } from "./classes/compound";
import { CommonTableExpression } from "./classes/cte";
import { Joined } from "./classes/joined";
import { SelectStatement } from "./classes/select-statement";
import { Table } from "./classes/table";
import { SafeString } from "./safe-string";

export type TableOrSubquery<
    Alias extends string,
    Scope extends string,
    Selection extends string,
    Ambiguous extends string
> =
    | SelectStatement<Scope, Selection>
    | Table<Alias, Selection>
    | CommonTableExpression<Alias, Selection>
    | Joined<Ambiguous, Alias, Selection>
    | Compound<Scope, Selection>;

export type NoSelectFieldsCompileError = {
    ["✕"]: CompileError<["'.select(f => f)' is invalid"]>;
};

export interface CompileError<_ErrorMessageT extends any[]> {
    /**
     * There should never be a value of this type
     */
    readonly __compileError: never;
}

export interface NonEmptyArray<A> extends Array<A> {
    0: A;
}
export type ClickhouseWith = Record<string, SelectStatement<any, any>>;
export type JoinConstraint =
    | {
          _tag: "no_constraint";
      }
    | { _tag: "on"; on: NonEmptyArray<SafeString> }
    | { _tag: "using"; keys: string[] };