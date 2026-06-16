import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiTrash2, FiEye } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../api/axios.js";
import InvoiceTemplate from "./InvoiceTemplate.jsx";
import { useBusiness } from "../../context/BusinessContext.jsx";
import "./Invoices.css";

const emptyItem = () => ({
  product_name: "",
  hsn_no: "",
  batch: "",
  mfg_date: "",
  expiry_date: "",
  mrp: 0,
  unit_price: 0,
  quantity: 1,
  sgst_percent: 2.5,
  cgst_percent: 2.5,
  igst_percent: 0,
});

const round2 = (v) => Math.round(v * 100) / 100;

const calcItem = (item) => {
  const base = Number(item.quantity) * Number(item.unit_price);
  const sgst = round2((base * Number(item.sgst_percent)) / 100);
  const cgst = round2((base * Number(item.cgst_percent)) / 100);
  const igst = round2((base * Number(item.igst_percent)) / 100);
  return { base, sgst, cgst, igst, total: round2(base + sgst + cgst + igst) };
};

const fmt = (val) =>
  `₹${Number(val || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

const todayStr = () =>
  new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const CreateInvoice = () => {
  const navigate = useNavigate();
  const { business } = useBusiness();
  const [loading, setLoading] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState(null);

  const [form, setForm] = useState({
    document_type: "Invoice",
    client_name: "",
    client_phone: "",
    shipping_address: "",
    client_gst_no: "",
    client_state: "",
    client_email: "",
    items: [emptyItem()],
  });

  const totals = useMemo(
    () =>
      form.items.reduce(
        (acc, item) => {
          const c = calcItem(item);
          return {
            base: acc.base + c.base,
            sgst: acc.sgst + c.sgst,
            cgst: acc.cgst + c.cgst,
            igst: acc.igst + c.igst,
            total: acc.total + c.total,
          };
        },
        { base: 0, sgst: 0, cgst: 0, igst: 0, total: 0 }
      ),
    [form.items]
  );

  const updateField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateItem = (index, field, value) =>
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });

  const addItem = () =>
    setForm((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));

  const removeItem = (index) =>
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));

  const openPreview = () => {
    setPreviewInvoice({
      invoice_number: "PREVIEW",
      createdAt: new Date().toISOString(),
      document_type: form.document_type,
      client_name: form.client_name,
      client_phone: form.client_phone,
      client_email: form.client_email,
      client_gst_no: form.client_gst_no,
      client_state: form.client_state,
      shipping_address: form.shipping_address,
      items: form.items.map((item) => {
        const c = calcItem(item);
        return { ...item, sgst_amount: c.sgst, cgst_amount: c.cgst, igst_amount: c.igst, total: c.total };
      }),
      base_amount: totals.base,
      total_gst: round2(totals.sgst + totals.cgst + totals.igst),
      total_amount: totals.total,
    });
  };

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
        toast.error("All items must have a rate greater than 0.");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await api.post("/invoices", form);
      toast.success("Invoice created successfully!");
      navigate(`/invoices/${res.data.data.invoice._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create invoice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {previewInvoice && (
        <InvoiceTemplate
          invoice={previewInvoice}
          onClose={() => setPreviewInvoice(null)}
        />
      )}

      {/* Top bar */}
      <div className="inv-create-topbar">
        <div className="inv-create-biz-selector">
          <span className="inv-create-biz-label">Business (seller on invoice):</span>
          <select className="form-control inv-create-biz-select">
            <option>{business.name}</option>
          </select>
        </div>
        <div className="inv-create-doctype">
          <span className="inv-create-biz-label">Document type:</span>
          <div className="doc-type-toggle">
            <button
              type="button"
              className={`doc-type-btn ${form.document_type === "Invoice" ? "active" : ""}`}
              onClick={() => updateField("document_type", "Invoice")}
            >
              Invoice
            </button>
            <button
              type="button"
              className={`doc-type-btn ${form.document_type === "Quotation" ? "active" : ""}`}
              onClick={() => updateField("document_type", "Quotation")}
            >
              Quotation
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Business Info Card */}
        <div className="inv-biz-card">
          <div className="inv-biz-card-left">
            {business.logo && (
              <img src={business.logo} alt="logo" className="inv-biz-card-logo" />
            )}
            <div>
              <div className="inv-biz-card-name">{business.name}</div>
              <div className="inv-biz-card-line">{business.address}</div>
              <div className="inv-biz-card-line">Phone No.: {business.phone}</div>
              <div className="inv-biz-card-line">E-mail: {business.email}</div>
              <div className="inv-biz-card-line">GSTIN: {business.gstin}</div>
              <div className="inv-biz-card-line">PAN No.: {business.pan}</div>
            </div>
          </div>
          <div className="inv-biz-card-right">
            <div className="inv-biz-card-date">{todayStr()}</div>
            <div className="inv-biz-card-date-note">
              Set automatically when the document is first saved; not editable here.
            </div>
          </div>
        </div>

        {/* Consignee Details */}
        <div className="form-section" style={{ marginBottom: 16 }}>
          <h3 className="form-section-title">Consignee Details (Shipped to)</h3>
          <div className="invoice-form-grid">
            <div className="form-group">
              <label>Name</label>
              <input
                className="form-control"
                placeholder="Consignee / Customer name"
                value={form.client_name}
                onChange={(e) => updateField("client_name", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Phone No.</label>
              <input
                className="form-control"
                placeholder="Phone number"
                value={form.client_phone}
                onChange={(e) => updateField("client_phone", e.target.value)}
              />
            </div>
            <div className="form-group form-full">
              <label>Address</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Full address"
                value={form.shipping_address}
                onChange={(e) => updateField("shipping_address", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>GST No.</label>
              <input
                className="form-control"
                placeholder="GST number"
                value={form.client_gst_no}
                onChange={(e) => updateField("client_gst_no", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>State (e.g. Haryana Code: 06)</label>
              <input
                className="form-control"
                placeholder="State and code"
                value={form.client_state}
                onChange={(e) => updateField("client_state", e.target.value)}
              />
            </div>
            <div className="form-group form-full">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                value={form.client_email}
                onChange={(e) => updateField("client_email", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Item Details */}
        <div className="form-section" style={{ marginBottom: 16 }}>
          <div className="inv-items-title-row">
            <h3 className="form-section-title" style={{ margin: 0, border: "none", padding: 0 }}>
              Item Details
            </h3>
            <button type="button" className="inv-add-item-link" onClick={addItem}>
              + Add item
            </button>
          </div>
          <p className="inv-items-hint">
            Pick a product to fill MRP, rate (DP), and HSN; you can still edit all columns.
          </p>

          <div className="gst-tbl-wrap">
            <table className="gst-tbl">
              <thead>
                <tr>
                  <th>SR. NO.</th>
                  <th>QTY</th>
                  <th>ITEM NAME</th>
                  <th>HSN NO.</th>
                  <th>BATCH</th>
                  <th>MFG</th>
                  <th>EXPIRY</th>
                  <th>MRP</th>
                  <th>RATE</th>
                  <th>SGST %</th>
                  <th>SGST AMT</th>
                  <th>CGST %</th>
                  <th>CGST AMT</th>
                  <th>IGST %</th>
                  <th>IGST AMT</th>
                  <th>TOTAL AMOUNT</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((item, idx) => {
                  const c = calcItem(item);
                  return (
                    <tr key={idx}>
                      <td className="gst-td-center">{idx + 1}</td>
                      <td>
                        <input type="number" className="gst-inp" min={1} style={{ width: 52 }} value={item.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} />
                      </td>
                      <td>
                        <input className="gst-inp" style={{ width: 130 }} placeholder="Item name" value={item.product_name} onChange={(e) => updateItem(idx, "product_name", e.target.value)} />
                      </td>
                      <td>
                        <input className="gst-inp" style={{ width: 68 }} placeholder="HSN" value={item.hsn_no} onChange={(e) => updateItem(idx, "hsn_no", e.target.value)} />
                      </td>
                      <td>
                        <input className="gst-inp" style={{ width: 68 }} placeholder="Batch" value={item.batch} onChange={(e) => updateItem(idx, "batch", e.target.value)} />
                      </td>
                      <td>
                        <input className="gst-inp" style={{ width: 80 }} placeholder="MM/YYYY" value={item.mfg_date} onChange={(e) => updateItem(idx, "mfg_date", e.target.value)} />
                      </td>
                      <td>
                        <input className="gst-inp" style={{ width: 80 }} placeholder="MM/YYYY" value={item.expiry_date} onChange={(e) => updateItem(idx, "expiry_date", e.target.value)} />
                      </td>
                      <td>
                        <input type="number" className="gst-inp" style={{ width: 70 }} min={0} step="0.01" value={item.mrp} onChange={(e) => updateItem(idx, "mrp", e.target.value)} />
                      </td>
                      <td>
                        <input type="number" className="gst-inp" style={{ width: 70 }} min={0} step="0.01" value={item.unit_price} onChange={(e) => updateItem(idx, "unit_price", e.target.value)} />
                      </td>
                      <td>
                        <input type="number" className="gst-inp" style={{ width: 56 }} min={0} step="0.1" value={item.sgst_percent} onChange={(e) => updateItem(idx, "sgst_percent", e.target.value)} />
                      </td>
                      <td className="gst-calc">{fmt(c.sgst)}</td>
                      <td>
                        <input type="number" className="gst-inp" style={{ width: 56 }} min={0} step="0.1" value={item.cgst_percent} onChange={(e) => updateItem(idx, "cgst_percent", e.target.value)} />
                      </td>
                      <td className="gst-calc">{fmt(c.cgst)}</td>
                      <td>
                        <input type="number" className="gst-inp" style={{ width: 56 }} min={0} step="0.1" value={item.igst_percent} onChange={(e) => updateItem(idx, "igst_percent", e.target.value)} />
                      </td>
                      <td className="gst-calc">{fmt(c.igst)}</td>
                      <td className="gst-calc gst-total">{fmt(c.total)}</td>
                      <td>
                        <button
                          type="button"
                          className="remove-item-btn"
                          onClick={() => removeItem(idx)}
                          disabled={form.items.length === 1}
                          style={{ opacity: form.items.length === 1 ? 0 : 1, pointerEvents: form.items.length === 1 ? "none" : "auto" }}
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Amount Summary */}
          <div className="totals-wrap" style={{ marginTop: 16 }}>
            <div className="totals-box">
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "var(--text-dark)" }}>
                Amount Summary
              </div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>
                Per line: (Qty × Rate) + SGST + CGST + IGST = Total Amount
              </p>
              <div className="totals-row">
                <span>Base (Qty × Rate, excl. GST):</span>
                <span>{fmt(totals.base)}</span>
              </div>
              <div className="totals-row">
                <span>Total GST (SGST + CGST + IGST):</span>
                <span>{fmt(totals.sgst + totals.cgst + totals.igst)}</span>
              </div>
              <div className="totals-row total">
                <span>Total Amount (incl. GST):</span>
                <span>{fmt(totals.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="inv-create-actions">
          <button type="button" className="btn btn-secondary" onClick={openPreview}>
            <FiEye /> Preview Invoice
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creating..." : "Save & issue"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;
