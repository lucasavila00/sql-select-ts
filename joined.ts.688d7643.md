---
title: classes/joined.ts
nav_order: 2
parent: Modules
---

## joined overview

Added in v0.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [Joined (class)](#joined-class)
    - [select (property)](#select-property)
    - [selectStar (property)](#selectstar-property)
    - [selectStarOfAliases (property)](#selectstarofaliases-property)
    - [commaJoinTable (property)](#commajointable-property)
    - [joinTable (property)](#jointable-property)
    - [commaJoinSelect (property)](#commajoinselect-property)
    - [joinSelect (property)](#joinselect-property)
  - [JoinedFactory (class)](#joinedfactory-class)
    - [noConstraint (property)](#noconstraint-property)
    - [on (property)](#on-property)
    - [using (property)](#using-property)

---

# utils

## Joined (class)

**Signature**

```ts
export declare class Joined<Selection, Aliases> {
  private constructor(
    /* @internal */
    public __commaJoins: CommaJoin,
    /* @internal */
    public __properJoins: ProperJoin
  )
}
```

Added in v0.0.0

### select (property)

**Signature**

```ts
select: <NewSelection extends string>(f: (f: Record<Selection, SafeString> & NoSelectFieldsCompileError) => Record<NewSelection, SafeString>) => SelectStatement<never, Selection, NewSelection>
```

Added in v0.0.0

### selectStar (property)

**Signature**

```ts
selectStar: () => SelectStatement<never, Selection, Selection>
```

Added in v0.0.0

### selectStarOfAliases (property)

**Signature**

```ts
selectStarOfAliases: <TheAliases extends Aliases>(aliases: TheAliases[]) => SelectStatement<never, RemoveAliasFromSelection<TheAliases, Selection>, RemoveAliasFromSelection<TheAliases, Selection>>
```

Added in v0.0.0

### commaJoinTable (property)

**Signature**

```ts
commaJoinTable: <Selection2 extends string, Alias2 extends string>(table: Table<Selection2, Alias2>) => Joined<Exclude<Selection, Selection2> | Exclude<Selection2, Selection> | `${Alias2}.${Selection2}`, Aliases | Alias2>
```

Added in v0.0.0

### joinTable (property)

**Signature**

```ts
joinTable: <Selection2 extends string, Alias2 extends string>(operator: string, table: Table<Selection2, Alias2>) => JoinedFactory<Exclude<Selection, Selection2> | Exclude<Selection2, Selection> | `${Alias2}.${Selection2}`, Aliases | Alias2, Extract<Selection, Selection2>>
```

Added in v0.0.0

### commaJoinSelect (property)

**Signature**

```ts
commaJoinSelect: <With2 extends string, Scope2 extends string, Selection2 extends string, Alias2 extends string>(alias: Alias2, table: SelectStatement<With2, Scope2, Selection2>) => Joined<Exclude<Selection, Selection2> | Exclude<Selection2, Selection> | `${Alias2}.${Selection2}`, Aliases | Alias2>
```

Added in v0.0.0

### joinSelect (property)

**Signature**

```ts
joinSelect: <With2 extends string, Scope2 extends string, Selection2 extends string, Alias2 extends string>(operator: string, alias: Alias2, table: SelectStatement<With2, Scope2, Selection2>) => JoinedFactory<Exclude<Selection, Selection2> | Exclude<Selection2, Selection> | `${Alias2}.${Selection2}`, Aliases | Alias2, Extract<Selection2, Selection>>
```

Added in v0.0.0

## JoinedFactory (class)

**Signature**

```ts
export declare class JoinedFactory<Selection, Aliases, UsingPossibleKeys> {
  private constructor(
    /* @internal */
    public __commaJoins: CommaJoin,
    /* @internal */
    public __properJoins: ProperJoin,
    /* @internal */
    public __newProperJoin: Omit<ProperJoinItem, 'constraint'>
  )
}
```

Added in v0.0.0

### noConstraint (property)

**Signature**

```ts
noConstraint: () => Joined<Selection, Aliases>
```

Added in v0.0.0

### on (property)

**Signature**

```ts
on: (on: (fields: Record<Selection, SafeString>) => SafeString | SafeString[]) => Joined<Selection, Aliases>
```

Added in v0.0.0

### using (property)

**Signature**

```ts
using: (keys: UsingPossibleKeys[]) => Joined<Selection, Aliases>
```

Added in v0.0.0
