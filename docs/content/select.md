# Select

#### Tables

```sql
CREATE TABLE users(id int, age int, name string);
CREATE TABLE admins(id int, age int, name string);
```

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
admins
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
admins
  .select((f) => ({
    otherAlias: f["adm.name"],
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
  .selectStar()
  .print();
```

{% /printer %}

### Select from union

{% printer %}

```ts
unionAll([
  users.selectStar(),
  admins.selectStar(),
])
  .select((f) => ({ age: f.age }))
  .print();
```

{% /printer %}

### Select from join

{% printer %}

```ts
users
  .joinTable("LEFT", admins)
  .using(["id"])
  .select((f) => ({
    userName: f["users.name"],
    admName: f["adm.name"],
  }))
  .print();
```

{% /printer %}

### Control order of selection

Although it works on most cases, order of selection is not guaranteed.

{% printer %}

```ts
users
  .select((f) => ({
    abc: f.name,
    def: f.id,
  }))
  .print();
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
  .print();
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
  .print();
```

{% /printer %}
