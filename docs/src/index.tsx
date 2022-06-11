import React from "react";
import { App } from "./app";
import { createRoot } from "react-dom/client";

const app =
  document.getElementById("app");
const root = createRoot(app);
root.render(<App />);
