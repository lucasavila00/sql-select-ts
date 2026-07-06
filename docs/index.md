---
title: Home
nav_order: 1
layout: home
---

A modern, database-agnostic, composable SELECT query builder with great typescript support.

# Install

Install from npm

```
npm i sql-select-ts
```

# Getting started

Check out the [examples](/sql-select-ts/examples/getting-started.html).

# Features

## Safe string interpolation with template literals

```ts
const userInput = "SomeName";
const myString = sql`column = ${userInput}`;
// Prints:
// column = 'SomeName'

const userInput = 123;
const myString = sql`column = ${userInput}`;
// Prints:
// column = 123

const userInput = "';";
const myString = sql`column = ${userInput}`;
// Prints:
// column = '\';'
```

## Typescript-friendly builders

Provides typed query-builder objects and ergonomic field access, without tracking concrete identifier names.

```ts
const t1 = table(/* columns: */ ["a", "b", "c"], /* db-name & alias: */ "t1");
const t2 = table(/* columns: */ ["b", "c", "d"], /* db-name & alias: */ "t2");
t1.join("NATURAL", t2)
    .using(["b"])
    .select((f) => ({
        z: f["t1.c"],
    }));
```

## Composable

```ts
const users = table(["id", "age", "name"], "users");
const admins = table(["id", "age", "name"], "adm", "admins");
const analytics = table(["id", "clicks"], "analytics");

users
    .join("LEFT", admins)
    .on((f) => equals(f.adm.id, f.users.id))
    .join("LEFT", analytics)
    .on((f) => equals(f.analytics.id, f.users.id))
    .selectStar()
    .stringify();
```

## 0 dependencies

## Database agnostic

### Usage with sqlite

Check out the [examples](/sql-select-ts/examples/sqlite-usage.html).

### Usage with Clickhouse

Check out the [examples](/sql-select-ts/examples/clickhouse-usage.html).
