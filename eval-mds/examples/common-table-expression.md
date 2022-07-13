```ts eval --out=md --hide
import { exampleHeader } from "./ts-utils";
exampleHeader("With", 20);
```

# With - Common Table Expressions

```ts eval
import {
    table,
    dsql as sql,
    with_,
    SafeString,
    select,
    withR,
} from "../../src";
```

```ts eval
const orders = table(["region", "amount", "product", "quantity"], "orders");

const SUM = (it: SafeString): SafeString => sql`SUM(${it})`;
```

```ts eval --out=sql
with_(
    "regional_sales",
    select(
        (f) => ({ region: f.region, total_sales: SUM(f.amount) }),
        orders
    ).groupBy(["region"])
)
    .with_("top_regions", (acc) =>
        select(["region"], acc.regional_sales).where(
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
                    sql`${f.region} IN ${select(["region"], acc.top_regions)}`
            )
            .groupBy(["region", "product"])
    )
    .stringify();
```

## Replacing column names

```ts eval --out=sql
withR(
    "regional_sales",
    ["region2", "total_sales2"],
    select(
        (f) => ({ region: f.region, total_sales: SUM(f.amount) }),
        orders
    ).groupBy(["region"])
)
    .withR("top_regions", ["region3"], (acc) =>
        select(["region2"], acc.regional_sales).where(
            (f) =>
                sql`${f.total_sales2} > ${select(
                    (f) => ({ it: sql`SUM(${f.total_sales2})/10` }),
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
                    sql`${f.region} IN ${select(["region3"], acc.top_regions)}`
            )
            .groupBy(["region", "product"])
    )
    .stringify();
```
