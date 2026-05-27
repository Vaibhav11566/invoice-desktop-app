import { Router } from "express";
import {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  uploadPayment,
} from "../controllers/invoice.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(protect);

router.get("/", getAllInvoices);
router.get("/:id", getInvoiceById);
router.post("/", uploadPayment, createInvoice);
router.put("/:id", uploadPayment, updateInvoice);
router.delete("/:id", adminOnly, deleteInvoice);

export default router;
