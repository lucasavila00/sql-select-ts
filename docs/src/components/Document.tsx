import React, { FC } from "react";
import useSWR from "swr";
import { URLS } from "../lib/urls";
import { DocumentRenderer } from "./DocumentRenderer";

const fetchText = (str: string): Promise<string> =>
  fetch(str).then((it) => it.text());

export const Document: FC<{ contentUrl: string }> = ({ contentUrl }) => {
  const { data } = useSWR(contentUrl, fetchText, { suspense: true });
  return <DocumentRenderer data={data} />;
};
