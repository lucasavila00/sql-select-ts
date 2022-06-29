---
title: classes/table.ts
nav_order: 5
parent: Classes
layout: default
grand_parent: Modules
---

## table overview

Represents a table in the database.
It stores type information of the table Alias and Selection.
It also stores the table name and the alias.

Added in v0.0.0

---

<h2 class="text-delta">Table of contents</h2>

-   [utils](#utils)
    -   [Table (class)](#table-class)
        -   [clickhouse (property)](#clickhouse-property)
        -   [select (property)](#select-property)
        -   [selectStar (property)](#selectstar-property)
        -   [commaJoinTable (property)](#commajointable-property)
        -   [joinTable (property)](#jointable-property)
        -   [commaJoinSelect (property)](#commajoinselect-property)
        -   [joinSelect (property)](#joinselect-property)
        -   [commaJoinCompound (property)](#commajoincompound-property)
        -   [joinCompound (property)](#joincompound-property)

---

# utils

## Table (class)

Represents a table in the database.
It stores type information of the table Alias and Selection.
It also stores the table name and the alias.

This class is not meant to be used directly, but rather through the `table` function.

**Signature**

```ts
export declare class Table<Selection, Alias> {
    private constructor(
        /* @internal */
        public __props: {
            columns: string[];
            alias: string;
            name: string;
            final: boolean;
        }
    );
}
```

Added in v0.0.0

### clickhouse (property)

**Signature**

```ts
clickhouse: { final: () => Table<Selection, Alias>; }
```

Added in v0.0.0

### select (property)

**Signature**

```ts
select: <NewSelection extends string>(f: (f: Record<Selection | `${Alias}.${Selection}`, SafeString> & NoSelectFieldsCompileError) => Record<NewSelection, SafeString>) => SelectStatement<Selection | `${Alias}.${Selection}`, NewSelection>
```

Added in v0.0.0

### selectStar (property)

**Signature**

```ts
selectStar: () => SelectStatement<Selection | `${Alias}.${Selection}`, Selection>
```

Added in v0.0.0

### commaJoinTable (property)

**Signature**

```ts
commaJoinTable: <Selection2 extends string, Alias2 extends string>(table: Table<Selection2, Alias2>) => Joined<`${Alias}.${Selection}` | Exclude<Selection, Selection2> | Exclude<Selection2, Selection> | `${Alias2}.${Selection2}`, Alias | Alias2, Extract<Selection2, Selection>>
```

Added in v0.0.0

### joinTable (property)

**Signature**

```ts
joinTable: <Selection2 extends string, Alias2 extends string>(operator: string, table: Table<Selection2, Alias2>) => JoinedFactory<`${Alias}.${Selection}` | Exclude<Selection, Selection2> | Exclude<Selection2, Selection> | `${Alias2}.${Selection2}`, Alias | Alias2, Extract<Selection2, Selection>, Extract<Selection2, Selection>>
```

Added in v0.0.0

### commaJoinSelect (property)

**Signature**

```ts
commaJoinSelect: <Scope2 extends string, Selection2 extends string, Alias2 extends string>(selectAlias: Alias2, select: SelectStatement<Scope2, Selection2>) => Joined<`${Alias}.${Selection}` | Exclude<Selection, Selection2> | Exclude<Selection2, Selection> | `${Alias2}.${Selection2}`, Alias | Alias2, Extract<Selection2, Selection>>
```

Added in v0.0.0

### joinSelect (property)

**Signature**

```ts
joinSelect: <Scope2 extends string, Selection2 extends string, Alias2 extends string>(selectAlias: Alias2, operator: string, select: SelectStatement<Scope2, Selection2>) => JoinedFactory<`${Alias}.${Selection}` | Exclude<Selection, Selection2> | Exclude<Selection2, Selection> | `${Alias2}.${Selection2}`, Alias | Alias2, Extract<Selection2, Selection>, Extract<Selection2, Selection>>
```

Added in v0.0.0

### commaJoinCompound (property)

**Signature**

```ts
commaJoinCompound: <Selection2 extends string, Alias2 extends string>(compoundAlias: Alias2, compound: Compound<Selection2, Selection2>) => Joined<`${Alias}.${Selection}` | Exclude<Selection, Selection2> | Exclude<Selection2, Selection> | `${Alias2}.${Selection2}`, Alias | Alias2, Extract<Selection2, Selection>>
```

Added in v0.0.0

### joinCompound (property)

**Signature**

```ts
joinCompound: <Selection2 extends string, Alias2 extends string>(compoundAlias: Alias2, operator: string, compound: Compound<Selection2, Selection2>) => JoinedFactory<`${Alias}.${Selection}` | Exclude<Selection, Selection2> | Exclude<Selection2, Selection> | `${Alias2}.${Selection2}`, Alias | Alias2, Extract<Selection2, Selection>, Extract<Selection2, Selection>>
```

Added in v0.0.0
