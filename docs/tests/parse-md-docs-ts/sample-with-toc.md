---
title: index.ts
nav_order: 5
parent: Modules
---

## index overview

Entry points of the library.

Added in v0.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [compound](#compound)
  - [union](#union)
  - [unionAll](#unionall)
- [starter](#starter)
  - [fromNothing](#fromnothing)
  - [table](#table)
- [string-builder](#string-builder)
  - [SafeString](#safestring)
  - [castSafe](#castsafe)
  - [sql](#sql)

---

# compound

## union

Creates a compound query using 'UNION'

**Signature**

```ts
export declare const union: <
  C extends SelectStatement<
    any,
    any,
    any
  >,
  CS extends SelectStatement<
    any,
    any,
    any
  >[]
>(
  content: [C, ...CS]
) => Compound<
  | (C extends SelectStatement<
      infer With,
      infer Scope,
      infer Selection
    >
      ? Selection
      : never)
  | (CS[number] extends SelectStatement<
      infer With,
      infer Scope,
      infer Selection
    >
      ? Selection
      : never),
  C extends SelectStatement<
    infer With,
    infer Scope,
    infer Selection
  >
    ? Selection
    : never
>;
```
