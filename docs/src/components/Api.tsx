import React, { FC } from "react";
import { ApiReferenceKeys, apiReferenceItems } from "../lib/api-references";
import { collectHeadings } from "../lib/collect-headings";
import { getEntries } from "../lib/std";
import { useApiDocumentContent } from "../lib/use-document-content";
import { MdWithToc } from "./MdWithToc";

const toApiUrl = (it: ApiReferenceKeys) => `/api/${it}`;

export const Api: FC<{
  itemKey: ApiReferenceKeys;
}> = ({ itemKey }) => {
  const config = apiReferenceItems[itemKey];
  const content = useApiDocumentContent(config.contentUrl);
  const headings = collectHeadings(content);

  const tableOfContentEntries = getEntries(apiReferenceItems).map(([k, v]) => ({
    ...v,
    isOpen: k === itemKey,
    appUrl: toApiUrl(k),
  }));

  return (
    <MdWithToc
      tocEntries={tableOfContentEntries}
      headings={headings}
      title={config.title}
      content={content}
    />
  );
};
