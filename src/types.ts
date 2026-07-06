/**
 * Common types used in the library.
 *
 * @since 2.0.0
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

export type Joinable =
    | SelectStatement
    | AliasedSelectStatement
    | StringifiedSelectStatement
    | AliasedStringifiedSelectStatement
    | Table
    | Compound
    | AliasedCompound;

export type TableOrSubquery = Joinable | Joined;

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
    SelectStatement | StringifiedSelectStatement
>;
export type JoinConstraint =
    | {
          _tag: "no_constraint";
      }
    | { _tag: "on"; on: ReadOnlyNonEmptyArray<SafeString> }
    | { _tag: "using"; keys: ReadonlyArray<string> };

export type CTE = {
    readonly columns: ReadonlyArray<string>;
    readonly select: AliasedSelectStatement;
};
export type FieldAccess = SafeString & { readonly [key: string]: SafeString };
export type Fields = Record<string, FieldAccess>;
export type SelectionRecord = Record<string, SafeString> & {
    ["✕"]?: never;
};
export type SelectionRecordCallbackShape =
    | ReadonlyArray<string>
    | ((fields: Fields & NoSelectFieldsCompileError) => SelectionRecord);

export type SelectionArrayCallbackShape =
    | ReadonlyArray<string>
    | ((fields: Fields) => SafeString | ReadonlyArray<SafeString>);

export type SelectionReplaceCallbackShape = (
    f: Fields & NoSelectFieldsCompileError
) => ReadonlyArray<readonly [string, SafeString | number]>;

export type SelectionWrapperTypes = ReadonlyArray<
    AliasedRows | StarSymbol | StarOfAliasSymbol
>;

export type ScopeStorage = Record<string, void>;
