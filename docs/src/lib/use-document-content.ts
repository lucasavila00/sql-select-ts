import Markdoc, { RenderableTreeNode } from "@markdoc/markdoc";
import useSWR, { mutate } from "swr";
import { config } from "../markdoc/config";

const fetchText = (str: string): Promise<string> =>
  fetch(str).then((it) => it.text());

export const prefetch = (contentUrl: string) => {
  mutate(contentUrl, fetchText(contentUrl));
};

export const useDocumentContent = (contentUrl: string): RenderableTreeNode => {
  const { data } = useSWR(contentUrl, fetchText, { suspense: true });

  const ast = Markdoc.parse(data!);
  const content = Markdoc.transform(ast, config);

  return content;
};
