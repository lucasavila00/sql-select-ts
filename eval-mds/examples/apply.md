```ts eval --out=md --hide
import { exampleHeader } from "./ts-utils";
exampleHeader("Apply", 90);
```

```ts eval
import { table, dsql as sql, select } from "../../src";
import { SelectStatement } from "../../src/classes/select-statement";
```

# Apply

Allows to use a helper function but still keep method chaining.

```ts eval --out=sql
// It expects a select statement that has selected a "sector" field,
// which will be used as the "group by"
const groupSortLimit = (query: SelectStatement<never, "sector">) =>
    query
        .groupBy((f) => f.sector)
        .orderBy((_f) => sql`count() DESC`)
        .limit(250);

const sector_stats = table(["id", "sector", "price"], "sector_stats");

select(/* fields: */ ["sector"], /* from: */ sector_stats)
    .apply(groupSortLimit)
    .stringify();
```
