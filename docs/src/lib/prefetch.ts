import { useEffect } from "react";
import { apiReferenceItems } from "./api-references";
import { examples } from "./examples";
import { miscMds } from "./mds";
import { prefetchMutate } from "./use-document-content";

const prefetchExamples = () =>
  Object.values(examples).forEach((it) => prefetchMutate(it.contentUrl));

const prefetchApiReference = () =>
  Object.values(apiReferenceItems).forEach((it) =>
    prefetchMutate(it.contentUrl)
  );

const prefetchMiscMds = () =>
  Object.values(miscMds).forEach((it) => prefetchMutate(it.contentUrl));

export const usePrefetchAll = () => {
  useEffect(() => {
    prefetchExamples();
    prefetchApiReference();
    prefetchMiscMds();
  }, []);
};
