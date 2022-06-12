---
title: classes/compound.ts
nav_order: 1
parent: Modules
---

## compound overview

Represents https://www.sqlite.org/syntax/compound-operator.html

Added in v0.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [Compound (class)](#compound-class)
    - [orderBy (property)](#orderby-property)
    - [limit (property)](#limit-property)
    - [select (property)](#select-property)
    - [selectStar (property)](#selectstar-property)
    - [joinTable (property)](#jointable-property)
    - [joinSelect (property)](#joinselect-property)
    - [print (property)](#print-property)

---

# utils

## Compound (class)

Represents https://www.sqlite.org/syntax/compound-operator.html

**Signature**

```ts
export declare class Compound<Scope, Selection> {
  private constructor(
    /* @internal */
    public __content: TableOrSubquery<any, any, any, any>[],
    /* @internal */
    public __qualifier: 'UNION' | 'UNION ALL' | 'INTERSECT' | 'EXCEPT',
    /* @internal */
    public __orderBy: SafeString[],
    /* @internal */
    public __limit: SafeString | number | null
  )
}
```

Added in v0.0.0

### orderBy (property)

**Signature**

```ts
orderBy: (f: (fields: Record<Scope | Selection, SafeString>) => SafeString[] | SafeString) => Compound<Scope, Selection>
```

Added in v0.0.0

### limit (property)

**Signature**

```ts
limit: (limit: SafeString | number) => Compound<Scope, Selection>
```

Added in v0.0.0

### select (property)

**Signature**

```ts
select: <NewSelection extends string>(f: (fields: Record<Selection | `main_alias.${Selection}`, SafeString> & NoSelectFieldsCompileError) => Record<NewSelection, SafeString>) => SelectStatement<never, Selection | `main_alias.${Selection}`, NewSelection>
```

Added in v0.0.0

### selectStar (property)

**Signature**

```ts
selectStar: () => SelectStatement<never, Selection, Selection>
```

Added in v0.0.0

### joinTable (property)

**Signature**

```ts
joinTable: <Alias1 extends string, Selection2 extends string, Alias2 extends string>(thisSelectAlias: Alias1, operator: string, table: Table<Selection2, Alias2>) => JoinedFactory<Exclude<Selection, Selection2> | Exclude<Selection2, Selection> | `${Alias1}.${Selection}` | `${Alias2}.${Selection2}`, Alias1 | Alias2, Extract<Selection2, Selection>>
```

Added in v0.0.0

### joinSelect (property)

**Signature**

```ts
joinSelect: <Alias1 extends string, With2 extends string, Scope2 extends string, Selection2 extends string, Alias2 extends string>(thisSelectAlias: Alias1, operator: string, selectAlias: Alias2, select: SelectStatement<With2, Scope2, Selection2>) => JoinedFactory<Exclude<Selection, Selection2> | Exclude<Selection2, Selection> | `${Alias2}.${Selection2}` | `${Alias1}.${Selection}`, Alias1 | Alias2, Extract<Selection2, Selection>>
```

Added in v0.0.0

### print (property)

**Signature**

```ts
print: () => string
```

Added in v0.0.0
