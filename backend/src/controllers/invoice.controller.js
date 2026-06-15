import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import multer from "multer";
import Invoice from "../models/Invoice.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../../uploads/payments");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const random = Math.random().toString(36).substring(2, 8);
    cb(null, `payment-${Date.now()}-${random}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|pdf/;
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowed.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only images (jpg, png, gif, webp) and PDF files are allowed."));
  }
};

export const uploadPayment = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single("payment_screenshot");

// POST /api/invoices
export const createInvoice = async (req, res) => {
  try {
    let {
      client_name,
      client_email,
      client_phone,
      client_gst_no,
      client_state,
      shipping_address,
      items,
      tax_percent,
      document_type,
      purchase_type,
      payment_service,
      other_payment_service,
      transaction_id,
      remarks,
    } = req.body;

    if (!client_name) {
      return res.status(400).json({
        status: "fail",
        message: "Client name is required.",
      });
    }

    // Parse items if sent as JSON string (FormData)
    if (typeof items === "string") {
      items = JSON.parse(items);
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "At least one invoice item is required.",
      });
    }

    const invoiceData = {
      client_name,
      client_email: client_email || "",
      client_phone: client_phone || "",
      client_gst_no: client_gst_no || "",
      client_state: client_state || "",
      shipping_address: shipping_address || "",
      items,
      document_type: document_type || "Invoice",
      tax_percent: Number(tax_percent) || 0,
      purchase_type: purchase_type || "RePurchase",
      payment_service: payment_service || "",
      other_payment_service: other_payment_service || "",
      transaction_id: transaction_id || "",
      remarks: remarks || "",
      created_by: req.user._id,
    };

    if (req.file) {
      invoiceData.payment_screenshot = `/uploads/payments/${req.file.filename}`;
    }

    const invoice = await Invoice.create(invoiceData);

    return res.status(201).json({
      status: "success",
      message: "Invoice created successfully.",
      data: { invoice },
    });
  } catch (error) {
    console.error("Create invoice error:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to create invoice.",
    });
  }
};

// GET /api/invoices
export const getAllInvoices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { deleted_at: null };

    if (req.query.status) {
      filter.order_status = req.query.status;
    }

    if (req.query.payment_status) {
      filter.payment_status = req.query.payment_status;
    }

    if (req.query.search) {
      const regex = new RegExp(req.query.search, "i");
      filter.$or = [
        { invoice_number: regex },
        { client_name: regex },
        { client_email: regex },
      ];
    }

    // Non-admin: only own invoices
    if (req.user.role !== "admin") {
      filter.created_by = req.user._id;
    }

    const total = await Invoice.countDocuments(filter);
    const invoices = await Invoice.find(filter)
      .populate("created_by", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Global stats (not scoped by status filter)
    const baseFilter = { deleted_at: null };
    if (req.user.role !== "admin") baseFilter.created_by = req.user._id;

    const [totalIssued, totalCancelled, grossResult] = await Promise.all([
      Invoice.countDocuments({ ...baseFilter, order_status: { $ne: "Cancelled" } }),
      Invoice.countDocuments({ ...baseFilter, order_status: "Cancelled" }),
      Invoice.aggregate([
        { $match: filter },
        { $group: { _id: null, gross: { $sum: "$total_amount" } } },
      ]),
    ]);
    const totalGross = grossResult[0]?.gross || 0;

    return res.status(200).json({
      status: "success",
      message: "Invoices fetched successfully.",
      data: {
        invoices,
        stats: { totalIssued, totalCancelled, totalGross },
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get invoices error:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch invoices.",
    });
  }
};

// GET /api/invoices/:id
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      deleted_at: null,
    }).populate("created_by", "name email phone");

    if (!invoice) {
      return res.status(404).json({
        status: "fail",
        message: "Invoice not found.",
      });
    }

    // Non-admin can only see own invoices
    if (
      req.user.role !== "admin" &&
      invoice.created_by._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        status: "fail",
        message: "Access denied. You can only view your own invoices.",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Invoice fetched successfully.",
      data: { invoice },
    });
  } catch (error) {
    console.error("Get invoice error:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch invoice.",
    });
  }
};

// PUT /api/invoices/:id
export const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      deleted_at: null,
    });

    if (!invoice) {
      return res.status(404).json({
        status: "fail",
        message: "Invoice not found.",
      });
    }

    // Non-admin checks
    if (req.user.role !== "admin") {
      if (invoice.created_by.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          status: "fail",
          message: "Access denied. You can only edit your own invoices.",
        });
      }
      if (invoice.order_status !== "Pending") {
        return res.status(400).json({
          status: "fail",
          message: "You can only edit invoices with 'Pending' status.",
        });
      }
    }

    // Allowed fields
    const allowedFields = [
      "client_name",
      "client_email",
      "client_phone",
      "client_gst_no",
      "client_state",
      "shipping_address",
      "items",
      "document_type",
      "tax_percent",
      "order_status",
      "payment_status",
      "transaction_id",
      "payment_service",
      "other_payment_service",
      "purchase_type",
      "remarks",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "items" && typeof req.body[field] === "string") {
          invoice[field] = JSON.parse(req.body[field]);
        } else {
          invoice[field] = req.body[field];
        }
      }
    });

    if (req.file) {
      invoice.payment_screenshot = `/uploads/payments/${req.file.filename}`;
    }

    await invoice.save();

    return res.status(200).json({
      status: "success",
      message: "Invoice updated successfully.",
      data: { invoice },
    });
  } catch (error) {
    console.error("Update invoice error:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to update invoice.",
    });
  }
};

// DELETE /api/invoices/:id (admin only — soft delete)
export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      deleted_at: null,
    });

    if (!invoice) {
      return res.status(404).json({
        status: "fail",
        message: "Invoice not found.",
      });
    }

    invoice.deleted_at = new Date();
    await invoice.save();

    return res.status(200).json({
      status: "success",
      message: "Invoice deleted successfully.",
      data: null,
    });
  } catch (error) {
    console.error("Delete invoice error:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to delete invoice.",
    });
  }
};
