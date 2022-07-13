---
title: With
nav_order: 20
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
import {
  table,
  dsql as sql,
  with_,
  SafeString,
  select,
  withR,
} from "sql-select-ts";
```

```ts
const orders = table(
  /* columns: */ ["region", "amount", "product", "quantity"],
  /* alias: */ "orders"
);
const SUM = (it: SafeString): SafeString => sql`SUM(${it})`;
```

```ts
with_(
  /* alias: */ "regional_sales",
  /* select: */ select(
    /* f: */ (f) => ({
      region: f.region,
      total_sales: SUM(/* it: */ f.amount),
    }),
    /* from: */ orders
  ).groupBy(/* f: */ ["region"])
)
  .with_(
    /* alias: */ "top_regions",
    /* select: */ (acc) =>
      select(/* f: */ ["region"], /* from: */ acc.regional_sales).where(
        /* f: */ (f) =>
          sql`${f.total_sales} > ${select(
            /* f: */ (f) => ({ it: sql`SUM(${f.total_sales})/10` }),
            /* from: */ acc.regional_sales
          )}`
      )
  )
  .do(
    /* f: */ (acc) =>
      select(
        /* f: */ (f) => ({
          region: f.region,
          product: f.product,
          product_units: SUM(/* it: */ f.quantity),
          product_sales: SUM(/* it: */ f.amount),
        }),
        /* from: */ orders
      )
        .where(
          /* f: */ (f) =>
            sql`${f.region} IN ${select(
              /* f: */ ["region"],
              /* from: */ acc.top_regions
            )}`
        )
        .groupBy(/* f: */ ["region", "product"])
  )
  .stringify();
```

```sql
WITH
  `regional_sales` AS (
    SELECT
      `region` AS `region`,
      SUM(`amount`) AS `total_sales`
    FROM
      `orders`
    GROUP BY
      `region`
  ),
  `top_regions` AS (
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

## Replacing column names

```ts
withR(
  /* alias: */ "regional_sales",
  /* columns: */ ["region2", "total_sales2"],
  /* select: */ select(
    /* f: */ (f) => ({
      region: f.region,
      total_sales: SUM(/* it: */ f.amount),
    }),
    /* from: */ orders
  ).groupBy(/* f: */ ["region"])
)
  .withR(
    /* alias: */ "top_regions",
    /* columns: */ ["region3"],
    /* select: */ (acc) =>
      select(/* f: */ ["region2"], /* from: */ acc.regional_sales).where(
        /* f: */ (f) =>
          sql`${f.total_sales2} > ${select(
            /* f: */ (f) => ({ it: sql`SUM(${f.total_sales2})/10` }),
            /* from: */ acc.regional_sales
          )}`
      )
  )
  .do(
    /* f: */ (acc) =>
      select(
        /* f: */ (f) => ({
          region: f.region,
          product: f.product,
          product_units: SUM(/* it: */ f.quantity),
          product_sales: SUM(/* it: */ f.amount),
        }),
        /* from: */ orders
      )
        .where(
          /* f: */ (f) =>
            sql`${f.region} IN ${select(
              /* f: */ ["region3"],
              /* from: */ acc.top_regions
            )}`
        )
        .groupBy(/* f: */ ["region", "product"])
  )
  .stringify();
```

```sql
WITH
  `regional_sales` (`region2`, `total_sales2`) AS (
    SELECT
      `region` AS `region`,
      SUM(`amount`) AS `total_sales`
    FROM
      `orders`
    GROUP BY
      `region`
  ),
  `top_regions` (`region3`) AS (
    SELECT
      `region2` AS `region2`
    FROM
      `regional_sales`
    WHERE
      `total_sales2` > (
        SELECT
          SUM(`total_sales2`) / 10 AS `it`
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
      `region3` AS `region3`
    FROM
      `top_regions`
  )
GROUP BY
  `region`,
  `product`
```

---

This document used [eval-md](https://lucasavila00.github.io/eval-md/)