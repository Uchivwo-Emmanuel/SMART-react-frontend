import React from "react";
import ReactDOM from "react-dom/client";
import { initCsrf } from "./api/axiosInstance";
import App from "./App";
import "./index.css"; // tailwind already imported here

initCsrf().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
