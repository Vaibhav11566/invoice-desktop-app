import { app, BrowserWindow, shell, dialog } from "electron";
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// app.isPackaged = true  →  built .exe  (electron-builder)
// app.isPackaged = false →  dev mode    (npm run dev)
const isPacked = app.isPackaged;

let mainWindow = null;

/**
 * Production only: import the Express backend inline inside Electron's Node runtime.
 * In dev, the backend is already running via `npm run backend` (concurrently).
 */
async function startBackend() {
  if (!isPacked) return; // dev: concurrently already started it

  try {
    const backendEntry = path.join(
      process.resourcesPath, // ..\resources\  (outside asar)
      "backend",
      "server.js"
    );
    await import(pathToFileURL(backendEntry).href);
    console.log("✅ Backend started (inline)");
  } catch (err) {
    console.error("❌ Backend failed to start:", err);
    dialog.showErrorBox(
      "Backend Startup Error",
      `Server could not start:\n\n${err.message}`
    );
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "Invoice Manager",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "electron-preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (!isPacked) {
    // Dev: load Vite dev server
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    // Production: load built frontend from asar
    mainWindow.loadFile(
      path.join(__dirname, "frontend", "dist", "index.html")
    );
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(async () => {
  await startBackend();
  // Give backend 1.5s to bind the port before opening window
  setTimeout(createWindow, isPacked ? 1500 : 0);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
