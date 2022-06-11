export const getEntries = <K extends string | number | symbol, V>(
  obj: Record<K, V>
) => Object.entries(obj) as Array<[K, V]>;

export const getKeys = <T>(obj: T) => Object.keys(obj) as Array<keyof T>;
