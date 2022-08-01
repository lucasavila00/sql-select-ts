/**
 * Common types used in the library.
 *
 * @since 0.0.0
 */
import { AliasedCompound, Compound } from "./classes/compound";
import { Joined } from "./classes/joined";
import {
    AliasedSelectStatement,
    SelectStatement,
} from "./classes/select-statement";
import {
    AliasedStringifiedSelectStatement,
    StringifiedSelectStatement,
} from "./classes/stringified-select-statement";
import { Table } from "./classes/table";
import { AliasedRows, StarOfAliasSymbol, StarSymbol } from "./data-wrappers";
import { SafeString } from "./safe-string";

export type Joinable<
    // Selection extends string = never,
    // Alias extends string = never,
    // Scope extends ScopeShape = never,
    // FlatScope extends string = never

    Selection extends string,
    Alias extends string,
    Scope extends ScopeShape,
    FlatScope extends string
> =
    | SelectStatement<Selection, Alias, Scope, FlatScope>
    | AliasedSelectStatement<Selection, Alias, Scope, FlatScope>
    | StringifiedSelectStatement<Selection, Alias, Scope, FlatScope>
    | AliasedStringifiedSelectStatement<Selection, Alias, Scope, FlatScope>
    | Table<Selection, Alias, Scope, FlatScope>
    | Compound<Selection, Alias, Scope, FlatScope>
    | AliasedCompound<Selection, Alias, Scope, FlatScope>;

export type TableOrSubquery<
    Selection extends string = never,
    Alias extends string = never,
    Scope extends ScopeShape = never,
    FlatScope extends string = never
    // Selection extends string,
    // Alias extends string,
    // Scope extends ScopeShape,
    // FlatScope extends string
> =
    | SelectStatement<Selection, Alias, Scope, FlatScope>
    | AliasedSelectStatement<Selection, Alias, Scope, FlatScope>
    | StringifiedSelectStatement<Selection, Alias, Scope, FlatScope>
    | AliasedStringifiedSelectStatement<Selection, Alias, Scope, FlatScope>
    | Table<Selection, Alias, Scope, FlatScope>
    | Joined<Selection, Alias, Scope, FlatScope>
    | Compound<Selection, Alias, Scope, FlatScope>
    | AliasedCompound<Selection, Alias, Scope, FlatScope>;

export type NoSelectFieldsCompileError = {
    ["✕"]: CompileError<["'.select(f => f)' is invalid"]>;
};

export interface CompileError<_ErrorMessageT extends any[]> {
    /**
     * There should never be a value of this type
     */
    readonly __compileError: never;
}

export interface ReadOnlyNonEmptyArray<A> extends ReadonlyArray<A> {
    0: A;
}
export type ClickhouseWith = Record<
    string,
    | SelectStatement<any, any, any, any>
    | StringifiedSelectStatement<any, any, any, any>
>;
export type JoinConstraint =
    | {
          _tag: "no_constraint";
      }
    | { _tag: "on"; on: ReadOnlyNonEmptyArray<SafeString> }
    | { _tag: "using"; keys: ReadonlyArray<string> };

export type SelectionOfSelectStatement<T> = T extends SelectStatement<
    infer Selection,
    infer _Alias,
    infer _Scope,
    infer _FlatScope
>
    ? Selection
    : never;

export type ScopeOfSelectStatement<T> = T extends SelectStatement<
    infer _Selection,
    infer _Alias,
    infer Scope,
    infer _FlatScope
>
    ? Scope
    : never;

export type CTE = {
    readonly columns: ReadonlyArray<string>;
    readonly alias: string;
    readonly select: SelectStatement<any, any, any, any>;
};
export type ScopeShape = { [key: string]: string };
export type SelectionOfScope<Scope extends ScopeShape = never> = {
    [key in keyof Scope]: { [key2 in Scope[key]]: SafeString };
};
export type RecordOfSelection<Selection extends string = never> = Record<
    Selection,
    SafeString
>;
export type SelectionRecordCallbackShape =
    | ReadonlyArray<string>
    | ((
          fields: RecordOfSelection<string> &
              SelectionOfScope<ScopeShape> &
              NoSelectFieldsCompileError
      ) => Record<string, SafeString>);

export type SelectionArrayCallbackShape =
    | ReadonlyArray<string>
    | ((
          fields: SelectionOfScope<ScopeShape>
      ) => SafeString | ReadonlyArray<SafeString>);

export type SelectionReplaceCallbackShape = (
    f: Record<string, SafeString> & NoSelectFieldsCompileError
) => ReadonlyArray<readonly [string, SafeString | number]>;

export type SelectionWrapperTypes = ReadonlyArray<
    AliasedRows<any> | StarSymbol | StarOfAliasSymbol
>;

export type ScopeStorage = Record<string, void>;
export type ValidAliasInSelection<T, Alias2 extends string = never> = [
    Alias2
] extends [never]
    ? CompileError<["use alias"]>
    : T;

export type UnionToIntersection<T> = (
    T extends any ? (x: T) => any : never
) extends (x: infer R) => any
    ? R
    : never;
