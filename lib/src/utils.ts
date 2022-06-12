import { NonEmptyArray } from "./types";

export const makeArray = <T>(it: T | T[]): T[] => {
    if (Array.isArray(it)) {
        return it;
    }
    return [it];
};

export const makeNonEmptyArray = <T>(it: T | T[]): NonEmptyArray<T> => {
    if (Array.isArray(it)) {
        if (it.length === 0) {
            throw new Error(
                "Cannot create a non-empty array from an empty array"
            );
        }
        return it as NonEmptyArray<T>;
    }
    return [it];
};

export const absurd = <A>(_: never): A => {
    throw new Error("Called `absurd` function which should be uncallable");
};
export const hole = <T>(): T => {
    throw new Error("Called `hole` function which should be uncallable");
};
