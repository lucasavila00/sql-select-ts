import { Anchor, Box, Nav } from "grommet";
import React, { FC } from "react";
import { Section } from "../lib/collect-headings";
import { AnchorLink } from "./AnchorLink";

const ClosedLink: FC<{ to: string; label: String }> = ({ to, label }) => (
  <AnchorLink to={to} label={label} color="text" />
);

const marginLeftOfNode = (nodeName: string): number => {
  switch (nodeName) {
    case "h3": {
      return 12;
    }
    case "h4": {
      return 24;
    }

    default: {
      return 0;
    }
  }
};

const OpenLink: FC<{ to: string; label: String; headings: Section[] }> = ({
  to,
  label,
  headings,
}) => (
  <>
    <AnchorLink to={to} label={label} color="text" />
    <Nav pad="small">
      {headings.map((it) => (
        <Anchor
          color="text"
          label={it.title}
          key={it.title}
          size="small"
          href={`#${it.id}`}
          style={{
            marginLeft: marginLeftOfNode(it.nodeName),
          }}
        />
      ))}
    </Nav>
  </>
);

type TOCEntry = {
  contentUrl: string;
  title: string;
  appUrl: string;
  isOpen: boolean;
};
export const TableOfContents: FC<{
  entries: TOCEntry[];
  headings: Section[];
}> = ({ entries, headings }) => (
  <Box
    style={{ maxHeight: "calc(100vh - 72px)", position: "sticky", top: 72 }}
    className="hide-scrollbar"
    overflow="scroll"
  >
    <Nav pad="large">
      {entries.map((it) => {
        if (it.isOpen) {
          return (
            <OpenLink
              to={it.appUrl}
              label={it.title}
              key={it.appUrl}
              headings={headings}
            />
          );
        }
        return <ClosedLink to={it.appUrl} label={it.title} key={it.appUrl} />;
      })}
    </Nav>
  </Box>
);
