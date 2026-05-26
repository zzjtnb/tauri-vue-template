mod commands;
mod services;
mod state;

use commands::*;
use services::*;
use state::AppState;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("你好，{}！这条消息来自 Rust。", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default().manage(AppState::default());

    #[cfg(not(target_env = "ohos"))]
    let builder = builder
        .plugin(tauri_plugin_upload::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init());

    builder
        .invoke_handler(tauri::generate_handler![greet, opened_urls])
        .setup(|_app| {
            #[cfg(desktop)]
            {
                _app.handle()
                    .plugin(tauri_plugin_window_state::Builder::new().build())?;
                _app.handle()
                    .plugin(tauri_plugin_updater::Builder::new().build())?;
                _app.handle()
                    .plugin(tauri_plugin_autostart::Builder::new().build())?;
            }

            #[cfg(all(debug_assertions, not(target_env = "ohos")))]
            {
                _app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(handle_run_event);
}
