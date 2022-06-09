import sqlite from "sqlite3";

export const configureSqlite = (): {
    db: sqlite.Database;
    run: (query: string) => Promise<any[]>;
    fail: (query: string) => Promise<string>;
} => {
    const it = sqlite.verbose();
    const db = new it.Database(":memory:");

    const run = (it: string) =>
        new Promise<any[]>((rs, rj) =>
            db.all(it, (e, r) => (e ? rj(e) : rs(r)))
        );

    const fail = (it: string) =>
        new Promise<string>((rs, rj) =>
            db.all(it, (e, r) =>
                e ? rs(String(e)) : rj(`Expected error, got ${r}`)
            )
        );

    return {
        db,
        fail,
        run,
    };
};
