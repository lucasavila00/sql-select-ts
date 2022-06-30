/**
 * Typescript helpers.
 *
 * @since 0.0.0
 */
import { Compound } from "./classes/compound";
import { SelectStatement } from "./classes/select-statement";

/**
 * @since 0.0.1
 */
export type AnyStringifyable = SelectStatement<any, any> | Compound<any, any>;

/**
 * Given a stringifyable object, returns the union of the selection keys.
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
 * @since 0.0.1
 */
export type SelectionOf<T extends AnyStringifyable> = T extends SelectStatement<
    any,
    infer S
>
    ? S
    : T extends Compound<any, infer S2>
    ? S2
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
 * @since 0.0.1
 */
export type RowOf<T extends AnyStringifyable> = RowOfSel<SelectionOf<T>>;

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
 * @since 0.0.1
 */
export type RowsArray<T extends AnyStringifyable> = RowOfSel<SelectionOf<T>>[];
