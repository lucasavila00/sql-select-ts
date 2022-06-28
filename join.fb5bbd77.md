We will use these tables

```sql
CREATE TABLE users(id int, age int, name string);
CREATE TABLE admins(id int, age int, name string);
CREATE TABLE analytics(id int, clicks int);
```

Which are defined in typescript as

```ts
const users = table(
  /* columns: */ ["id", "age", "name"],
  /* db-name & alias: */ "users"
);

const admins = table(
  /* columns: */ ["id", "age", "name"],
  /* alias: */ "adm",
  /* db-name: */ "admins"
);

const analytics = table(
  /* columns: */ ["id", "clicks"],
  /* db-name & alias: */ "analytics"
);
```

We also need a helper function that constructs SafeStrings

```ts
const equals = (
  a: SafeString | number | string,
  b: SafeString | number | string
): SafeString => sql`${a} = ${b}`;
```

# ON

## Join Table

{% printer %}

```ts
users
  .joinTable("LEFT", admins)
  .on((f) =>
    equals(f["adm.id"], f["users.id"])
  )
  .selectStar()
  .stringify();
```

{% /printer %}

## Join Select

{% printer %}

```ts
admins
  .joinSelect(
    "u",
    "LEFT",
    users.selectStar()
  )
  .on((f) =>
    equals(f["u.id"], f["adm.id"])
  )
  .selectStar()
  .stringify();
```

{% /printer %}

## Join Compound

TODO

## Join 3 Tables

{% printer %}

```ts
users
  .joinTable("LEFT", admins)
  .on((f) =>
    equals(f["adm.id"], f["users.id"])
  )
  .joinTable("LEFT", analytics)
  .on((f) =>
    equals(
      f["analytics.id"],
      f["users.id"]
    )
  )
  .selectStar()
  .stringify();
```

{% /printer %}

## Join 3 Selects

{% printer %}

```ts
const userAndAdmin = users
  .selectStar()
  .joinSelect(
    "users",
    "LEFT",
    "admins",
    admins.selectStar()
  )
  .on((f) =>
    equals(
      f["admins.id"],
      f["users.id"]
    )
  );

const userAdminAnalytics = userAndAdmin
  .joinSelect(
    "LEFT",
    "analyitcs",
    analytics.selectStar()
  )
  .on((f) =>
    equals(
      f["analytics.id"],
      f["users.id"]
    )
  );

userAdminAnalytics
  .selectStar()
  .stringify();
```

{% /printer %}

# USING

TODO

# No Constraint

TODO

# Comma Join

TODO
