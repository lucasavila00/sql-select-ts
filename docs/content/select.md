# Examples

## Table definition

First, create the table definitions.

```ts
const users = table(
  ["id", "age", "name"],
  "users"
);
```

## Select

### Select star

{% printer %}

```ts
users.selectStar().print();
```

{% /printer %}

### Select a field

{% printer %}

```ts
users
  .select((f) => ({ name: f.name }))
  .print();
```

{% /printer %}

### Select star and a field

{% printer %}

```ts
users
  .selectStar()
  .appendSelect((f) => ({
    otherAlias: f.name,
  }))
  .print();
```

{% /printer %}

### Select a field and star

{% printer %}

```ts
users
  .select((f) => ({
    otherAlias: f.name,
  }))
  .appendSelectStar()
  .print();
```

{% /printer %}

### Select from sub-select

{% printer %}

```ts
users
  .selectStar()
  .select((f) => ({ age: f.age }))
  .print();
```

{% /printer %}

### Kitchen sink

{% printer %}

```ts
const plus50Users = users
  .selectStar()
  .where((f) => sql`${f.age} > 50`);

plus50Users
  .select((f) => ({ name: f.name }))
  .distinct()
  .orderBy((f) => f.age)
  .limit(2)
  .print();
```

{% /printer %}
