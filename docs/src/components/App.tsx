import { Grommet } from "grommet";
import "prismjs";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-typescript";
import "prismjs/themes/prism.css";
import React, { FC, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { examples, ExamplesKeys } from "../lib/examples";
import { getKeys } from "../lib/std";
import { Api } from "./Api";
import { Example } from "./Example";
import { Home } from "./Home";
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
    <BrowserRouter>
      <CollapsableNav />
      <Suspense fallback={<></>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="api" element={<Api />} />
          <Route path="examples">
            <Route
              index
              element={<Example exampleKey={ExamplesKeys.safeString} />}
            />
            {getKeys(examples).map((it) => (
              <Route path={it} key={it} element={<Example exampleKey={it} />} />
            ))}
          </Route>
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </Grommet>
);
