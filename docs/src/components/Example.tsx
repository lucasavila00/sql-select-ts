import { Box, Heading, Nav, Page, ResponsiveContext } from "grommet";
import React, { FC, useContext } from "react";
import { collectHeadings } from "../lib/collect-headings";
import { examples, ExamplesKeys } from "../lib/examples";
import { getEntries } from "../lib/std";
import { useDocumentContent } from "../lib/use-document-content";
import { MarkdocRenderer } from "./MarkdocRenderer";
import { TableOfContents } from "./TableOfContents";

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

  const responsive = useContext(ResponsiveContext);

  return (
    <Box direction="row" margin="auto" justify="center" pad="small">
      <Box width="large" pad={{ top: "large" }}>
        <Heading margin="none">{config.title}</Heading>
        <MarkdocRenderer content={content} />
      </Box>
      {responsive === "small" ? (
        <></>
      ) : (
        <Box width="medium">
          <TableOfContents
            entries={tableOfContentEntries}
            headings={headings}
          />
        </Box>
      )}
    </Box>
  );
};
