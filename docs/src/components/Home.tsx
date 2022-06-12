import React from "react";
import { collectHeadings } from "../lib/collect-headings";
import { miscMds } from "../lib/mds";
import { useDocumentContent } from "../lib/use-document-content";
import { MdWithToc } from "./MdWithToc";

export const Home = () => {
  const contentUrl = miscMds["home"].contentUrl;
  const title = miscMds["home"].title;
  const content = useDocumentContent(contentUrl);
  const headings = collectHeadings(content);
  return (
    <MdWithToc
      tocEntries={[
        {
          title,
          contentUrl,
          isOpen: true,
          appUrl: "/",
        },
      ]}
      headings={headings}
      title={title}
      content={content}
    />
  );
};
