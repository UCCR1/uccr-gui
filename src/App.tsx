import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {

  const [devices, setDevices] = useState<string[]>([]);

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    invoke<string[]>("get_devices").then(devices => setDevices(devices));
  }, []);

  return (
    <main>
      <h1>Welcome to UCCR GUI</h1>
      {connected ? <h2>Conncted</h2> : <><h2>Devices:</h2>

      {devices.map(device => <button onClick={() => invoke("connect", { port: device }).then(() => setConnected(true))} className="bg-slate-300 p-2 rounded-md hover:bg-slate-400 cursor-pointer">{device}</button>)}
   </>} </main>
  );
}

export default App;
