export enum ExamplesKeys {
  select = "select",
  where = "where",
  orderBy = "orderBy",
}

export type ExamplesConfig = { contentUrl: string; title: string };

const createExamples = <T extends { [key in ExamplesKeys]: ExamplesConfig }>(
  it: T
): typeof it => it;

export const examples = createExamples({
  [ExamplesKeys.select]: {
    contentUrl: new URL(`../../content/select.md`, import.meta.url).toString(),
    title: "Select",
  },
  [ExamplesKeys.where]: {
    contentUrl: new URL(`../../content/where.md`, import.meta.url).toString(),
    title: "Where",
  },
  [ExamplesKeys.orderBy]: {
    contentUrl: new URL(`../../content/orderBy.md`, import.meta.url).toString(),
    title: "Order By",
  },
});
