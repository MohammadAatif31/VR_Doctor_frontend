import React from "react";
import ReactDom from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // ⭐ ADD THIS
import { UIProvider } from "./context/UIContext.jsx";
import { LoaderProvider } from "./context/LoaderContext";


ReactDom.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <UIProvider>
        <LoaderProvider>   {/* ✅ ADD THIS */}
          <App />
        </LoaderProvider>
      </UIProvider>
    </AuthProvider>
  </BrowserRouter>
);