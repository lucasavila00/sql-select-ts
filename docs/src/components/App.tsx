import { Grommet } from "grommet";
import "prismjs";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-typescript";
import "prismjs/themes/prism.css";
import React, { FC, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { apiReferenceItems, ApiReferenceKeys } from "../lib/api-references";
import { examples, ExamplesKeys } from "../lib/examples";
import { getKeys } from "../lib/std";
import { prefetch } from "../lib/use-document-content";
import { Api } from "./Api";
import { Example } from "./Example";
import { Home } from "./Home";
import { CollapsableNav } from "./TopNav";

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return <></>;
};

const prefetchExamples = () => {
  Object.values(examples).forEach((it) => {
    prefetch(it.contentUrl);
  });
};

export const App: FC = () => {
  prefetchExamples();
  return (
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
      <BrowserRouter basename="sql-select-ts">
        <CollapsableNav />
        <div style={{ height: 72 }} />
        <Suspense fallback={<></>}>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="api">
              <Route index element={<Api itemKey={ApiReferenceKeys.index} />} />
              {getKeys(apiReferenceItems).map((it) => (
                <Route path={it} key={it} element={<Api itemKey={it} />} />
              ))}
            </Route>
            <Route path="examples">
              <Route
                index
                element={<Example exampleKey={ExamplesKeys.safeString} />}
              />
              {getKeys(examples).map((it) => (
                <Route
                  path={it}
                  key={it}
                  element={<Example exampleKey={it} />}
                />
              ))}
            </Route>
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </Grommet>
  );
};
