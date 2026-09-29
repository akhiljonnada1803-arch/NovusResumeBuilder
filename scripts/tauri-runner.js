#!/usr/bin/env node
const { spawn } = require("child_process");
const path = require("path");
const os = require("os");

// Automatically resolve Cargo and Rust binary path on Windows / macOS / Linux
const homeDir = os.homedir();
const cargoBinDir = path.join(homeDir, ".cargo", "bin");

const env = { ...process.env };
// On Windows, the env key can be Path or PATH
const currentPath = env.PATH || env.Path || "";

if (!currentPath.toLowerCase().includes(cargoBinDir.toLowerCase())) {
  const newPath = `${cargoBinDir}${path.delimiter}${currentPath}`;
  env.PATH = newPath;
  env.Path = newPath;
}

// Redirect Cargo target directory outside OneDrive to prevent Windows OS Error 32 file-locking
const localAppData = process.env.LOCALAPPDATA || path.join(homeDir, "AppData", "Local");
const safeTargetDir = path.join(localAppData, "novus-resume-ai-target");
env.CARGO_TARGET_DIR = safeTargetDir;

const args = process.argv.slice(2);
const npxCmd = process.platform === "win32" ? "npx.cmd" : "npx";

const child = spawn(npxCmd, ["@tauri-apps/cli", ...args], {
  stdio: "inherit",
  env,
  shell: true,
});

child.on("exit", (code) => {
  process.exit(code || 0);
});
