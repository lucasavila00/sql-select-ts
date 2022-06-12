import Markdoc, { RenderableTreeNode } from "@markdoc/markdoc";
import useSWR, { mutate } from "swr";
import { config } from "../markdoc/config";
import { clearTocAndFrontmatter } from "./clear-toc-frontmatter";

const fetchText = (str: string): Promise<string> =>
  fetch(str).then((it) => it.text());

export const prefetchMutate = (contentUrl: string) => {
  mutate(contentUrl, fetchText(contentUrl));
};

export const parseAndTransform = (it: string): RenderableTreeNode => {
  const ast = Markdoc.parse(it);
  const content = Markdoc.transform(ast, config);
  return content;
};

export const useDocumentContent = (contentUrl: string): RenderableTreeNode => {
  const { data } = useSWR(contentUrl, fetchText, { suspense: true });
  return parseAndTransform(data!);
};

export const useApiDocumentContent = (
  contentUrl: string
): RenderableTreeNode => {
  const { data } = useSWR(contentUrl, fetchText, { suspense: true });
  return parseAndTransform(clearTocAndFrontmatter(data!));
};
