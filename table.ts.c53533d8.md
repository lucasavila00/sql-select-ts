---
title: classes/table.ts
nav_order: 4
parent: Modules
---

## table overview

Added in v0.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [Table (class)](#table-class)
    - [select (property)](#select-property)
    - [selectStar (property)](#selectstar-property)
    - [commaJoinTable (property)](#commajointable-property)
    - [joinTable (property)](#jointable-property)
    - [commaJoinSelect (property)](#commajoinselect-property)
    - [joinSelect (property)](#joinselect-property)
    - [commaJoinCompound (property)](#commajoincompound-property)

---

# utils

## Table (class)

**Signature**

```ts
export declare class Table<Selection, Alias> {
  private constructor(
    /* @internal */
    public __columns: string[],
    /* @internal */
    public __alias: string,
    /* @internal */
    public __name: string
  )
}
```

Added in v0.0.0

### select (property)

**Signature**

```ts
select: <NewSelection extends string>(f: (f: Record<Selection | `${Alias}.${Selection}`, SafeString> & NoSelectFieldsCompileError) => Record<NewSelection, SafeString>) => SelectStatement<never, Selection | `${Alias}.${Selection}`, NewSelection>
```

Added in v0.0.0

### selectStar (property)

**Signature**

```ts
selectStar: () => SelectStatement<never, Selection | `main_alias.${Selection}`, Selection>
```

Added in v0.0.0

### commaJoinTable (property)

**Signature**

```ts
commaJoinTable: <Selection2 extends string, Alias2 extends string>(table: Table<Selection2, Alias2>) => Joined<`${Alias}.${Selection}` | Exclude<Selection, Selection2> | Exclude<Selection2, Selection> | `${Alias2}.${Selection2}`, Alias | Alias2>
```

Added in v0.0.0

### joinTable (property)

**Signature**

```ts
joinTable: <Selection2 extends string, Alias2 extends string>(operator: string, table: Table<Selection2, Alias2>) => JoinedFactory<`${Alias}.${Selection}` | Exclude<Selection, Selection2> | Exclude<Selection2, Selection> | `${Alias2}.${Selection2}`, Alias | Alias2, Extract<Selection2, Selection>>
```

Added in v0.0.0

### commaJoinSelect (property)

**Signature**

```ts
commaJoinSelect: <With2 extends string, Scope2 extends string, Selection2 extends string, Alias2 extends string>(selectAlias: Alias2, select: SelectStatement<With2, Scope2, Selection2>) => Joined<`${Alias}.${Selection}` | Exclude<Selection, Selection2> | Exclude<Selection2, Selection> | `${Alias2}.${Selection2}`, Alias | Alias2>
```

Added in v0.0.0

### joinSelect (property)

**Signature**

```ts
joinSelect: <With2 extends string, Scope2 extends string, Selection2 extends string, Alias2 extends string>(selectAlias: Alias2, operator: string, select: SelectStatement<With2, Scope2, Selection2>) => JoinedFactory<`${Alias}.${Selection}` | Exclude<Selection, Selection2> | Exclude<Selection2, Selection> | `${Alias2}.${Selection2}`, Alias | Alias2, Extract<Selection2, Selection>>
```

Added in v0.0.0

### commaJoinCompound (property)

**Signature**

```ts
commaJoinCompound: <Selection2 extends string, Alias2 extends string>(compoundAlias: Alias2, compound: Compound<Selection2, Selection2>) => Joined<Exclude<Selection, Selection2> | Exclude<Selection2, Selection> | `${Alias2}.${Selection2}`, Alias | Alias2>
```

Added in v0.0.0
