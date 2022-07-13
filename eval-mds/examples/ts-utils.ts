const tocTemplate = `
<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>`;

const frontMatter = (title: string, navOrder = 10) => `---
title: ${title}
nav_order: ${navOrder}
parent: Examples
layout: default
---
`;

export const exampleHeader = (title: string, navOrder = 10) =>
    frontMatter(title, navOrder) + tocTemplate;
