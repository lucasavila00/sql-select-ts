export enum ExamplesKeys {
  select = "select",
  where = "where",
  orderBy = "orderBy",
  join = "join",
  safeString = "safeString",
  typedResponse = "typedResponse",
  limit = "limit",
}

export type ExamplesConfig = { contentUrl: string; title: string };

const createExamples = <T extends { [key in ExamplesKeys]: ExamplesConfig }>(
  it: T
): typeof it => it;

export const examples = createExamples({
  [ExamplesKeys.safeString]: {
    contentUrl: new URL(
      `../../content/safe-string.md`,
      import.meta.url
    ).toString(),
    title: "Safe String",
  },
  [ExamplesKeys.select]: {
    contentUrl: new URL(`../../content/select.md`, import.meta.url).toString(),
    title: "Select",
  },
  [ExamplesKeys.join]: {
    contentUrl: new URL(`../../content/join.md`, import.meta.url).toString(),
    title: "Join",
  },
  [ExamplesKeys.where]: {
    contentUrl: new URL(`../../content/where.md`, import.meta.url).toString(),
    title: "Where",
  },
  [ExamplesKeys.orderBy]: {
    contentUrl: new URL(`../../content/orderBy.md`, import.meta.url).toString(),
    title: "Order By",
  },
  [ExamplesKeys.limit]: {
    contentUrl: new URL(`../../content/limit.md`, import.meta.url).toString(),
    title: "Limit",
  },
  [ExamplesKeys.typedResponse]: {
    contentUrl: new URL(
      `../../content/typed-response.md`,
      import.meta.url
    ).toString(),
    title: "Typed Query Results",
  },
});
