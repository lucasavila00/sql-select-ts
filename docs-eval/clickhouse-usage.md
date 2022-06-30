---
title: Clickhouse Usage
nav_order: 23
parent: Examples
layout: default
---

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

```ts eval --replacePrintedInput=../src,sql-select-ts
const ClickHouse = require("@apla/clickhouse");
import { table, AnyStringifyable, RowsArray } from "../src";
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

We can implement a version that is aware of the types

```ts eval
const run = <T extends AnyStringifyable>(it: T): Promise<RowsArray<T>> =>
    runS(it.stringify());
```

Then, with some tables

```ts eval
const t1 = table(["x", "y"], "t1");
await runS(`DROP TABLE IF EXISTS t1`);
await runS(`CREATE TABLE IF NOT EXISTS t1(x Int64, y Int64) ENGINE = Memory`);
await runS(`INSERT INTO t1 VALUES(1,2)`);
```

We can run queries

```ts eval --yield=json
const value = await run(t1.selectStar());
yield value;
```

Typescript knows the identifiers

```ts eval --yield=json
yield value.map((it) => it.x);
```

```ts eval
//@ts-expect-error
value.map((it) => it.u);
```
