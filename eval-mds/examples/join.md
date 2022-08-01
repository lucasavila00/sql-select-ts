```ts eval --out=md --hide
import { exampleHeader } from "./ts-utils";
exampleHeader("Join", 8);
```

```ts eval
import {
    table,
    SafeString,
    dsql as sql,
    unionAll,
    fromStringifiedSelectStatement,
    castSafe,
} from "../../src";
```

We will use these tables

```sql
CREATE TABLE users(id int, age int, name string);
CREATE TABLE admins(id int, age int, name string);
CREATE TABLE analytics(id int, clicks int);
```

Which are defined in typescript as

```ts eval
const users = table(["id", "age", "name"], "users");

const admins = table(["id", "age", "name"], "adm", "admins");

const analytics = table(["id", "clicks"], "analytics");
```

We also need a helper function that constructs SafeStrings

```ts eval
const equals = (
    a: SafeString | number | string,
    b: SafeString | number | string
): SafeString => sql`${a} = ${b}`;
```

# ON

## Join Table

```ts eval --out=sql
users
    .join("LEFT", admins)
    .on((f) => equals(f.adm.id, f.users.id))
    .selectStar()
    .stringify();
```

## Join Select

```ts eval --out=sql
admins
    .join("LEFT", users.selectStar().as("u"))
    .on((f) => equals(f.u.id, f.adm.id))
    .selectStar()
    .stringify();
```

## Join Stringified Select

```ts eval --out=sql
const aQueryThatIsAString = users.selectStar().stringify();

const usersStringifiedQuery = fromStringifiedSelectStatement<
    "id" | "age" | "name"
>(castSafe(aQueryThatIsAString));

admins
    .join("LEFT", usersStringifiedQuery.as("u"))
    .on((f) => equals(f.u.id, f.adm.id))
    .selectStar()
    .stringify();
```

## Join Compound

```ts eval --out=sql
admins
    .join(
        "LEFT",
        unionAll([
            users.selectStar().where((f) => sql`${f.id} = 1`),
            users.selectStar().where((f) => sql`${f.id} = 2`),
        ]).as("u")
    )
    .on((f) => equals(f.u.id, f.adm.id))
    .selectStar()
    .stringify();
```

## Join 3 Tables

```ts eval --out=sql
users
    .join("LEFT", admins)
    .on((f) => equals(f.adm.id, f.users.id))
    .join("LEFT", analytics)
    .on((f) => equals(f.analytics.id, f.users.id))
    .selectStar()
    .stringify();
```

## Join 3 Selects

```ts eval --out=sql
const userAndAdmin = users
    .selectStar()
    .as("users")
    .join("LEFT", admins.selectStar().as("admins"))
    .on((f) => equals(f.admins.id, f.users.id));

const userAdminAnalytics = userAndAdmin
    .join("LEFT", analytics.selectStar().as("analytics"))
    .on((f) => equals(f.analytics.id, f.users.id));

userAdminAnalytics.selectStar().stringify();
```

# USING

## Join Table

```ts eval --out=sql
users.join("LEFT", admins).using(["id"]).selectStar().stringify();
```

## Join Select

```ts eval --out=sql
admins
    .join("LEFT", users.selectStar().as("u"))
    .using(["id"])
    .selectStar()
    .stringify();
```

# No Constraint

## Join Table

```ts eval --out=sql
users.join("NATURAL", admins).noConstraint().selectStar().stringify();
```

## Join Select

```ts eval --out=sql
admins
    .join("NATURAL", users.selectStar().as("u"))
    .noConstraint()
    .selectStar()
    .stringify();
```

# Comma Join

## Join Table

```ts eval --out=sql
users.commaJoin(admins).selectStar().stringify();
```

## Join Select

```ts eval --out=sql
admins.commaJoin(users.selectStar().as("u")).selectStar().stringify();
```

## Join Compound

```ts eval --out=sql
admins
    .commaJoin(
        unionAll([
            users.selectStar().where((f) => sql`${f.id} = 1`),
            users.selectStar().where((f) => sql`${f.id} = 2`),
        ]).as("u")
    )
    .selectStar()
    .stringify();
```

## Join 3 Tables

```ts eval --out=sql
users.commaJoin(admins).commaJoin(analytics).selectStar().stringify();
```

## Join 3 Selects

```ts eval --out=sql
const userAndAdmin2 = users
    .selectStar()
    .as("users")
    .commaJoin(admins.selectStar().as("admins"));

const userAdminAnalytics2 = userAndAdmin2.commaJoin(
    analytics.selectStar().as("analytics")
);

userAdminAnalytics2.selectStar().stringify();
```
