```ts eval --out=md --hide
import { exampleHeader } from "./ts-utils";
exampleHeader("SQLite Usage", 50);
```

```ts eval
import sqlite from "sqlite3";
import { table } from "../../src";
```

With a DB connector

```ts eval
const it = sqlite.verbose();
const db = new it.Database(":memory:");

const runS = (q: string) =>
    new Promise<any[]>((rs, rj) =>
        db.all(q, (e: any, r: any) => (e ? rj(e) : rs(r)))
    );
```

We can implement a small runner for printable queries

```ts eval
const run = (it: { stringify: () => string }): Promise<any[]> =>
    runS(it.stringify());
```

Then, with some tables

```ts eval --out=hide
const t1 = table(["a", "b", "c"], "t1");
await runS(`CREATE TABLE t1(a,b,c);`);
await runS(`INSERT INTO t1 VALUES(1,2,3);`);
```

We can run queries

```ts eval
const value = await run(t1.selectStar());
value;
```

The query builder keeps the SQL syntax ergonomic

```ts eval --out=hide
value.map((it) => it.a);
```
