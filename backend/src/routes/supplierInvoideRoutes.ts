import express from "express";
import { protect, restrictTo } from "../controllers/authController";
import {
  addBoughtItem,
  createSupplierInvoice,
  deleteSupplerInvoice,
  deleteSupplierItem,
  getAllSupplierInvoices,
  getSupplierInvoice,
  updateSupplierInvoice,
  updateSupplierItem,
} from "../controllers/supplierInvoiceController";
import { validate } from "../middleware/validateMiddleware";
import {
  addBoughtItemSchema,
  createSupplierInvoiceSchema,
  deleteSupplierItemSchema,
  updateSupplierInvoiceSchema,
  updateSupplierItemSchema,
  deleteSupplierInvoiceSchema, // Added for completeness
} from "../validators/supplierInvoiceValidator";
import { paramIdSchema } from "../validators/commen";

const router = express.Router();

// Globally protect all supplier invoice endpoints
router.use(protect, restrictTo("admin"));

// ==========================================
// 📦 Nested Invoice Item Routes
// ==========================================

// Add a brand new item to an existing invoice
router.post("/:id/items", validate(addBoughtItemSchema), addBoughtItem);

// Update or remove a specific item inside an invoice
router
  .route("/:id/items/:prodcutId")
  .patch(validate(updateSupplierItemSchema), updateSupplierItem)
  .delete(validate(deleteSupplierItemSchema), deleteSupplierItem);

// ==========================================
// 🧾 Root Supplier Invoice Routes
// ==========================================

router
  .route("/")
  .get(getAllSupplierInvoices)
  .post(validate(createSupplierInvoiceSchema), createSupplierInvoice);

router
  .route("/:id")
  .get(validate(paramIdSchema), getSupplierInvoice)
  .patch(validate(updateSupplierInvoiceSchema), updateSupplierInvoice)
  .delete(validate(deleteSupplierInvoiceSchema), deleteSupplerInvoice);

export default router;
