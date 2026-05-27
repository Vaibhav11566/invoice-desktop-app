import Datastore from "@seald-io/nedb";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Production: Electron sets process.env.DB_PATH to app.getPath('userData')
// Dev: store in backend/data/
const dbDir = process.env.DB_PATH
  ? path.join(process.env.DB_PATH, "invoice-db")
  : path.join(__dirname, "../../data");

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const usersDB = new Datastore({
  filename: path.join(dbDir, "users.db"),
  autoload: true,
});

export const invoicesDB = new Datastore({
  filename: path.join(dbDir, "invoices.db"),
  autoload: true,
});

// Unique indexes
usersDB.ensureIndex({ fieldName: "email", unique: true });
invoicesDB.ensureIndex({ fieldName: "invoice_number", sparse: true });

export default function connectDB() {
  console.log(`✅ NeDB initialized at: ${dbDir}`);
}
