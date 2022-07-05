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

```ts
import { table, dsql as sql, with_, SafeString, select } from "sql-select-ts";
```

```ts
const orders = table(["region", "amount", "product", "quantity"], "orders");

const SUM = (it: SafeString): SafeString => sql`SUM(${it})`;
```

# Specifying columns

```ts
with_(
  select(
    (f) => ({
      region: f.region,
      total_sales: SUM(f.amount),
    }),
    orders
  ).groupBy((f) => f.region),
  "regional_sales"
)
  .with_(
    (acc) =>
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
      ),
    "top_regions"
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

```sql
WITH
  regional_sales AS (
    SELECT
      `region` AS `region`,
      SUM(`amount`) AS `total_sales`
    FROM
      `orders`
    GROUP BY
      `region`
  ),
  top_regions AS (
    SELECT
      `region` AS `region`
    FROM
      `regional_sales`
    WHERE
      `total_sales` > (
        SELECT
          SUM(`total_sales`) / 10 AS `it`
        FROM
          `regional_sales`
      )
  )
SELECT
  `region` AS `region`,
  `product` AS `product`,
  SUM(`quantity`) AS `product_units`,
  SUM(`amount`) AS `product_sales`
FROM
  `orders`
WHERE
  `region` IN (
    SELECT
      `region` AS `region`
    FROM
      `top_regions`
  )
GROUP BY
  `region`,
  `product`
```
