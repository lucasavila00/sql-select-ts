import React, { FC, Suspense } from "react";
import "prismjs";
import "prismjs/themes/prism.css";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-sql";
import { Document } from "./Document";
import { URLS } from "../lib/urls";

export const App: FC = () => (
  <Suspense fallback={<></>}>
    <Document contentUrl={URLS.where} />
  </Suspense>
);
