```ts eval --out=md --hide
import { exampleHeader } from "./ts-utils";
exampleHeader("Clickhouse Extensions", 70);
```

```ts eval --replacePrintedInput=../src,sql-select-ts
import { table, dsql as sql, fromStringifiedSelectStatement } from "../../src";
```

# Final Table

```ts eval --out=sql
const chTableRegular = table(["col1", "col2"], "tableName");
chTableRegular.selectStar().stringify();
```

```ts eval --out=sql
const chTableFinal = chTableRegular.clickhouse.final();
chTableFinal.selectStar().stringify();
```

```ts eval --out=sql
table(["col1", "col2"], "alias", "tableName")
    .clickhouse.final()
    .selectStar()
    .stringify();
```

# Prewhere

The API is like WHERE's.

```ts eval --out=sql
chTableFinal
    .selectStar()
    .where((f) => f.col2)
    .clickhouse.prewhere((f) => f.col1)
    .stringify();
```

```ts eval --out=sql
chTableFinal
    .selectStar()
    .clickhouse.prewhere((f) => f.col1)
    .clickhouse.prewhere((f) => f.col2)
    .where((f) => f.col2)
    .stringify();
```

# Replace

```ts eval --out=sql
chTableRegular
    .selectStar()
    .clickhouse.replace((f) => [["col1", sql`${f.col1}+1`]])
    .stringify();
```

# With (Non CTE)

Alongside Common Table Expressions, Clickhouse's syntax extension of WITH is also supported.

```ts eval --out=sql
chTableRegular
    .select((f) => ({
        res1: f.col1,
    }))
    .clickhouse.with_({
        abc: chTableFinal.select((_f) => ({ count: sql`COUNT()` })),
    })
    .appendSelect((f) => ({ res2: sql`${f.col2} + ${f.abc}` }))
    .stringify();
```

```ts eval --out=sql
chTableRegular
    .select((f) => ({
        res1: f.col1,
    }))
    .clickhouse.with_({
        abc: fromStringifiedSelectStatement(sql`20`),
    })
    .appendSelect((f) => ({ res2: sql`${f.col2} + ${f.abc}` }))
    .stringify();
```
