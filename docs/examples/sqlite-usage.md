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
import { table } from "../../src";
```

With a DB connector

```ts
const it = sqlite.verbose();
const db = new it.Database(":memory:");

const runS = (q: string) =>
    new Promise<any[]>((rs, rj) =>
        db.all(q, (e: any, r: any) => (e ? rj(e) : rs(r)))
    );
```

We can implement a small runner for printable queries

```ts
const run = (it: { stringify: () => string }): Promise<any[]> =>
    runS(it.stringify());
```

Then, with some tables

```ts
const t1 = table(["a", "b", "c"], "t1");
await runS(`CREATE TABLE t1(a,b,c);`);
await runS(`INSERT INTO t1 VALUES(1,2,3);`);
```

We can run queries

```ts
const value = await run(t1.selectStar());
value;
```

```json
[{ "a": 1, "b": 2, "c": 3 }]
```

The query builder keeps the SQL syntax ergonomic

```ts
value.map((it) => it.a);
```

---

This document used [eval-md](https://lucasavila00.github.io/eval-md/)
