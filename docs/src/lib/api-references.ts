import { MarkdownDocConfig } from "./types";

export enum ApiReferenceKeys {
  index = "index",
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
});
