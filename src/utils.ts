import { ReadOnlyNonEmptyArray } from "./types";

export const makeArray = <T>(it: T | ReadonlyArray<T>): ReadonlyArray<T> => {
    if (Array.isArray(it)) {
        return it;
    }
    // @ts-expect-error - readonly array is array
    return [it];
};

export const makeNonEmptyArray = <T>(
    it: T | ReadonlyArray<T>
): ReadOnlyNonEmptyArray<T> => {
    if (Array.isArray(it)) {
        if (it.length === 0) {
            throw new Error(
                "Cannot create a non-empty array from an empty array"
            );
        }
        return it as any as ReadOnlyNonEmptyArray<T>;
    }
    // @ts-expect-error - readonly array is array
    return [it];
};

export const absurd = <A>(_: never): A => {
    throw new Error("Called `absurd` function which should be uncallable");
};
export const hole = <T>(): T => {
    throw new Error("Called `hole` function which should be uncallable");
};
