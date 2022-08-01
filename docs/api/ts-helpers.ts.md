---
title: ts-helpers.ts
nav_order: 9
parent: Api
layout: default
---

## ts-helpers overview

Typescript helpers.

Added in v2.0.0

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

# utils

## AnyPrintable (type alias)

**Signature**

```ts
export type AnyPrintable =
  | SelectStatement<any, any, any, any>
  | AliasedSelectStatement<any, any, any, any>
  | Compound<any, any, any, any>
  | AliasedCompound<any, any, any, any>;
```

Added in v2.0.0

## RowOf (type alias)

Return a objects, where the keys are the columns of the selection.

**Signature**

```ts
export type RowOf<T extends AnyPrintable> = RowOfSel<SelectionOf<T>>;
```

**Example**

```ts
import { table, RowOf } from "sql-select-ts";
const t1 = table(["id", "name"], "users");
const q = t1.selectStar();
type Ret = RowOf<typeof q>;
const ret: Ret = { id: 1, name: null };
console.log(ret.id);
console.log(ret.name);
//@ts-expect-error
console.log(ret.abc);
```

Added in v2.0.0

## RowsArray (type alias)

Return an array of objects, where the object keys are the columns of the selection.

**Signature**

```ts
export type RowsArray<T extends AnyPrintable> = RowOfSel<SelectionOf<T>>[];
```

**Example**

```ts
import { table, RowsArray } from "sql-select-ts";
const t1 = table(["id", "name"], "users");
const q = t1.selectStar();
type Ret = RowsArray<typeof q>;
const ret: Ret = [];
console.log(ret?.[0]?.id);
console.log(ret?.[0]?.name);
//@ts-expect-error
console.log(ret?.[0]?.abc);
```

Added in v2.0.0

## SelectionOf (type alias)

Given a printable object, returns the union of the selection keys.

**Signature**

```ts
export type SelectionOf<T extends AnyPrintable> =
  T extends AliasedSelectStatement<infer S, infer _S1, infer _S2, infer _S3>
    ? S
    : T extends AliasedCompound<infer S, infer _S1, infer _S2, infer _S3>
    ? S
    : T extends Compound<infer S, infer _S1, infer _S2, infer _S3>
    ? S
    : T extends SelectStatement<infer S, infer _S1, infer _S2, infer _S3>
    ? S
    : never;
```

**Example**

```ts
import { table, SelectionOf } from "sql-select-ts";
const t1 = table(["id", "name"], "users");
const q = t1.selectStar();
type Key = SelectionOf<typeof q>;
const k: Key = "id";
assert.strictEqual(k, "id");
//@ts-expect-error
const k2: Key = "abc";
```

Added in v2.0.0
