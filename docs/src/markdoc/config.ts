import { Config } from "@markdoc/markdoc";
import { fence } from "./nodes/fence.markdoc";
import { heading } from "./nodes/heading.markdoc";
import { printer } from "./tags/printer.markdoc";

export const config: Config = {
  nodes: { fence, heading },
  tags: { printer },
  variables: {},
};
