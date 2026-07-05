const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  printToPDF: (invoiceNumber) => ipcRenderer.invoke("print-to-pdf", invoiceNumber),
});
