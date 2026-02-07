import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import "./App.css";
import { Button } from "./components/ui/button";

function App() {
    const [devices, setDevices] = useState<string[]>([]);

    const [connected, setConnected] = useState(false);

    useEffect(() => {
        invoke<string[]>("get_devices").then((devices) => setDevices(devices));
    }, []);

    return (
        <main>
            <h1>Welcome to UCCR GUI</h1>
            <Button>Hello There</Button>
            {connected ? (
                <h2>Conncted</h2>
            ) : (
                <>
                    <h2>Devices:</h2>

                    {devices.map((device) => (
                        <button
                            key={device}
                            type="button"
                            onClick={() =>
                                invoke("connect", { port: device }).then(() =>
                                    setConnected(true),
                                )
                            }
                            className="bg-slate-300 p-2 rounded-md hover:bg-slate-400 cursor-pointer"
                        >
                            {device}
                        </button>
                    ))}
                </>
            )}{" "}
        </main>
    );
}

export default App;
