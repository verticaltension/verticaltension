import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { StorefrontProvider } from "./context/StorefrontContext";
import { ConsentProvider } from "./context/ConsentContext";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StorefrontProvider>
      <ConsentProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConsentProvider>
    </StorefrontProvider>
  </React.StrictMode>
);
