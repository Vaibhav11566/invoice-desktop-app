import mongoose from "mongoose";

const round2 = (v) => Math.round(v * 100) / 100;

const itemSchema = new mongoose.Schema({
  product_name: { type: String, required: true },
  description: { type: String, default: "" },
  hsn_no: { type: String, default: "" },
  batch: { type: String, default: "" },
  mfg_date: { type: String, default: "" },
  expiry_date: { type: String, default: "" },
  mrp: { type: Number, default: 0 },
  quantity: { type: Number, required: true, min: 1 },
  unit_price: { type: Number, required: true, min: 0 },
  sgst_percent: { type: Number, default: 2.5 },
  sgst_amount: { type: Number, default: 0 },
  cgst_percent: { type: Number, default: 2.5 },
  cgst_amount: { type: Number, default: 0 },
  igst_percent: { type: Number, default: 0 },
  igst_amount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
});

const invoiceSchema = new mongoose.Schema(
  {
    invoice_number: { type: String, unique: true, sparse: true },
    client_name: { type: String, required: true },
    client_email: { type: String, default: "" },
    client_phone: { type: String, default: "" },
    client_gst_no: { type: String, default: "" },
    client_state: { type: String, default: "" },
    shipping_address: { type: String, default: "" },
    items: [itemSchema],
    base_amount: { type: Number, default: 0 },
    total_gst: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    tax_percent: { type: Number, default: 0 },
    tax_amount: { type: Number, default: 0 },
    total_amount: { type: Number, default: 0 },
    order_status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    payment_status: {
      type: String,
      enum: ["Pending", "Verified", "Failed"],
      default: "Pending",
    },
    payment_screenshot: { type: String, default: null },
    transaction_id: { type: String, default: "" },
    payment_service: { type: String, default: "" },
    other_payment_service: { type: String, default: "" },
    document_type: { type: String, enum: ["Invoice", "Quotation"], default: "Invoice" },
    purchase_type: { type: String, default: "RePurchase" },
    remarks: { type: String, default: "" },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deleted_at: { type: Date, default: null },
  },
  { timestamps: true }
);

invoiceSchema.pre("save", function (next) {
  if (!this.invoice_number) {
    const now = new Date();
    const d =
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0");
    const rand = Math.random().toString(36).substring(2, 10).toUpperCase();
    this.invoice_number = `INV-${d}-${rand}`;
  }

  if (this.items && this.items.length > 0) {
    this.items.forEach((item) => {
      const base = item.quantity * item.unit_price;
      item.sgst_amount = round2(base * (item.sgst_percent || 0) / 100);
      item.cgst_amount = round2(base * (item.cgst_percent || 0) / 100);
      item.igst_amount = round2(base * (item.igst_percent || 0) / 100);
      item.total = round2(base + item.sgst_amount + item.cgst_amount + item.igst_amount);
    });

    this.base_amount = round2(this.items.reduce((s, i) => s + i.quantity * i.unit_price, 0));
    this.total_gst = round2(this.items.reduce((s, i) => s + i.sgst_amount + i.cgst_amount + i.igst_amount, 0));
    this.total_amount = round2(this.base_amount + this.total_gst);
    this.subtotal = this.base_amount;
    this.tax_amount = this.total_gst;
  }

  next();
});

invoiceSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Invoice", invoiceSchema);
