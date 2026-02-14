import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import "./App.css";
import MapComponent from "./components/map";
import { Button } from "./components/ui/button";

function App() {
    const [devices, setDevices] = useState<string[]>([]);

    const [connected, setConnected] = useState(false);

    useEffect(() => {
        invoke<string[]>("get_devices").then((devices) => setDevices(devices));
    }, []);

    return (
        <main className="h-screen pt-10">
            <MapComponent />
        </main>
    );
}

export default App;
