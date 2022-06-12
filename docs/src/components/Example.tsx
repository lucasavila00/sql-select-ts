import React, { FC } from "react";
import { collectHeadings } from "../lib/collect-headings";
import { examples, ExamplesKeys } from "../lib/examples";
import { getEntries } from "../lib/std";
import { useDocumentContent } from "../lib/use-document-content";
import { MdWithToc } from "./MdWithToc";

const toExampleUrl = (it: ExamplesKeys) => `/examples/${it}`;

export const Example: FC<{
  exampleKey: ExamplesKeys;
}> = ({ exampleKey }) => {
  const config = examples[exampleKey];
  const content = useDocumentContent(config.contentUrl);
  const headings = collectHeadings(content);

  const tableOfContentEntries = getEntries(examples).map(([k, v]) => ({
    ...v,
    isOpen: k === exampleKey,
    appUrl: toExampleUrl(k),
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
