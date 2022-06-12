import { MarkdownDocConfig } from "./types";

export enum ApiReferenceKeys {
  index = "index",
  safeString = "safeString",
  compound = "compound",
  joined = "joined",
  selectStatement = "selectStatement",
  table = "table",
}

const createExamples = <
  T extends { [key in ApiReferenceKeys]: MarkdownDocConfig }
>(
  it: T
): typeof it => it;

export const apiReferenceItems = createExamples({
  [ApiReferenceKeys.index]: {
    contentUrl: new URL(
      `../../../lib/docs/modules/index.ts.md`,
      import.meta.url
    ).toString(),
    title: "Index",
  },
  [ApiReferenceKeys.safeString]: {
    contentUrl: new URL(
      `../../../lib/docs/modules/safe-string.ts.md`,
      import.meta.url
    ).toString(),
    title: "Safe String",
  },
  [ApiReferenceKeys.compound]: {
    contentUrl: new URL(
      `../../../lib/docs/modules/classes/compound.ts.md`,
      import.meta.url
    ).toString(),
    title: "Compound",
  },
  [ApiReferenceKeys.joined]: {
    contentUrl: new URL(
      `../../../lib/docs/modules/classes/joined.ts.md`,
      import.meta.url
    ).toString(),
    title: "Joined",
  },
  [ApiReferenceKeys.selectStatement]: {
    contentUrl: new URL(
      `../../../lib/docs/modules/classes/select-statement.ts.md`,
      import.meta.url
    ).toString(),
    title: "Select Statement",
  },
  [ApiReferenceKeys.table]: {
    contentUrl: new URL(
      `../../../lib/docs/modules/classes/table.ts.md`,
      import.meta.url
    ).toString(),
    title: "Table",
  },
});
