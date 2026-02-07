use std::{sync::Mutex, time::Duration};
use tauri::State;
use vex_v5_serial::serial::{find_devices, SerialConnection};

#[tauri::command]
fn get_devices() -> Result<Vec<String>, String> {
    let devices = find_devices().map_err(|e| e.to_string())?;

    let ports = devices.iter().map(|x| x.system_port());

    Ok(ports.collect())
}

#[tauri::command]
async fn connect(port: String, state: State<'_, Mutex<AppState>>) -> Result<(), String> {
    // This function must be marked as async for SerialDevice::connect() to work

    let devices = find_devices().map_err(|e| e.to_string())?;

    let device = devices
        .into_iter()
        .find(|device| device.system_port() == port)
        .ok_or(format!("No Vex device found at port {port}"))?;

    let connection = device
        .connect(Duration::from_secs(1))
        .map_err(|e| e.to_string())?;

    state.lock().unwrap().connection = Some(connection);

    Ok(())
}

#[derive(Default)]
struct AppState {
    connection: Option<SerialConnection>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(Mutex::new(AppState::default()))
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_devices, connect])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
