/**
 * Common types used in the library.
 *
 * @since 0.0.0
 */
import { Compound } from "./classes/compound";
import { Joined } from "./classes/joined";
import { SelectStatement } from "./classes/select-statement";
import { StringifiedSelectStatement } from "./classes/stringified-select-statement";
import { Table } from "./classes/table";
import { SafeString } from "./safe-string";

export type TableOrSubquery<
    Alias extends string,
    Scope extends string,
    Selection extends string,
    Ambiguous extends string
> =
    | SelectStatement<Scope, Selection>
    | StringifiedSelectStatement<Selection>
    | Table<Selection, Alias>
    | Joined<Selection, Scope, Alias, Ambiguous>
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

export interface NonEmptyArray<A> extends ReadonlyArray<A> {
    0: A;
}
export type ClickhouseWith = Record<
    string,
    SelectStatement<any, any> | StringifiedSelectStatement<any>
>;
export type JoinConstraint =
    | {
          _tag: "no_constraint";
      }
    | { _tag: "on"; on: NonEmptyArray<SafeString> }
    | { _tag: "using"; keys: ReadonlyArray<string> };

export type SelectionOfSelectStatement<T> = T extends SelectStatement<
    infer _Scope,
    infer Selection
>
    ? Selection
    : never;

export type CTE = {
    readonly columns: ReadonlyArray<string>;
    readonly alias: string;
    readonly select: SelectStatement<any, any>;
};
