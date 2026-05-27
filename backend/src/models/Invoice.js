import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const itemSchema = new mongoose.Schema(
  {
    product_name: {
      type: String,
      required: [true, "Product name is required"],
    },
    description: {
      type: String,
      default: "",
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },
    unit_price: {
      type: Number,
      required: [true, "Unit price is required"],
      min: [0, "Unit price cannot be negative"],
    },
    total: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoice_number: {
      type: String,
      unique: true,
    },
    client_name: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },
    client_email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },
    client_phone: {
      type: String,
      trim: true,
      default: "",
    },
    shipping_address: {
      type: String,
      trim: true,
      default: "",
    },
    items: {
      type: [itemSchema],
      default: [],
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    tax_percent: {
      type: Number,
      default: 0,
    },
    tax_amount: {
      type: Number,
      default: 0,
    },
    total_amount: {
      type: Number,
      default: 0,
    },
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
    payment_screenshot: {
      type: String,
      default: null,
    },
    transaction_id: {
      type: String,
      trim: true,
      default: "",
    },
    payment_service: {
      type: String,
      enum: ["UPI", "BankTransfer", "Cash", "Card", "Other", ""],
      default: "",
    },
    other_payment_service: {
      type: String,
      trim: true,
      default: "",
    },
    purchase_type: {
      type: String,
      enum: ["NewJoining", "RePurchase"],
      default: "RePurchase",
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Pre-save hook: auto invoice_number + calculations
invoiceSchema.pre("save", function (next) {
  // Auto-generate invoice_number if not set
  if (!this.invoice_number) {
    const now = new Date();
    const dateStr =
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0");
    const uniquePart = uuidv4().replace(/-/g, "").substring(0, 8).toUpperCase();
    this.invoice_number = `INV-${dateStr}-${uniquePart}`;
  }

  // Calculate item totals
  this.items.forEach((item) => {
    item.total = item.quantity * item.unit_price;
  });

  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);

  // Calculate tax and total
  this.tax_amount = (this.subtotal * this.tax_percent) / 100;
  this.total_amount = this.subtotal + this.tax_amount;

  next();
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;
