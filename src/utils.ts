export const wrapAlias = (alias: string) => {
    if (alias[0].charCodeAt(0) >= 48 && alias[0].charCodeAt(0) <= 57) {
        return `\`${alias}\``;
    }
    if (alias.includes(" ")) {
        return `\`${alias}\``;
    }
    return alias;
};

export const makeArray = <T>(it: T | T[]): T[] => {
    if (Array.isArray(it)) {
        return it;
    }
    return [it];
};
