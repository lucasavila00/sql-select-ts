---
title: classes/select-statement.ts
nav_order: 4
parent: Modules
---

## select-statement overview

Represents https://www.sqlite.org/syntax/simple-select-stmt.html

Added in v0.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [SelectStatement (class)](#selectstatement-class)
    - [clickhouse (property)](#clickhouse-property)
    - [select (property)](#select-property)
    - [selectStar (property)](#selectstar-property)
    - [appendSelectStar (property)](#appendselectstar-property)
    - [appendSelect (property)](#appendselect-property)
    - [where (property)](#where-property)
    - [having (property)](#having-property)
    - [distinct (property)](#distinct-property)
    - [orderBy (property)](#orderby-property)
    - [groupBy (property)](#groupby-property)
    - [limit (property)](#limit-property)
    - [commaJoinTable (property)](#commajointable-property)
    - [joinTable (property)](#jointable-property)
    - [commaJoinSelect (property)](#commajoinselect-property)
    - [joinSelect (property)](#joinselect-property)
    - [commaJoinCompound (property)](#commajoincompound-property)
    - [joinCompound (property)](#joincompound-property)
    - [print (property)](#print-property)

---

# utils

## SelectStatement (class)

Represents https://www.sqlite.org/syntax/simple-select-stmt.html

This class is not meant to be used directly, but rather through the `fromNothing` function or from a table.

**Signature**

```ts
export declare class SelectStatement<Scope, Selection> {
  private constructor(
    /* @internal */
    public __props: {
      from: TableOrSubquery<any, any, any, any> | null
      selection: SelectionWrapperTypes<Selection>
      orderBy: SafeString[]
      groupBy: SafeString[]
      limit: SafeString | number | null
      where: SafeString[]
      prewhere: SafeString[]
      having: SafeString[]
      distinct: boolean
      clickhouseWith: ClickhouseWith[]
    }
  )
}
```

Added in v0.0.0

### clickhouse (property)

**Signature**

```ts
clickhouse: { with_: <NewSelection extends string>(it: Record<NewSelection, SelectStatement<any, any>>) => SelectStatement<Scope | NewSelection, Selection>; prewhere: (f: (fields: Record<Scope | Selection, SafeString>) => SafeString[] | SafeString) => SelectStatement<Scope, Selection>; }
```

Added in v0.0.0

### select (property)

**Signature**

```ts
select: <NewSelection extends string>(f: (f: Record<Selection | `main_alias.${Selection}`, SafeString> & NoSelectFieldsCompileError) => Record<NewSelection, SafeString>) => SelectStatement<Selection | `main_alias.${Selection}`, NewSelection>
```

Added in v0.0.0

### selectStar (property)

**Signature**

```ts
selectStar: () => SelectStatement<Selection, Selection>
```

Added in v0.0.0

### appendSelectStar (property)

**Signature**

```ts
appendSelectStar: () => SelectStatement<Selection, Selection>
```

Added in v0.0.0

### appendSelect (property)

**Signature**

```ts
appendSelect: <NewSelection extends string>(f: (f: Record<Selection | Scope, SafeString> & NoSelectFieldsCompileError) => Record<NewSelection, SafeString>) => SelectStatement<Scope, Selection | NewSelection>
```

Added in v0.0.0

### where (property)

**Signature**

```ts
where: (f: (fields: Record<Scope | Selection, SafeString>) => SafeString[] | SafeString) => SelectStatement<Scope, Selection>
```

Added in v0.0.0

### having (property)

**Signature**

```ts
having: (f: (fields: Record<Scope | Selection, SafeString>) => SafeString[] | SafeString) => SelectStatement<Scope, Selection>
```

Added in v0.0.0

### distinct (property)

**Signature**

```ts
distinct: () => SelectStatement<Scope, Selection>
```

Added in v0.0.0

### orderBy (property)

**Signature**

```ts
orderBy: (f: (fields: Record<Scope | Selection, SafeString>) => SafeString[] | SafeString) => SelectStatement<Scope, Selection>
```

Added in v0.0.0

### groupBy (property)

**Signature**

```ts
groupBy: (f: (fields: Record<Scope | Selection, SafeString>) => SafeString[] | SafeString) => SelectStatement<Scope, Selection>
```

Added in v0.0.0

### limit (property)

**Signature**

```ts
limit: (limit: SafeString | number) => SelectStatement<Scope, Selection>
```

Added in v0.0.0

### commaJoinTable (property)

**Signature**

```ts
commaJoinTable: <Alias1 extends string, Selection2 extends string, Alias2 extends string>(thisQueryAlias: Alias1, table: Table<Selection2, Alias2>) => Joined<Exclude<Selection, Selection2> | Exclude<Selection2, Selection> | `${Alias1}.${Selection}`, Alias1 | Alias2, Extract<Selection2, Selection>>
```

Added in v0.0.0

### joinTable (property)

**Signature**

```ts
joinTable: <Alias1 extends string, Selection2 extends string, Alias2 extends string>(thisQueryAlias: Alias1, operator: string, table: Table<Selection2, Alias2>) => JoinedFactory<Exclude<Selection, Selection2> | Exclude<Selection2, Selection> | `${Alias1}.${Selection}` | `${Alias2}.${Selection2}`, Alias1 | Alias2, Extract<Selection2, Selection>, Extract<Selection2, Selection>>
```

Added in v0.0.0

### commaJoinSelect (property)

**Signature**

```ts
commaJoinSelect: <Alias1 extends string, Scope2 extends string, Selection2 extends string, Alias2 extends string>(thisSelectAlias: Alias1, selectAlias: Alias2, select: SelectStatement<Scope2, Selection2>) => Joined<Exclude<Selection, Selection2> | Exclude<Selection2, Selection> | `${Alias2}.${Selection2}` | `${Alias1}.${Selection}`, Alias1 | Alias2, Extract<Selection2, Selection>>
```

Added in v0.0.0

### joinSelect (property)

**Signature**

```ts
joinSelect: <Alias1 extends string, Scope2 extends string, Selection2 extends string, Alias2 extends string>(thisSelectAlias: Alias1, operator: string, selectAlias: Alias2, select: SelectStatement<Scope2, Selection2>) => JoinedFactory<Exclude<Selection, Selection2> | Exclude<Selection2, Selection> | `${Alias2}.${Selection2}` | `${Alias1}.${Selection}`, Alias1 | Alias2, Extract<Selection2, Selection>, Extract<Selection2, Selection>>
```

Added in v0.0.0

### commaJoinCompound (property)

**Signature**

```ts
commaJoinCompound: <Alias1 extends string, Selection2 extends string, Alias2 extends string>(thisSelectAlias: Alias1, compoundAlias: Alias2, compound: Compound<Selection2, Selection2>) => Joined<Exclude<Selection, Selection2> | Exclude<Selection2, Selection> | `${Alias1}.${Selection}` | `${Alias2}.${Selection2}`, Alias1 | Alias2, Extract<Selection2, Selection>>
```

Added in v0.0.0

### joinCompound (property)

**Signature**

```ts
joinCompound: <Alias1 extends string, Selection2 extends string, Alias2 extends string>(thisSelectAlias: Alias1, operator: string, compoundAlias: Alias2, compound: Compound<Selection2, Selection2>) => JoinedFactory<Exclude<Selection, Selection2> | Exclude<Selection2, Selection> | `${Alias1}.${Selection}` | `${Alias2}.${Selection2}`, Alias1 | Alias2, Extract<Selection2, Selection>, Extract<Selection2, Selection>>
```

Added in v0.0.0

### print (property)

**Signature**

```ts
print: () => string
```

Added in v0.0.0
