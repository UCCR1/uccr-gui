import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import TitleBar from "./components/title-bar";
import { ThemeProvider } from "./components/theme-provider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <ThemeProvider>
            <TitleBar />
            <App />
        </ThemeProvider>
    </React.StrictMode>,
);
