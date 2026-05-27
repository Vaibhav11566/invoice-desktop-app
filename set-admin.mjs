// Run from: C:\Users\ADMIN\invoice-desktop-app
// Uses backend's node_modules for @seald-io/nedb
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Point require to backend's node_modules
const require = createRequire(
  path.join(__dirname, "backend", "node_modules", "@seald-io", "nedb", "package.json")
);
const Datastore = require("@seald-io/nedb");

const usersDB = new Datastore({
  filename: path.join(__dirname, "backend", "data", "users.db"),
  autoload: true,
});

const email = "ishwar.admin@test.com";

usersDB.findOneAsync({ email }).then((user) => {
  if (!user) {
    console.error("User not found:", email);
    process.exit(1);
  }
  return usersDB.updateAsync(
    { email },
    { $set: { role: "admin" } },
    {}
  ).then((numUpdated) => {
    console.log(`Updated ${numUpdated} document(s).`);
    console.log(`User '${user.name}' (${email}) role set to 'admin'.`);
  });
}).catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
