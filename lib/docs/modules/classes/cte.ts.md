---
title: classes/cte.ts
nav_order: 2
parent: Modules
---

## cte overview

Added in v0.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [CommonTableExpression (class)](#commontableexpression-class)
    - [select (property)](#select-property)

---

# utils

## CommonTableExpression (class)

**Signature**

```ts
export declare class CommonTableExpression<Selection, Alias> {
  private constructor(
    /* @internal */
    public __props: {
      columns: string[]
      alias: string
      select: SelectStatement<any, any>
    }
  )
}
```

Added in v0.0.0

### select (property)

**Signature**

```ts
select: <NewSelection extends string>(f: (f: Record<Selection | `${Alias}.${Selection}`, SafeString> & NoSelectFieldsCompileError) => Record<NewSelection, SafeString>) => SelectStatement<Selection | `${Alias}.${Selection}`, NewSelection>
```

Added in v0.0.0
