import sqlite from "sqlite3";
import ClickHouse from "@apla/clickhouse";

export const configureSqlite = (): {
    db: sqlite.Database;
    run: (query: string) => Promise<any[]>;
    fail: (query: string) => Promise<string>;
} => {
    const it = sqlite.verbose();
    const db = new it.Database(":memory:");

    const run = (q: string) =>
        new Promise<any[]>((rs, rj) =>
            db.all(q, (e, r) => (e ? rj(e) : rs(r)))
        );

    const fail = (q: string) =>
        new Promise<string>((rs, rj) =>
            db.all(q, (e, r) =>
                e ? rs(String(e)) : rj(`Expected error, got ${r}`)
            )
        );

    return {
        db,
        fail,
        run,
    };
};

export const configureClickhouse = (): {
    db: ClickHouse;
    run: (query: string) => Promise<any[]>;
    fail: (query: string) => Promise<string>;
} => {
    const db = new ClickHouse({
        host: "localhost",
        port: 8124,
        user: "default",
        password: "",
    });

    const run = async (q: string): Promise<any[]> =>
        db.querying(q).then((it) => it.data);

    const fail = async (q: string): Promise<string> =>
        db
            .querying(q)
            .then((r) => r.data)
            .then((r) => Promise.reject(`Expected error, got ${r}`))
            .catch((e) => String(e));

    return {
        db,
        fail,
        run,
    };
};

export const addSimpleStringSerializer = () =>
    expect.addSnapshotSerializer({
        test: (val) => typeof val === "string",
        print: (val: unknown): string => String(val),
    });
