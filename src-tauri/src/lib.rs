use base64::{engine::general_purpose, Engine as _};
use serde::{Deserialize, Serialize};
use std::fs;
use tauri::{
    menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder},
    AppHandle,
};

#[derive(Debug, Serialize, Deserialize)]
pub struct DesktopAppInfo {
    pub name: String,
    pub version: String,
    pub platform: String,
    pub arch: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NativeFileResult {
    pub success: bool,
    pub path: Option<String>,
    pub error: Option<String>,
}

#[tauri::command]
fn get_desktop_info() -> DesktopAppInfo {
    DesktopAppInfo {
        name: "Novus Resume AI".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        platform: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
    }
}

#[tauri::command]
async fn save_native_file(
    app: AppHandle,
    file_name: String,
    content_base64: String,
) -> Result<NativeFileResult, String> {
    use tauri_plugin_dialog::DialogExt;

    let file_path = app
        .dialog()
        .file()
        .set_file_name(&file_name)
        .blocking_save_file();

    if let Some(path) = file_path {
        let path_str = path.to_string();
        match base64_decode(&content_base64) {
            Ok(bytes) => {
                if let Err(e) = fs::write(&path_str, bytes) {
                    return Ok(NativeFileResult {
                        success: false,
                        path: None,
                        error: Some(format!("Failed to write file: {}", e)),
                    });
                }
                Ok(NativeFileResult {
                    success: true,
                    path: Some(path_str),
                    error: None,
                })
            }
            Err(e) => Ok(NativeFileResult {
                success: false,
                path: None,
                error: Some(format!("Invalid base64 payload: {}", e)),
            }),
        }
    } else {
        Ok(NativeFileResult {
            success: false,
            path: None,
            error: Some("Save cancelled by user".to_string()),
        })
    }
}

#[tauri::command]
async fn open_external_browser(url: String) -> Result<(), String> {
    // Use OS default browser via std::process (avoids deprecated shell.open)
    #[cfg(target_os = "windows")]
    std::process::Command::new("cmd")
        .args(["/c", "start", &url])
        .spawn()
        .map_err(|e| e.to_string())?;
    #[cfg(target_os = "macos")]
    std::process::Command::new("open")
        .arg(&url)
        .spawn()
        .map_err(|e| e.to_string())?;
    #[cfg(target_os = "linux")]
    std::process::Command::new("xdg-open")
        .arg(&url)
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}

fn base64_decode(input: &str) -> Result<Vec<u8>, String> {
    general_purpose::STANDARD
        .decode(input.trim())
        .map_err(|e| format!("Base64 decode error: {}", e))
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_updater::Builder::default().build())
        .setup(|app| {
            // Build Native Application Menu
            let handle = app.handle();
            let file_menu = SubmenuBuilder::new(handle, "File")
                .item(&MenuItemBuilder::with_id("new_resume", "New Resume").accelerator("CmdOrCtrl+N").build(handle)?)
                .item(&MenuItemBuilder::with_id("import_resume", "Import Resume (PDF/Word)...").accelerator("CmdOrCtrl+O").build(handle)?)
                .separator()
                .item(&MenuItemBuilder::with_id("export_pdf", "Export Active Resume to PDF...").accelerator("CmdOrCtrl+P").build(handle)?)
                .separator()
                .quit()
                .build()?;

            let edit_menu = SubmenuBuilder::new(handle, "Edit")
                .undo()
                .redo()
                .separator()
                .cut()
                .copy()
                .paste()
                .select_all()
                .build()?;

            let tools_menu = SubmenuBuilder::new(handle, "Tools")
                .item(&MenuItemBuilder::with_id("nav_dashboard", "Dashboard").accelerator("CmdOrCtrl+1").build(handle)?)
                .item(&MenuItemBuilder::with_id("nav_portfolio", "Portfolio Studio").accelerator("CmdOrCtrl+2").build(handle)?)
                .item(&MenuItemBuilder::with_id("nav_ats", "ATS Match Scanner").accelerator("CmdOrCtrl+3").build(handle)?)
                .item(&MenuItemBuilder::with_id("nav_career", "Career Intel").accelerator("CmdOrCtrl+4").build(handle)?)
                .item(&MenuItemBuilder::with_id("nav_coach", "Interview Coach").accelerator("CmdOrCtrl+5").build(handle)?)
                .build()?;

            let view_menu = SubmenuBuilder::new(handle, "View")
                .fullscreen()
                .separator()
                .item(&MenuItemBuilder::with_id("zoom_in", "Zoom In").accelerator("CmdOrCtrl+Plus").build(handle)?)
                .item(&MenuItemBuilder::with_id("zoom_out", "Zoom Out").accelerator("CmdOrCtrl+-").build(handle)?)
                .item(&MenuItemBuilder::with_id("zoom_reset", "Reset Zoom").accelerator("CmdOrCtrl+0").build(handle)?)
                .build()?;

            let help_menu = SubmenuBuilder::new(handle, "Help")
                .item(&MenuItemBuilder::with_id("help_docs", "Novus Documentation").build(handle)?)
                .item(&MenuItemBuilder::with_id("help_setup", "Launch Setup Wizard").build(handle)?)
                .item(&MenuItemBuilder::with_id("help_about", "About Novus Resume AI").build(handle)?)
                .build()?;

            let menu = MenuBuilder::new(handle)
                .items(&[&file_menu, &edit_menu, &tools_menu, &view_menu, &help_menu])
                .build()?;

            app.set_menu(menu)?;

            // Deep link registration is handled automatically by tauri_plugin_deep_link::init()
            // The frontend listens for the 'deep-link://new-url' event via the plugin's JS API.

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_desktop_info,
            save_native_file,
            open_external_browser
        ])
        .run(tauri::generate_context!())
        .expect("error while running Novus Resume AI desktop application");
}
