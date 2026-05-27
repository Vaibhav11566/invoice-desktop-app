import bcrypt from "bcryptjs";
import { usersDB } from "../config/db.js";

// Attach instance methods to a plain doc object.
// includePassword=false → password property is deleted before returning.
function wrapUser(doc, includePassword = false) {
  if (!doc) return null;

  const passwordHash = doc.password; // keep in closure for comparePassword
  const instance = { ...doc };
  if (!includePassword) delete instance.password;

  instance.comparePassword = async (entered) =>
    bcrypt.compare(entered, passwordHash);

  // Called by JSON.stringify / res.json() — strips password + methods
  instance.toJSON = () => {
    const obj = { ...doc };
    delete obj.password;
    return obj;
  };

  return instance;
}

// Returns a thenable that also exposes a .select() method (Mongoose compat).
// .select("+password") forces the returned doc to include the password hash.
function makeQuery(query) {
  let withPassword = false;

  const thenable = {
    then(resolve, reject) {
      usersDB
        .findOneAsync(query)
        .then((doc) => wrapUser(doc, withPassword))
        .then(resolve, reject);
    },
    catch(reject) {
      usersDB
        .findOneAsync(query)
        .then((doc) => wrapUser(doc, withPassword))
        .catch(reject);
    },
    select(fields) {
      if (typeof fields === "string" && fields.includes("+password")) {
        withPassword = true;
      }
      return thenable; // chainable no-op
    },
  };

  return thenable;
}

const User = {
  /** Mongoose-compatible: User.findOne({ email }).select("+password") */
  findOne(query) {
    return makeQuery(query);
  },

  /** Mongoose-compatible: User.findById(id) */
  async findById(id) {
    const doc = await usersDB.findOneAsync({ _id: id });
    return wrapUser(doc, false);
  },

  /** Creates a user — hashes password automatically */
  async create({ name, email, password, phone, role }) {
    if (!name || !email || !password) {
      throw new Error("Name, email, and password are required.");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const now = new Date();
    const doc = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || "",
      role: role || "user",
      is_active: true,
      createdAt: now,
      updatedAt: now,
    };

    const inserted = await usersDB.insertAsync(doc);
    return wrapUser(inserted, false); // never expose password on create
  },
};

export default User;
