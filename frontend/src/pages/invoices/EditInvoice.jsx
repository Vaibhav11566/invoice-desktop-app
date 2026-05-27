import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiUser,
  FiShoppingCart,
  FiCreditCard,
  FiInfo,
  FiCheckCircle,
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

const EditInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [screenshotFile, setScreenshotFile] = useState(null);

  const [form, setForm] = useState({
    client_name: "",
    client_email: "",
    client_phone: "",
    shipping_address: "",
    items: [emptyItem()],
    tax_percent: 0,
    purchase_type: "RePurchase",
    order_status: "Pending",
    payment_status: "Pending",
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

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await api.get(`/invoices/${id}`);
        const inv = res.data.data.invoice;
        setForm({
          client_name: inv.client_name || "",
          client_email: inv.client_email || "",
          client_phone: inv.client_phone || "",
          shipping_address: inv.shipping_address || "",
          items:
            inv.items?.length > 0
              ? inv.items.map((item) => ({
                  product_name: item.product_name || "",
                  description: item.description || "",
                  quantity: item.quantity || 1,
                  unit_price: item.unit_price || 0,
                }))
              : [emptyItem()],
          tax_percent: inv.tax_percent || 0,
          purchase_type: inv.purchase_type || "RePurchase",
          order_status: inv.order_status || "Pending",
          payment_status: inv.payment_status || "Pending",
          payment_service: inv.payment_service || "",
          other_payment_service: inv.other_payment_service || "",
          transaction_id: inv.transaction_id || "",
          remarks: inv.remarks || "",
        });
      } catch (error) {
        toast.error(error.response?.data?.message || "Invoice not found.");
        navigate("/invoices");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchInvoice();
  }, [id, navigate]);

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
    }

    setLoading(true);
    try {
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
        await api.put(`/invoices/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.put(`/invoices/${id}`, form);
      }

      toast.success("Invoice updated successfully! ✅");
      navigate(`/invoices/${id}`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update invoice."
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Edit Invoice</h1>
          <p className="page-subtitle">Update the invoice details</p>
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

        {/* Section 2 — Status (edit only) */}
        <div className="form-section" style={{ marginBottom: 16 }}>
          <h3 className="form-section-title">
            <FiCheckCircle /> Status
          </h3>
          <div className="invoice-form-grid">
            <div className="form-group">
              <label>Order Status</label>
              <select
                className="form-control"
                value={form.order_status}
                onChange={(e) => updateField("order_status", e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="form-group">
              <label>Payment Status</label>
              <select
                className="form-control"
                value={form.payment_status}
                onChange={(e) =>
                  updateField("payment_status", e.target.value)
                }
              >
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3 — Invoice Items */}
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
                    onChange={(e) =>
                      updateField("tax_percent", e.target.value)
                    }
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

        {/* Section 4 — Payment Info */}
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
              <label>Upload New Screenshot</label>
              <input
                type="file"
                className="form-control"
                accept="image/*,.pdf"
                onChange={(e) => setScreenshotFile(e.target.files[0])}
              />
            </div>
          </div>
        </div>

        {/* Section 5 — Additional Info */}
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
            onClick={() => navigate(`/invoices/${id}`)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditInvoice;
