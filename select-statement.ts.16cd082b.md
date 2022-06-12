---
title: classes/select-statement.ts
nav_order: 3
parent: Modules
---

## select-statement overview

Added in v0.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [SelectStatement (class)](#selectstatement-class)
    - [select (property)](#select-property)
    - [selectStar (property)](#selectstar-property)
    - [appendSelectStar (property)](#appendselectstar-property)
    - [appendSelect (property)](#appendselect-property)
    - [where (property)](#where-property)
    - [distinct (property)](#distinct-property)
    - [orderBy (property)](#orderby-property)
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

**Signature**

```ts
export declare class SelectStatement<With, Scope, Selection> {
  private constructor(
    /* @internal */
    public __from: TableOrSubquery<any, any, any, any> | null,
    /* @internal */
    public __selection: SelectionWrapperTypes<Selection>,
    /* @internal */
    public __orderBy: SafeString[],
    /* @internal */
    public __limit: SafeString | number | null,
    /* @internal */
    public __where: SafeString[],
    /* @internal */
    public __distinct: boolean
  )
}
```

Added in v0.0.0

### select (property)

**Signature**

```ts
select: <NewSelection extends string>(f: (f: Record<Selection | `main_alias.${Selection}`, SafeString> & NoSelectFieldsCompileError) => Record<NewSelection, SafeString>) => SelectStatement<never, Selection | `main_alias.${Selection}`, NewSelection>
```

Added in v0.0.0

### selectStar (property)

**Signature**

```ts
selectStar: () => SelectStatement<never, Selection, Selection>
```

Added in v0.0.0

### appendSelectStar (property)

**Signature**

```ts
appendSelectStar: () => SelectStatement<never, Selection, Selection>
```

Added in v0.0.0

### appendSelect (property)

**Signature**

```ts
appendSelect: <NewSelection extends string>(f: (f: Record<Selection | Scope, SafeString> & NoSelectFieldsCompileError) => Record<NewSelection, SafeString>) => SelectStatement<With, Scope, Selection | NewSelection>
```

Added in v0.0.0

### where (property)

**Signature**

```ts
where: (f: (fields: Record<Scope | Selection, SafeString>) => SafeString[] | SafeString) => SelectStatement<With, Scope, Selection>
```

Added in v0.0.0

### distinct (property)

**Signature**

```ts
distinct: () => SelectStatement<With, Scope, Selection>
```

Added in v0.0.0

### orderBy (property)

**Signature**

```ts
orderBy: (f: (fields: Record<Scope | Selection, SafeString>) => SafeString[] | SafeString) => SelectStatement<With, Scope, Selection>
```

Added in v0.0.0

### limit (property)

**Signature**

```ts
limit: (limit: SafeString | number) => SelectStatement<With, Scope, Selection>
```

Added in v0.0.0

### commaJoinTable (property)

**Signature**

```ts
commaJoinTable: <Alias1 extends string, Selection2 extends string, Alias2 extends string>(thisQueryAlias: Alias1, table: Table<Selection2, Alias2>) => Joined<Exclude<Selection, Selection2> | Exclude<Selection2, Selection> | `${Alias1}.${Selection}`, Alias1 | Alias2>
```

Added in v0.0.0

### joinTable (property)

**Signature**

```ts
joinTable: <Alias1 extends string, Selection2 extends string, Alias2 extends string>(thisQueryAlias: Alias1, operator: string, table: Table<Selection2, Alias2>) => JoinedFactory<Exclude<Selection, Selection2> | Exclude<Selection2, Selection> | `${Alias1}.${Selection}` | `${Alias2}.${Selection2}`, Alias1 | Alias2, Extract<Selection2, Selection>>
```

Added in v0.0.0

### commaJoinSelect (property)

**Signature**

```ts
commaJoinSelect: <Alias1 extends string, With2 extends string, Scope2 extends string, Selection2 extends string, Alias2 extends string>(thisQueryAlias: Alias1, tableAlias: Alias2, table: SelectStatement<With2, Scope2, Selection2>) => Joined<Exclude<Selection, Selection2> | Exclude<Selection2, Selection> | `${Alias2}.${Selection2}` | `${Alias1}.${Selection}`, Alias1 | Alias2>
```

Added in v0.0.0

### joinSelect (property)

**Signature**

```ts
joinSelect: <Alias1 extends string, With2 extends string, Scope2 extends string, Selection2 extends string, Alias2 extends string>(thisSelectAlias: Alias1, operator: string, selectAlias: Alias2, select: SelectStatement<With2, Scope2, Selection2>) => JoinedFactory<Exclude<Selection, Selection2> | Exclude<Selection2, Selection> | `${Alias2}.${Selection2}` | `${Alias1}.${Selection}`, Alias1 | Alias2, Extract<Selection2, Selection>>
```

Added in v0.0.0

### commaJoinCompound (property)

**Signature**

```ts
commaJoinCompound: <Alias1 extends string, Selection2 extends string, Alias2 extends string>(thisSelectAlias: Alias1, compoundAlias: Alias2, compound: Compound<Selection2, Selection2>) => Joined<Exclude<Selection, Selection2> | Exclude<Selection2, Selection> | `${Alias1}.${Selection}` | `${Alias2}.${Selection2}`, Alias1 | Alias2>
```

Added in v0.0.0

### joinCompound (property)

**Signature**

```ts
joinCompound: <Alias1 extends string, Selection2 extends string, Alias2 extends string>(thisSelectAlias: Alias1, operator: string, compoundAlias: Alias2, compound: Compound<Selection2, Selection2>) => JoinedFactory<Exclude<Selection, Selection2> | Exclude<Selection2, Selection> | `${Alias1}.${Selection}` | `${Alias2}.${Selection2}`, Alias1 | Alias2, Extract<Selection2, Selection>>
```

Added in v0.0.0

### print (property)

**Signature**

```ts
print: () => string
```

Added in v0.0.0
