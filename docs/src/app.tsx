import React, { Suspense } from "react";
import "prismjs";
import "prismjs/themes/prism-okaidia.css";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-sql";
import { Document } from "./components/Document";
import { URLS } from "./lib/urls";

export const App = () => (
  <Suspense fallback={<></>}>
    <Document contentUrl={URLS.where} />
  </Suspense>
);
