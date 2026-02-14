import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import { ThemeProvider } from "./components/theme-provider";
import TitleBar from "./components/title-bar";
import { store } from "./state";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <Provider store={store}>
            <ThemeProvider>
                <TitleBar />
                <App />
            </ThemeProvider>
        </Provider>
    </React.StrictMode>,
);
