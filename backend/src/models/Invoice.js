import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  product_name: { type: String, required: true },
  description: { type: String, default: "" },
  quantity: { type: Number, required: true, min: 1 },
  unit_price: { type: Number, required: true, min: 0 },
  total: { type: Number, default: 0 },
});

const invoiceSchema = new mongoose.Schema(
  {
    invoice_number: { type: String, unique: true, sparse: true },
    client_name: { type: String, required: true },
    client_email: { type: String, default: "" },
    client_phone: { type: String, default: "" },
    shipping_address: { type: String, default: "" },
    items: [itemSchema],
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
      item.total = item.quantity * item.unit_price;
    });
    this.subtotal = this.items.reduce((sum, i) => sum + i.total, 0);
    this.tax_amount = (this.subtotal * (this.tax_percent || 0)) / 100;
    this.total_amount = this.subtotal + this.tax_amount;
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
