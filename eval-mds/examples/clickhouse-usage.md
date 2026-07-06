```ts eval --out=md --hide
import { exampleHeader } from "./ts-utils";
exampleHeader("Clickhouse Usage", 80);
```

```ts eval
const ClickHouse = require("@apla/clickhouse");
import { table } from "../../src";
```

With a DB connector

```ts eval
const db = new ClickHouse({
    host: "localhost",
    port: 8124,
    user: "default",
    password: "",
    dataObjects: true,
});

const runS = async (q: string): Promise<any[]> =>
    db.querying(q).then((it: any) => it.data);
```

We can implement a small runner for printable queries

```ts eval
const run = (it: { stringify: () => string }): Promise<any[]> =>
    runS(it.stringify());
```

Then, with some tables

```ts eval --out=hide
const t1 = table(["x", "y"], "t1");
await runS(`DROP TABLE IF EXISTS t1`);
await runS(`CREATE TABLE IF NOT EXISTS t1(x Int64, y Int64) ENGINE = Memory`);
await runS(`INSERT INTO t1 VALUES(1,2)`);
```

We can run queries

```ts eval
const value = await run(t1.selectStar());
value;
```

The query builder keeps the SQL syntax ergonomic

```ts eval --out=hide
value.map((it) => it.x);
```
