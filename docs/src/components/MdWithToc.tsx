import { RenderableTreeNode } from "@markdoc/markdoc";
import { Box, Heading, ResponsiveContext } from "grommet";
import React, { FC, useContext } from "react";
import { Section } from "../lib/collect-headings";
import { useScrollIntoView } from "../lib/use-scroll-into-view";
import { MarkdocRenderer } from "./MarkdocRenderer";
import { TableOfContents, TOCEntry } from "./TableOfContents";

export const MdWithToc: FC<{
  title: string;
  content: RenderableTreeNode;
  headings: Section[];
  tocEntries: TOCEntry[];
}> = ({ title, content, headings, tocEntries }) => {
  const responsive = useContext(ResponsiveContext);
  useScrollIntoView();
  return (
    <Box
      direction="row"
      margin="auto"
      justify="center"
      pad={{ left: "medium" }}
    >
      <Box width="large" pad={{ top: "large" }}>
        <Heading margin="none">{title}</Heading>
        <MarkdocRenderer content={content} />
      </Box>
      {responsive === "small" ? (
        <></>
      ) : (
        <Box width="medium">
          <TableOfContents entries={tocEntries} headings={headings} />
        </Box>
      )}
    </Box>
  );
};
