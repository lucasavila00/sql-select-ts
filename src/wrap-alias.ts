const ID_GLOBAL_REGEXP = /`/g;
export const wrapAlias = (alias: string) =>
    "`" + alias.replace(ID_GLOBAL_REGEXP, "``") + "`";

export const wrapAliasSplitDots = (alias: string) =>
    alias.split(".").map(wrapAlias).join(".");
