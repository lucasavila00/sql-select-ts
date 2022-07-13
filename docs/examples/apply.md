---
title: Apply
nav_order: 90
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
import { table, dsql as sql, select } from "sql-select-ts";
import { SelectStatement } from "sql-select-ts/classes/select-statement";
```

# Apply

Allows to use a helper function but still keep method chaining.

```ts
// It expects a select statement that has selected a "sector" field,
// which will be used as the "group by"
const groupSortLimit = (query: SelectStatement<never, "sector">) =>
  query
    .groupBy(/* f: */ (f) => f.sector)
    .orderBy(/* f: */ (_f) => sql`count() DESC`)
    .limit(/* limit: */ 250);
const sector_stats = table(
  /* columns: */ ["id", "sector", "price"],
  /* alias: */ "sector_stats"
);
select(/* fields: */ /* f: */ ["sector"], /* from: */ /* from: */ sector_stats)
  .apply(/* fn: */ groupSortLimit)
  .stringify();
```

```sql
SELECT
  `sector` AS `sector`
FROM
  `sector_stats`
GROUP BY
  `sector`
ORDER BY
  count() DESC
LIMIT
  250
```

---

This document used [eval-md](https://lucasavila00.github.io/eval-md/)