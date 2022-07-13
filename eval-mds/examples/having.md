```ts eval --out=md --hide
import { exampleHeader } from "./ts-utils";
exampleHeader("Having", 20);
```

```ts eval
import { table } from "../../src";
```

We will use this table

```sql
CREATE TABLE t0(x INTEGER, y INTEGER)
```

Which is defined in typescript as

```ts eval
const t0 = table(["x", "y"], "t0");
```

# One Clause

```ts eval --out=sql
t0.selectStar()
    .groupBy((f) => f.x)
    .having((f) => f.x)
    .stringify();
```

## From Select

```ts eval --out=sql
t0.select((f) => ({ it: f.x }))
    .groupBy((f) => f.y)
    .having((f) => f.y)
    .stringify();
```

# Two Clauses

## In two calls

```ts eval --out=sql
t0.selectStar()
    .groupBy((f) => f.x)
    .having((f) => f.x)
    .groupBy((f) => f.y)
    .having((f) => f.y)
    .stringify();
```

```ts eval --out=sql
t0.selectStar()
    .groupBy(["x"])
    .having(["x"])
    .groupBy(["y"])
    .having(["y"])
    .stringify();
```

## In one call

```ts eval --out=sql
t0.selectStar()
    .groupBy((f) => [f.x, f.y])
    .having((f) => [f.x, f.y])
    .stringify();
```

```ts eval --out=sql
t0.selectStar().groupBy(["x", "y"]).having(["x", "y"]).stringify();
```
