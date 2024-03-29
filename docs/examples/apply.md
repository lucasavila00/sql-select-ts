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
import { table, dsql as sql, select } from "../../src";
import { SelectStatement } from "../../src/classes/select-statement";
```

# Apply

Allows to use a helper function but still keep method chaining.

```ts
// It expects a select statement that has selected a "sector" field,
// which will be used as the "group by"
const groupSortLimit = (query: SelectStatement<"sector", any, any, any>) =>
    query
        .groupBy((f) => f.sector)
        .orderBy((_f) => sql`count() DESC`)
        .limit(250);

const sector_stats = table(["id", "sector", "price"], "sector_stats");

select(/* fields: */ ["sector"], /* from: */ sector_stats)
    .apply(groupSortLimit)
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