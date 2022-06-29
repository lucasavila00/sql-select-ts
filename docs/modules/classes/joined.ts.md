---
title: classes/joined.ts
nav_order: 3
parent: Classes
layout: default
grand_parent: Modules
---

## joined overview

Represents a source of data composed of JOINed tables or sub-selects.

Added in v0.0.0

---

<h2 class="text-delta">Table of contents</h2>

-   [utils](#utils)
    -   [Joined (class)](#joined-class)
        -   [select (property)](#select-property)
        -   [selectStar (property)](#selectstar-property)
        -   [selectStarOfAliases (property)](#selectstarofaliases-property)
        -   [commaJoinTable (property)](#commajointable-property)
        -   [joinTable (property)](#jointable-property)
        -   [commaJoinSelect (property)](#commajoinselect-property)
        -   [joinSelect (property)](#joinselect-property)
        -   [commaJoinCompound (property)](#commajoincompound-property)
        -   [joinCompound (property)](#joincompound-property)
    -   [JoinedFactory (class)](#joinedfactory-class)
        -   [noConstraint (property)](#noconstraint-property)
        -   [on (property)](#on-property)
        -   [using (property)](#using-property)

---

# utils

## Joined (class)

Represents a source of data composed of JOINed tables or sub-selects.
This class is not meant to be used directly, but rather through methods in tables, or sub-selects.

**Signature**

```ts
export declare class Joined<Selection, Aliases, Ambiguous> {
    private constructor(
        /* @internal */
        public __props: {
            commaJoins: CommaJoin;
            properJoins: ProperJoin;
        }
    );
}
```

Added in v0.0.0

### select (property)

**Signature**

```ts
select: <NewSelection extends string>(f: (f: Record<Selection, SafeString> & NoSelectFieldsCompileError) => Record<NewSelection, SafeString>) => SelectStatement<Selection, NewSelection>
```

Added in v0.0.0

### selectStar (property)

**Signature**

```ts
selectStar: () => SelectStatement<Selection, Selection>
```

Added in v0.0.0

### selectStarOfAliases (property)

**Signature**

```ts
selectStarOfAliases: <TheAliases extends Aliases>(aliases: TheAliases[]) => SelectStatement<RemoveAliasFromSelection<TheAliases, Selection>, RemoveAliasFromSelection<TheAliases, Selection>>
```

Added in v0.0.0

### commaJoinTable (property)

**Signature**

```ts
commaJoinTable: <Selection2 extends string, Alias2 extends string>(table: Table<Selection2, Alias2>) => Joined<Exclude<Selection, Selection2> | Exclude<Exclude<Selection2, Selection>, Ambiguous> | Exclude<Selection2, Ambiguous> | `${Alias2}.${Selection2}`, Aliases | Alias2, Ambiguous | Extract<Selection2, Selection>>
```

Added in v0.0.0

### joinTable (property)

**Signature**

```ts
joinTable: <Selection2 extends string, Alias2 extends string>(operator: string, table: Table<Selection2, Alias2>) => JoinedFactory<Exclude<Selection, Selection2> | Exclude<Exclude<Selection2, Selection>, Ambiguous> | `${Alias2}.${Selection2}`, Aliases | Alias2, Extract<Selection, Selection2>, Ambiguous | Extract<Selection2, Selection>>
```

Added in v0.0.0

### commaJoinSelect (property)

**Signature**

```ts
commaJoinSelect: <Scope2 extends string, Selection2 extends string, Alias2 extends string>(alias: Alias2, select: SelectStatement<Scope2, Selection2>) => Joined<Exclude<Selection, Selection2> | Exclude<Exclude<Selection2, Selection>, Ambiguous> | `${Alias2}.${Selection2}`, Aliases | Alias2, Ambiguous | Extract<Selection2, Selection>>
```

Added in v0.0.0

### joinSelect (property)

**Signature**

```ts
joinSelect: <Scope2 extends string, Selection2 extends string, Alias2 extends string>(operator: string, alias: Alias2, table: SelectStatement<Scope2, Selection2>) => JoinedFactory<Exclude<Selection, Selection2> | Exclude<Exclude<Selection2, Selection>, Ambiguous> | `${Alias2}.${Selection2}`, Aliases | Alias2, Ambiguous | Extract<Selection2, Selection>, Extract<Selection2, Selection>>
```

Added in v0.0.0

### commaJoinCompound (property)

**Signature**

```ts
commaJoinCompound: <Scope2 extends string, Selection2 extends string, Alias2 extends string>(alias: Alias2, compound: Compound<Scope2, Selection2>) => Joined<Exclude<Selection, Selection2> | Exclude<Exclude<Selection2, Selection>, Ambiguous> | `${Alias2}.${Selection2}`, Aliases | Alias2, Ambiguous | Extract<Selection2, Selection>>
```

Added in v0.0.0

### joinCompound (property)

**Signature**

```ts
joinCompound: <Scope2 extends string, Selection2 extends string, Alias2 extends string>(operator: string, alias: Alias2, compound: Compound<Scope2, Selection2>) => JoinedFactory<Exclude<Selection, Selection2> | Exclude<Exclude<Selection2, Selection>, Ambiguous> | `${Alias2}.${Selection2}`, Aliases | Alias2, Ambiguous | Extract<Selection2, Selection>, Extract<Selection2, Selection>>
```

Added in v0.0.0

## JoinedFactory (class)

Constructor for join queries.
Allows the selection of the constraint to be done in another method call.

**Signature**

```ts
export declare class JoinedFactory<
    Selection,
    Aliases,
    Ambiguous,
    UsingPossibleKeys
> {
    private constructor(
        /* @internal */
        public __props: {
            commaJoins: CommaJoin;
            properJoins: ProperJoin;
            newProperJoin: Omit<ProperJoinItem, "constraint">;
        }
    );
}
```

Added in v0.0.0

### noConstraint (property)

**Signature**

```ts
noConstraint: () => Joined<Selection, Aliases, Ambiguous>
```

Added in v0.0.0

### on (property)

**Signature**

```ts
on: (on: (fields: Record<Selection, SafeString>) => SafeString | SafeString[]) => Joined<Selection, Aliases, Ambiguous>
```

Added in v0.0.0

### using (property)

**Signature**

```ts
using: (keys: UsingPossibleKeys[]) => Joined<Selection, Aliases, Ambiguous>
```

Added in v0.0.0
