import { MarkdownDocConfig } from "./types";

export enum MiscMds {
  home = "home",
}

const createExamples = <T extends { [key in MiscMds]: MarkdownDocConfig }>(
  it: T
): typeof it => it;

export const miscMds = createExamples({
  [MiscMds.home]: {
    contentUrl: new URL(`../../mds/home.md`, import.meta.url).toString(),
    title: "sql-select-ts",
  },
});
