import { v4 as uuidv4 } from "uuid";
import { invoicesDB, usersDB } from "../config/db.js";

// ─── helpers ──────────────────────────────────────────────────────────────────

function generateInvoiceNumber() {
  const now = new Date();
  const dateStr =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const uniquePart = uuidv4().replace(/-/g, "").substring(0, 8).toUpperCase();
  return `INV-${dateStr}-${uniquePart}`;
}

function recalculate(data) {
  const items = (data.items || []).map((item) => ({
    ...item,
    _id: item._id || uuidv4(),
    total: item.quantity * item.unit_price,
  }));
  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const taxPercent = Number(data.tax_percent) || 0;
  const tax_amount = (subtotal * taxPercent) / 100;
  const total_amount = subtotal + tax_amount;
  return { items, subtotal, tax_amount, total_amount };
}

async function joinUsers(docs) {
  if (!docs.length) return docs;
  const ids = [...new Set(docs.map((d) => d.created_by).filter(Boolean))];
  const users = await Promise.all(ids.map((id) => usersDB.findOneAsync({ _id: id })));
  const map = {};
  users.forEach((u) => {
    if (u) map[u._id] = { _id: u._id, name: u.name, email: u.email, phone: u.phone || "" };
  });
  return docs.map((doc) => ({
    ...doc,
    created_by: map[doc.created_by] ?? doc.created_by,
  }));
}

// Wrap a plain NeDB doc so it has a Mongoose-like .save() method.
function createInstance(doc) {
  const instance = { ...doc };
  const docId = doc._id;

  instance.save = async () => {
    // Recalculate numeric fields if items changed
    if (Array.isArray(instance.items)) {
      const calcs = recalculate(instance);
      instance.items = calcs.items;
      instance.subtotal = calcs.subtotal;
      instance.tax_amount = calcs.tax_amount;
      instance.total_amount = calcs.total_amount;
    }

    // Build update payload — skip functions and _id
    const updateData = {};
    for (const [k, v] of Object.entries(instance)) {
      if (k !== "_id" && typeof v !== "function") updateData[k] = v;
    }
    updateData.updatedAt = new Date();

    await invoicesDB.updateAsync({ _id: docId }, { $set: updateData });
    return instance;
  };

  return instance;
}

// ─── chainable query builder ───────────────────────────────────────────────────

class InvoiceQuery {
  constructor(filter, single = false) {
    this._filter = filter;
    this._single = single;
    this._doPopulate = false;
    this._sort = null;
    this._skip = 0;
    this._limit = 0;
  }

  populate(_field, _fields) {
    this._doPopulate = true;
    return this;
  }

  sort(spec) { this._sort = spec; return this; }
  skip(n) { this._skip = n; return this; }
  limit(n) { this._limit = n; return this; }

  then(resolve, reject) { return this._exec().then(resolve, reject); }
  catch(reject) { return this._exec().catch(reject); }

  async _exec() {
    if (this._single) {
      const doc = await invoicesDB.findOneAsync(this._filter);
      if (!doc) return null;
      const [populated] = this._doPopulate ? await joinUsers([doc]) : [doc];
      return createInstance(populated);
    }

    // Multi-doc cursor
    let cursor = invoicesDB.find(this._filter);
    if (this._sort)  cursor = cursor.sort(this._sort);
    if (this._skip)  cursor = cursor.skip(this._skip);
    if (this._limit) cursor = cursor.limit(this._limit);

    const docs = await cursor.execAsync();
    const final = this._doPopulate ? await joinUsers(docs) : docs;
    return final.map(createInstance);
  }
}

// ─── exported model ────────────────────────────────────────────────────────────

const Invoice = {
  find(filter) {
    return new InvoiceQuery(filter, false);
  },

  findOne(filter) {
    return new InvoiceQuery(filter, true);
  },

  async countDocuments(filter) {
    return invoicesDB.countAsync(filter);
  },

  async create(data) {
    const calcs = recalculate(data);
    const now = new Date();

    const doc = {
      invoice_number: generateInvoiceNumber(),
      client_name: data.client_name,
      client_email: data.client_email || "",
      client_phone: data.client_phone || "",
      shipping_address: data.shipping_address || "",
      items: calcs.items,
      subtotal: calcs.subtotal,
      tax_percent: Number(data.tax_percent) || 0,
      tax_amount: calcs.tax_amount,
      total_amount: calcs.total_amount,
      order_status: data.order_status || "Pending",
      payment_status: data.payment_status || "Pending",
      payment_screenshot: data.payment_screenshot || null,
      transaction_id: data.transaction_id || "",
      payment_service: data.payment_service || "",
      other_payment_service: data.other_payment_service || "",
      purchase_type: data.purchase_type || "RePurchase",
      remarks: data.remarks || "",
      created_by: data.created_by,
      deleted_at: null,
      createdAt: now,
      updatedAt: now,
    };

    const inserted = await invoicesDB.insertAsync(doc);
    return createInstance(inserted);
  },
};

export default Invoice;
