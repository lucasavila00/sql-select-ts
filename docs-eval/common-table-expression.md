---
title: With
nav_order: 29
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

# With - Common Table Expressions

```ts eval --replacePrintedInput=../src,sql-select-ts
import { table, dsql as sql, with_, SafeString, select } from "../src";
```

```ts eval
const orders = table(["region", "amount", "product", "quantity"], "orders");

const SUM = (it: SafeString): SafeString => sql`SUM(${it})`;
```

# Specifying columns

```ts eval --yield=sql
yield with_(
    "regional_sales",
    select(
        (f) => ({ region: f.region, total_sales: SUM(f.amount) }),
        orders
    ).groupBy((f) => f.region)
)
    .with_("top_regions", (acc) =>
        select(
            (f) => ({
                region: f.region,
            }),
            acc.regional_sales
        ).where(
            (f) =>
                sql`${f.total_sales} > ${select(
                    (f) => ({ it: sql`SUM(${f.total_sales})/10` }),
                    acc.regional_sales
                )}`
        )
    )
    .do((acc) =>
        select(
            (f) => ({
                region: f.region,
                product: f.product,
                product_units: SUM(f.quantity),
                product_sales: SUM(f.amount),
            }),
            orders
        )
            .where(
                (f) =>
                    sql`${f.region} IN ${select(
                        (f) => ({ region: f.region }),
                        acc.top_regions
                    )}`
            )
            .groupBy((f) => [f.region, f.product])
    )
    .stringify();
```
