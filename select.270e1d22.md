# From Nothing

## Select

{% printer %}

```ts
fromNothing({
  it: sql`system.tables`,
  abc: sql`123 + 456`,
}).stringify();
```

{% /printer %}

## Append Select

{% printer %}

```ts
fromNothing({
  it: sql`system.tables`,
  abc: sql(123),
})
  .appendSelect((f) => ({
    def: sql`${f.abc} + 456`,
  }))
  .stringify();
```

{% /printer %}

# From Tables

We will use these tables

```sql
CREATE TABLE users(id int, age int, name string);
CREATE TABLE admins(id int, age int, name string);
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
```

## Select star

{% printer %}

```ts
users.selectStar().stringify();
```

{% /printer %}

## Select a field

{% printer %}

```ts
admins
  .select((f) => ({ name: f.name }))
  .stringify();
```

{% /printer %}

## Select distinct

{% printer %}

```ts
admins
  .select((f) => ({ name: f.name }))
  .distinct()
  .stringify();
```

{% /printer %}

## Select star and a field

{% printer %}

```ts
users
  .selectStar()
  .appendSelect((f) => ({
    otherAlias: f.name,
  }))
  .stringify();
```

{% /printer %}

## Select a field and star

{% printer %}

```ts
admins
  .select((f) => ({
    otherAlias: f["adm.name"],
  }))
  .appendSelectStar()
  .stringify();
```

{% /printer %}

## Select from sub-select

{% printer %}

```ts
users
  .selectStar()
  .select((f) => ({ age: f.age }))
  .selectStar()
  .stringify();
```

{% /printer %}

## Select from union

{% printer %}

```ts
unionAll([
  users.selectStar(),
  admins.selectStar(),
])
  .select((f) => ({ age: f.age }))
  .stringify();
```

{% /printer %}

## Select from join

{% printer %}

```ts
users
  .joinTable("LEFT", admins)
  .using(["id"])
  .select((f) => ({
    userName: f["users.name"],
    admName: f["adm.name"],
  }))
  .stringify();
```

{% /printer %}

# Don't select the fields object directly

TODO

# Alias of sub-selection

It shows up on the codebase as `main_alias`.

TODO

# Control order of selection

Although it works on most cases, order of selection is not guaranteed.

{% printer %}

```ts
users
  .select((f) => ({
    abc: f.name,
    def: f.id,
  }))
  .stringify();
```

{% /printer %}

{% printer %}

```ts
users
  .select((f) => ({
    ["123"]: f.age,
    name: f.name,
    ["456"]: f.id,
  }))
  .stringify();
```

{% /printer %}

To achieve control of the selection order, append each item individually.

{% printer %}

```ts
users
  .select((f) => ({
    ["123"]: f.age,
  }))
  .appendSelect((f) => ({
    name: f.name,
  }))
  .appendSelect((f) => ({
    ["456"]: f.id,
  }))
  .stringify();
```

{% /printer %}
