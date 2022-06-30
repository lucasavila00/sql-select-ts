---
title: classes/cte.ts
nav_order: 2
parent: Classes
layout: default
grand_parent: Api
---

## cte overview

Added in v0.0.0

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

# utils

## CommonTableExpression (class)

**Signature**

```ts
export declare class CommonTableExpression<Selection, Alias> {
  private constructor(
    /* @internal */
    public __props: {
      columns: string[];
      alias: string;
      select: SelectStatement<any, any>;
    }
  );
}
```

Added in v0.0.0

### select (property)

**Signature**

```ts
select: <NewSelection extends string>(
  f: (
    f: Record<Selection | `${Alias}.${Selection}`, SafeString> &
      NoSelectFieldsCompileError
  ) => Record<NewSelection, SafeString>
) => SelectStatement<Selection | `${Alias}.${Selection}`, NewSelection>;
```

Added in v0.0.0
