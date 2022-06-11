import React, { FC, Suspense } from "react";
import "prismjs";
import "prismjs/themes/prism.css";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-sql";
import { Document } from "./Document";
import { URLS } from "../lib/urls";
import { Grommet } from "grommet";
import { CollapsableNav } from "./TopNav";

export const App: FC = () => (
  <Grommet
    theme={{
      global: {
        font: {
          family: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
          size: "18px",
          height: "24px",
        },
      },
    }}
  >
    <CollapsableNav />
    <Suspense fallback={<></>}>
      <Document contentUrl={URLS.where} />
    </Suspense>
  </Grommet>
);
