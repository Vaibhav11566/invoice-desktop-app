import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiEdit2, FiTrash2, FiDownload, FiPrinter } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import InvoiceTemplate from "./InvoiceTemplate.jsx";
import "./Invoices.css";

const STATUS_COLORS = {
  Pending: "badge-pending",
  Processing: "badge-processing",
  Shipped: "badge-shipped",
  Delivered: "badge-delivered",
  Cancelled: "badge-cancelled",
};

const PAYMENT_COLORS = {
  Pending: "badge-pending",
  Verified: "badge-verified",
  Failed: "badge-failed",
};

const fmt = (val) =>
  `₹${Number(val || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [printOpen, setPrintOpen] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await api.get(`/invoices/${id}`);
        setInvoice(res.data.data.invoice);
      } catch (error) {
        toast.error(error.response?.data?.message || "Invoice not found.");
        navigate("/invoices");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await api.delete(`/invoices/${id}`);
      toast.success("Invoice deleted.");
      navigate("/invoices");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete invoice.");
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="page-container">
      {printOpen && (
        <InvoiceTemplate
          invoice={invoice}
          onClose={() => setPrintOpen(false)}
          autoPrint={false}
        />
      )}

      {/* Header Bar */}
      <div className="invoice-header-bar">
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <button className="back-btn" onClick={() => navigate("/invoices")}>
            <FiArrowLeft /> Back
          </button>
          <div className="invoice-title-area">
            <h1 className="page-title" style={{ fontSize: 20 }}>
              {invoice.invoice_number}
            </h1>
            <div className="invoice-title-badges">
              <span className={`badge ${STATUS_COLORS[invoice.order_status] || "badge-pending"}`}>
                {invoice.order_status}
              </span>
              <span className={`badge ${PAYMENT_COLORS[invoice.payment_status] || "badge-pending"}`}>
                {invoice.payment_status}
              </span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setPrintOpen(true)}
          >
            <FiPrinter /> Print
          </button>
          <Link to={`/invoices/${id}/edit`} className="btn btn-ghost btn-sm">
            <FiEdit2 /> Edit
          </Link>
          {user?.role === "admin" && (
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>
              <FiTrash2 /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="detail-layout">
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Client Information */}
          <div className="form-section">
            <h3 className="form-section-title">Client Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Client Name</label>
                <span>{invoice.client_name}</span>
              </div>
              {invoice.client_email && (
                <div className="detail-item">
                  <label>Email</label>
                  <span>{invoice.client_email}</span>
                </div>
              )}
              {invoice.client_phone && (
                <div className="detail-item">
                  <label>Phone</label>
                  <span>{invoice.client_phone}</span>
                </div>
              )}
              <div className="detail-item">
                <label>Purchase Type</label>
                <span className="purchase-type">{invoice.purchase_type}</span>
              </div>
              {invoice.client_gst_no && (
                <div className="detail-item">
                  <label>GST No.</label>
                  <span>{invoice.client_gst_no}</span>
                </div>
              )}
              {invoice.client_state && (
                <div className="detail-item">
                  <label>State</label>
                  <span>{invoice.client_state}</span>
                </div>
              )}
              {invoice.shipping_address && (
                <div className="detail-item" style={{ gridColumn: "1 / -1" }}>
                  <label>Shipping Address</label>
                  <span>{invoice.shipping_address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Items */}
          <div className="form-section">
            <h3 className="form-section-title">Invoice Items</h3>
            <div className="table-container">
              <table className="detail-items-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>SGST</th>
                    <th>CGST</th>
                    <th>IGST</th>
                    <th style={{ textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{item.product_name}</div>
                        {item.hsn_no && (
                          <div className="item-desc">HSN: {item.hsn_no}</div>
                        )}
                        {item.batch && (
                          <div className="item-desc">Batch: {item.batch}</div>
                        )}
                        {(item.mfg_date || item.expiry_date) && (
                          <div className="item-desc">
                            {item.mfg_date && `Mfg: ${item.mfg_date}`}
                            {item.mfg_date && item.expiry_date && " | "}
                            {item.expiry_date && `Exp: ${item.expiry_date}`}
                          </div>
                        )}
                      </td>
                      <td>{item.quantity}</td>
                      <td>{fmt(item.unit_price)}</td>
                      <td>
                        <span className="item-desc">{item.sgst_percent ?? 0}%</span>
                        <div>{fmt(item.sgst_amount)}</div>
                      </td>
                      <td>
                        <span className="item-desc">{item.cgst_percent ?? 0}%</span>
                        <div>{fmt(item.cgst_amount)}</div>
                      </td>
                      <td>
                        <span className="item-desc">{item.igst_percent ?? 0}%</span>
                        <div>{fmt(item.igst_amount)}</div>
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>
                        {fmt(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="totals-wrap">
              <div className="totals-box">
                <div className="totals-row">
                  <span>Base Amount (Excl. GST)</span>
                  <span>{fmt(invoice.base_amount ?? invoice.subtotal)}</span>
                </div>
                <div className="totals-row">
                  <span>Total GST (SGST + CGST + IGST)</span>
                  <span>{fmt(invoice.total_gst ?? invoice.tax_amount)}</span>
                </div>
                <div className="totals-row total">
                  <span>Total Amount (Incl. GST)</span>
                  <span>{fmt(invoice.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {invoice.remarks && (
            <div className="form-section">
              <h3 className="form-section-title">Remarks</h3>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
                {invoice.remarks}
              </p>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-section">
            <h3 className="form-section-title">Invoice Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="detail-item">
                <label>Invoice Number</label>
                <span className="invoice-num">{invoice.invoice_number}</span>
              </div>
              <div className="detail-item">
                <label>Created Date</label>
                <span>{formatDate(invoice.createdAt)}</span>
              </div>
              <div className="detail-item">
                <label>Last Updated</label>
                <span>{formatDate(invoice.updatedAt)}</span>
              </div>
              <div className="detail-item">
                <label>Created By</label>
                <span>{invoice.created_by?.name || "—"}</span>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Payment Info</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="detail-item">
                <label>Payment Status</label>
                <span className={`badge ${PAYMENT_COLORS[invoice.payment_status] || "badge-pending"}`}>
                  {invoice.payment_status}
                </span>
              </div>
              {invoice.payment_service && (
                <div className="detail-item">
                  <label>Payment Service</label>
                  <span>
                    {invoice.payment_service === "Other"
                      ? invoice.other_payment_service || "Other"
                      : invoice.payment_service}
                  </span>
                </div>
              )}
              {invoice.transaction_id && (
                <div className="detail-item">
                  <label>Transaction ID</label>
                  <span className="invoice-num">{invoice.transaction_id}</span>
                </div>
              )}
              {invoice.payment_screenshot && (
                <div className="detail-item">
                  <label>Payment Screenshot</label>
                  <a
                    href={invoice.payment_screenshot}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="screenshot-link"
                  >
                    <FiDownload /> View Screenshot
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
