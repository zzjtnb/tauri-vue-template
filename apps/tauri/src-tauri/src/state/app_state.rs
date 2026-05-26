use std::sync::Mutex;

#[derive(Default)]
pub(crate) struct AppState {
    opened_urls: Mutex<Vec<tauri::Url>>,
}

impl AppState {
    pub(crate) fn opened_urls(&self) -> Vec<tauri::Url> {
        self.opened_urls.lock().unwrap().clone()
    }

    #[cfg(any(target_os = "macos", target_os = "ios"))]
    pub(crate) fn extend_opened_urls(&self, urls: Vec<tauri::Url>) {
        self.opened_urls.lock().unwrap().extend(urls);
    }
}
