---
title: SQLite Usage
nav_order: 50
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
import sqlite from "sqlite3";
import { table, AnyStringifyable, RowsArray } from "sql-select-ts";
```

With a DB connector

```ts
const it = sqlite.verbose();
const db = new it.Database(":memory:");
const runS = (q: string) =>
  new Promise<any[]>(
    /* executor: */ (rs, rj) =>
      db.all(
        /* sql: */ q,
        /* callback: */ (e: any, r: any) =>
          e ? rj(/* reason: */ e) : rs(/* value: */ r)
      )
  );
```

We can implement a version that is aware of the types

```ts
const run = <T extends AnyStringifyable>(it: T): Promise<RowsArray<T>> =>
  runS(/* q: */ it.stringify());
```

Then, with some tables

```ts
const t1 = table(/* columns: */ ["a", "b", "c"], /* alias: */ "t1");
await runS(/* q: */ `CREATE TABLE t1(a,b,c);`);
await runS(/* q: */ `INSERT INTO t1 VALUES(1,2,3);`);
```

We can run queries

```ts
const value = await run(/* it: */ t1.selectStar());
value;
```

```json
[{ "a": 1, "b": 2, "c": 3 }]
```

Typescript knows the identifiers

```ts
value.map(/* callbackfn: */ (it) => it.a);
```

```ts
//@ts-expect-error
value.map(/* callbackfn: */ (it) => it.u);
```

---

This document used [eval-md](https://lucasavila00.github.io/eval-md/)