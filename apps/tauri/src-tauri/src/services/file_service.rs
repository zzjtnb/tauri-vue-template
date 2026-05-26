use tauri::Manager;

use crate::state::AppState;

pub(crate) fn get_opened_urls(app: &tauri::AppHandle) -> Vec<tauri::Url> {
    app.state::<AppState>().opened_urls()
}

#[cfg(any(target_os = "macos", target_os = "ios"))]
pub(crate) fn handle_run_event(app: &tauri::AppHandle, event: tauri::RunEvent) {
    if let tauri::RunEvent::Opened { urls } = event {
        use tauri::Emitter;

        app.state::<AppState>().extend_opened_urls(urls.clone());
        let _ = app.emit("opened", urls);
    }
}

#[cfg(not(any(target_os = "macos", target_os = "ios")))]
pub(crate) fn handle_run_event(_: &tauri::AppHandle, _: tauri::RunEvent) {}
