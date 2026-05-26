use crate::services;

#[tauri::command]
pub(crate) fn opened_urls(app: tauri::AppHandle) -> Vec<tauri::Url> {
    services::file_service::get_opened_urls(&app)
}
