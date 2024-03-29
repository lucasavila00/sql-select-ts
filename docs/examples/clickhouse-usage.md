---
title: Clickhouse Usage
nav_order: 80
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

```ts
const ClickHouse = require("@apla/clickhouse");
import { table, AnyPrintable, RowsArray } from "../../src";
```

With a DB connector

```ts
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

```ts
const run = <T extends AnyPrintable>(it: T): Promise<RowsArray<T>> =>
    runS(it.stringify());
```

Then, with some tables

```ts
const t1 = table(["x", "y"], "t1");
await runS(`DROP TABLE IF EXISTS t1`);
await runS(`CREATE TABLE IF NOT EXISTS t1(x Int64, y Int64) ENGINE = Memory`);
await runS(`INSERT INTO t1 VALUES(1,2)`);
```

We can run queries

```ts
const value = await run(t1.selectStar());
value;
```

```json
[{ "x": "1", "y": "2" }]
```

Typescript knows the identifiers

```ts
value.map((it) => it.x);
```

```ts
//@ts-expect-error
value.map((it) => it.u);
```

---

This document used [eval-md](https://lucasavila00.github.io/eval-md/)