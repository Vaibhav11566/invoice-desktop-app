import { app, BrowserWindow, shell, ipcMain, dialog } from "electron";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isPacked = app.isPackaged;
let mainWindow = null;

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
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(
      path.join(app.getAppPath(), "frontend", "dist", "index.html")
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
  createWindow();

  ipcMain.handle("print-to-pdf", async (_event, invoiceNumber) => {
    try {
      const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
        defaultPath: `${invoiceNumber || "invoice"}.pdf`,
        filters: [{ name: "PDF Files", extensions: ["pdf"] }],
      });
      if (canceled || !filePath) return { success: false, reason: "canceled" };

      const pdfData = await mainWindow.webContents.printToPDF({
        pageSize: "A4",
        printBackground: true,
        landscape: false,
        margins: { marginType: "none" },
      });
      fs.writeFileSync(filePath, pdfData);
      return { success: true, filePath };
    } catch (err) {
      return { success: false, reason: err.message };
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
