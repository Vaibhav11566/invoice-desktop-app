import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiShoppingCart,
  FiCreditCard,
  FiInfo,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../api/axios.js";
import "./Invoices.css";

const emptyItem = () => ({
  product_name: "",
  description: "",
  quantity: 1,
  unit_price: 0,
});

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState(null);

  const [form, setForm] = useState({
    client_name: "",
    client_email: "",
    client_phone: "",
    shipping_address: "",
    items: [emptyItem()],
    tax_percent: 0,
    purchase_type: "RePurchase",
    payment_service: "",
    other_payment_service: "",
    transaction_id: "",
    remarks: "",
  });

  // Calculations
  const subtotal = form.items.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.unit_price),
    0
  );
  const taxAmount = (subtotal * Number(form.tax_percent)) / 100;
  const total = subtotal + taxAmount;

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateItem = (index, field, value) => {
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));
  };

  const removeItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const formatINR = (val) =>
    `₹${Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.client_name.trim()) {
      toast.error("Client name is required.");
      return;
    }
    for (const item of form.items) {
      if (!item.product_name.trim()) {
        toast.error("All items must have a product name.");
        return;
      }
      if (Number(item.unit_price) <= 0) {
        toast.error("All items must have a unit price greater than 0.");
        return;
      }
    }

    setLoading(true);
    try {
      let res;
      if (screenshotFile) {
        const formData = new FormData();
        Object.entries(form).forEach(([key, val]) => {
          if (key === "items") {
            formData.append("items", JSON.stringify(val));
          } else {
            formData.append(key, val);
          }
        });
        formData.append("payment_screenshot", screenshotFile);
        res = await api.post("/invoices", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await api.post("/invoices", form);
      }

      toast.success("Invoice created successfully! 🎉");
      navigate(`/invoices/${res.data.data.invoice._id}`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create invoice."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Create Invoice</h1>
          <p className="page-subtitle">Fill in the details below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Section 1 — Client Info */}
        <div className="form-section" style={{ marginBottom: 16 }}>
          <h3 className="form-section-title">
            <FiUser /> Client Information
          </h3>
          <div className="invoice-form-grid">
            <div className="form-group">
              <label>Client Name *</label>
              <input
                className="form-control"
                placeholder="Full name"
                value={form.client_name}
                onChange={(e) => updateField("client_name", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Client Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="email@example.com"
                value={form.client_email}
                onChange={(e) => updateField("client_email", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Client Phone</label>
              <input
                className="form-control"
                placeholder="+91 98765 43210"
                value={form.client_phone}
                onChange={(e) => updateField("client_phone", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Purchase Type</label>
              <select
                className="form-control"
                value={form.purchase_type}
                onChange={(e) => updateField("purchase_type", e.target.value)}
              >
                <option value="RePurchase">Re-Purchase</option>
                <option value="NewJoining">New Joining</option>
              </select>
            </div>
            <div className="form-group form-full">
              <label>Shipping Address</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Full shipping address"
                value={form.shipping_address}
                onChange={(e) =>
                  updateField("shipping_address", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        {/* Section 2 — Invoice Items */}
        <div className="form-section" style={{ marginBottom: 16 }}>
          <h3 className="form-section-title">
            <FiShoppingCart /> Invoice Items
          </h3>

          <div className="items-section">
            <div className="items-header">
              <span>Product / Service</span>
              <span>Qty</span>
              <span>Unit Price (₹)</span>
              <span style={{ textAlign: "right" }}>Total</span>
              <span></span>
            </div>

            {form.items.map((item, idx) => (
              <div className="items-row" key={idx}>
                <div className="item-product-wrap">
                  <input
                    className="form-control"
                    placeholder="Product name *"
                    value={item.product_name}
                    onChange={(e) =>
                      updateItem(idx, "product_name", e.target.value)
                    }
                  />
                  <input
                    className="form-control"
                    placeholder="Description (optional)"
                    value={item.description}
                    onChange={(e) =>
                      updateItem(idx, "description", e.target.value)
                    }
                    style={{ fontSize: 12, marginTop: 4 }}
                  />
                </div>
                <input
                  type="number"
                  className="form-control"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(idx, "quantity", e.target.value)
                  }
                />
                <input
                  type="number"
                  className="form-control"
                  min={0}
                  step="0.01"
                  value={item.unit_price}
                  onChange={(e) =>
                    updateItem(idx, "unit_price", e.target.value)
                  }
                />
                <div className="item-total">
                  {formatINR(
                    Number(item.quantity) * Number(item.unit_price)
                  )}
                </div>
                <button
                  type="button"
                  className="remove-item-btn"
                  onClick={() => removeItem(idx)}
                  disabled={form.items.length === 1}
                  style={{
                    opacity: form.items.length === 1 ? 0 : 1,
                    pointerEvents: form.items.length === 1 ? "none" : "auto",
                  }}
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}

            <button type="button" className="add-item-btn" onClick={addItem}>
              <FiPlus /> Add Item
            </button>
          </div>

          {/* Totals */}
          <div className="totals-wrap">
            <div className="totals-box">
              <div className="totals-row">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div className="totals-row">
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  Tax
                  <input
                    type="number"
                    className="tax-input-inline"
                    min={0}
                    max={100}
                    step="0.1"
                    value={form.tax_percent}
                    onChange={(e) => updateField("tax_percent", e.target.value)}
                  />
                  %
                </span>
                <span>{formatINR(taxAmount)}</span>
              </div>
              <div className="totals-row total">
                <span>Total Amount</span>
                <span>{formatINR(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3 — Payment Info */}
        <div className="form-section" style={{ marginBottom: 16 }}>
          <h3 className="form-section-title">
            <FiCreditCard /> Payment Information
          </h3>
          <div className="invoice-form-grid">
            <div className="form-group">
              <label>Payment Service</label>
              <select
                className="form-control"
                value={form.payment_service}
                onChange={(e) =>
                  updateField("payment_service", e.target.value)
                }
              >
                <option value="">— Select —</option>
                <option value="UPI">UPI</option>
                <option value="BankTransfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {form.payment_service === "Other" && (
              <div className="form-group">
                <label>Specify Service</label>
                <input
                  className="form-control"
                  placeholder="e.g. Paytm, PhonePe..."
                  value={form.other_payment_service}
                  onChange={(e) =>
                    updateField("other_payment_service", e.target.value)
                  }
                />
              </div>
            )}
            <div className="form-group">
              <label>Transaction ID</label>
              <input
                className="form-control"
                placeholder="Transaction reference"
                value={form.transaction_id}
                onChange={(e) =>
                  updateField("transaction_id", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>Payment Screenshot</label>
              <input
                type="file"
                className="form-control"
                accept="image/*,.pdf"
                onChange={(e) => setScreenshotFile(e.target.files[0])}
              />
            </div>
          </div>
        </div>

        {/* Section 4 — Additional Info */}
        <div className="form-section" style={{ marginBottom: 16 }}>
          <h3 className="form-section-title">
            <FiInfo /> Additional Information
          </h3>
          <div className="form-group">
            <label>Remarks</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Any additional notes or remarks..."
              value={form.remarks}
              onChange={(e) => updateField("remarks", e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate("/invoices")}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Invoice"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;
