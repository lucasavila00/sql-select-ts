```ts eval --out=md --hide
import { exampleHeader } from "./ts-utils";
exampleHeader("Getting Started", 0);
```

# Getting started

```ts eval
import { table, dsql as sql, SafeString } from "../../src";
```

Construct a table instance

```ts eval
const users = table(["id", "age", "name"], "users");
```

Create a query

```ts eval
const q = users.selectStar();
```

Get the SQL

```ts eval --out=sql
const str = q.stringify();
str;
```

## String interpolation

```ts eval
const q2 = users.select(["age"]).where((fields) => sql`${fields.id}=1`);
```

```ts eval --out=sql
q2.stringify();
```

## String interpolation helpers

```ts eval --out=sql
const eq = (
    a: SafeString | string | number,
    b: SafeString | string | number
): SafeString => sql`${a}=${b}`;

const MAX = (it: SafeString): SafeString => sql`MAX(${it})`;

const q3 = users
    .select((fields) => ({ age: MAX(fields.age) }))
    .where((fields) => eq(fields.id, 1));

q3.stringify();
```

## Composition

```ts eval --out=sql
q.commaJoinSelect("q", "q3", q3).selectStar().stringify();
```
