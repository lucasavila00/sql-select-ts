import { Compound } from "./classes/compound";
import { Joined } from "./classes/joined";
import { SelectStatement } from "./classes/select-statement";
import { Table } from "./classes/table";

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

export type NoSelectFieldsCompileError = {
    ["✕"]: CompileError<["'.select(f => f)' is invalid"]>;
};
export interface CompileError<ErrorMessageT extends any[]> {
    /**
     * There should never be a value of this type
     */
    readonly __compileError: never;
}
