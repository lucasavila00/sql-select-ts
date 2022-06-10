export const makeArray = <T>(it: T | T[]): T[] => {
    if (Array.isArray(it)) {
        return it;
    }
    return [it];
};
