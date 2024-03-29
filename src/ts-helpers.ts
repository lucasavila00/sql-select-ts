/**
 * Typescript helpers.
 *
 * @since 2.0.0
 */
import { AliasedCompound, Compound } from "./classes/compound";
import {
    AliasedSelectStatement,
    SelectStatement,
} from "./classes/select-statement";

/**
 * @since 2.0.0
 */
export type AnyPrintable =
    | SelectStatement<any, any, any, any>
    | AliasedSelectStatement<any, any, any, any>
    | Compound<any, any, any, any>
    | AliasedCompound<any, any, any, any>;

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
 * @since 2.0.0
 */

export type SelectionOf<T extends AnyPrintable> =
    T extends AliasedSelectStatement<infer S, infer _S1, infer _S2, infer _S3>
        ? S
        : T extends AliasedCompound<infer S, infer _S1, infer _S2, infer _S3>
        ? S
        : T extends Compound<infer S, infer _S1, infer _S2, infer _S3>
        ? S
        : T extends SelectStatement<infer S, infer _S1, infer _S2, infer _S3>
        ? S
        : never;

type RowOfSel<T extends string> = {
    [K in T]: string | number | undefined | null;
};

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
 * @since 2.0.0
 */
export type RowOf<T extends AnyPrintable> = RowOfSel<SelectionOf<T>>;

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
 * @since 2.0.0
 */
export type RowsArray<T extends AnyPrintable> = RowOfSel<SelectionOf<T>>[];
