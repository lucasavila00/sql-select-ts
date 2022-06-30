---
title: SQLite Usage
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
import sqlite from "sqlite3";
import { table, AnyStringifyable, RowsArray } from "../src";
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

We can implement a version that is aware of the types

```ts eval
const run = <T extends AnyStringifyable>(it: T): Promise<RowsArray<T>> =>
    runS(it.stringify());
```

Then, with some tables

```ts eval
const t1 = table(["a", "b", "c"], "t1");
await runS(`CREATE TABLE t1(a,b,c);`);
await runS(`INSERT INTO t1 VALUES(1,2,3);`);
```

We can run queries

```ts eval --yield=json
const value = await run(t1.selectStar());
yield value;
```

Typescript knows the identifiers

```ts eval --yield=json
yield value.map((it) => it.a);
```

```ts eval
//@ts-expect-error
value.map((it) => it.u);
```
