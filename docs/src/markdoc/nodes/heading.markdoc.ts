import { nodes, RenderableTreeNode, Schema, Tag } from "@markdoc/markdoc";

const generateID = (
  children: RenderableTreeNode[],
  attributes: Record<string, any>
): string => {
  if (attributes["id"] && typeof attributes["id"] === "string") {
    return attributes["id"];
  }
  return children
    .filter((child) => typeof child === "string")
    .join(" ")
    .replace(/[?]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
};

export const heading: Schema = {
  ...nodes.heading,
  transform(node, config) {
    const base = nodes.heading.transform?.(node, config);
    if (base instanceof Tag) {
      base.attributes["id"] = generateID(base.children, base.attributes);
      base.attributes["originalNodeName"] = base.name;
      base.name = "HeadingGrommet";
    }
    return base ?? [];
  },
};