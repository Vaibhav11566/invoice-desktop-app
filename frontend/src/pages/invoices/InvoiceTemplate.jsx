import { useEffect } from "react";
import { FiX, FiPrinter } from "react-icons/fi";
import { BUSINESS, INVOICE_TERMS } from "../../config/business.js";
import "./Invoices.css";

const fmt = (val) =>
  `₹${Number(val || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

const fmtDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

// The actual printable invoice document
export const InvoiceDocument = ({ invoice }) => {
  const items = invoice.items || [];

  return (
    <div className="inv-doc">
      {/* Header */}
      <div className="inv-header">
        <div className="inv-biz-section">
          {BUSINESS.logo && (
            <img src={BUSINESS.logo} className="inv-logo" alt="logo" />
          )}
          <div className="inv-biz-info">
            <div className="inv-biz-name">{BUSINESS.name}</div>
            <div className="inv-biz-line">{BUSINESS.address}</div>
            <div className="inv-biz-line">Phone No.: {BUSINESS.phone}</div>
            <div className="inv-biz-line">E-mail: {BUSINESS.email}</div>
            <div className="inv-biz-line">GSTIN: {BUSINESS.gstin}</div>
            <div className="inv-biz-line">PAN No.: {BUSINESS.pan}</div>
          </div>
        </div>
        <div className="inv-title-section">
          <div className="inv-doc-title">INVOICE</div>
          <div className="inv-doc-meta">
            Invoice No.: {invoice.invoice_number || "—"}
          </div>
          <div className="inv-doc-meta">Date: {fmtDate(invoice.createdAt)}</div>
        </div>
      </div>

      <div className="inv-rule" />

      {/* Consignee */}
      <div className="inv-consignee">
        <div className="inv-box-title">Consignee Details (Shipped to)</div>
        <div className="inv-consignee-grid">
          <div className="inv-cf">
            <span className="inv-fl">Name:</span> {invoice.client_name || "—"}
          </div>
          <div className="inv-cf">
            <span className="inv-fl">Phone No.:</span>{" "}
            {invoice.client_phone || "—"}
          </div>
          <div className="inv-cf inv-cf-full">
            <span className="inv-fl">Address:</span>{" "}
            {invoice.shipping_address || "—"}
          </div>
          <div className="inv-cf">
            <span className="inv-fl">Email:</span>{" "}
            {invoice.client_email || "—"}
          </div>
          {invoice.client_gst_no && (
            <div className="inv-cf">
              <span className="inv-fl">GST No.:</span> {invoice.client_gst_no}
            </div>
          )}
          {invoice.client_state && (
            <div className="inv-cf">
              <span className="inv-fl">State:</span> {invoice.client_state}
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="inv-tbl-wrap">
        <table className="inv-tbl">
          <thead>
            <tr>
              <th>Sr.</th>
              <th>Qty</th>
              <th>Item Name</th>
              <th>HSN</th>
              <th>Batch</th>
              <th>Mfg</th>
              <th>Expiry</th>
              <th>MRP</th>
              <th>Rate</th>
              <th>SGST %</th>
              <th>SGST Amt</th>
              <th>CGST %</th>
              <th>CGST Amt</th>
              <th>IGST %</th>
              <th>IGST Amt</th>
              <th>Total Amt</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{item.quantity}</td>
                <td>{item.product_name || "—"}</td>
                <td>{item.hsn_no || "—"}</td>
                <td>{item.batch || "—"}</td>
                <td>{item.mfg_date || "—"}</td>
                <td>{item.expiry_date || "—"}</td>
                <td>{fmt(item.mrp)}</td>
                <td>{fmt(item.unit_price)}</td>
                <td>{item.sgst_percent ?? 0}%</td>
                <td>{fmt(item.sgst_amount)}</td>
                <td>{item.cgst_percent ?? 0}%</td>
                <td>{fmt(item.cgst_amount)}</td>
                <td>
                  {(item.igst_percent ?? 0) > 0
                    ? `${item.igst_percent}%`
                    : "—"}
                </td>
                <td>
                  {(item.igst_amount ?? 0) > 0 ? fmt(item.igst_amount) : "—"}
                </td>
                <td className="inv-tbl-total">{fmt(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Amount Summary */}
      <div className="inv-summary">
        <div className="inv-summary-box">
          <div className="inv-summary-title">Amount Summary</div>
          <div className="inv-summary-note">
            Per line: (Qty × Rate) + SGST + CGST + IGST = Total Amount
          </div>
          <div className="inv-summary-row">
            <span>Base Amount (Excl. GST):</span>
            <span>{fmt(invoice.base_amount ?? invoice.subtotal)}</span>
          </div>
          <div className="inv-summary-row">
            <span>Total GST (SGST + CGST + IGST):</span>
            <span>{fmt(invoice.total_gst ?? invoice.tax_amount)}</span>
          </div>
          <div className="inv-summary-row inv-summary-final">
            <span>Total Amount (Incl. GST):</span>
            <span>{fmt(invoice.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="inv-terms">
        <div className="inv-terms-title">Terms and Conditions</div>
        <ul className="inv-terms-list">
          {INVOICE_TERMS.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>

      {/* Signature */}
      <div className="inv-sig">
        <div className="inv-sig-right">
          <div>For: {BUSINESS.name}</div>
          <div className="inv-sig-blank" />
          <div>Auth. Signatory (Billing Executive):</div>
        </div>
      </div>
    </div>
  );
};

// Modal wrapper — used for both preview and print
const InvoiceTemplate = ({ invoice, onClose, autoPrint = false }) => {
  useEffect(() => {
    if (autoPrint) {
      const t = setTimeout(() => window.print(), 300);
      return () => clearTimeout(t);
    }
  }, [autoPrint]);

  return (
    <div className="inv-modal-bg" onClick={onClose}>
      <div className="inv-modal" onClick={(e) => e.stopPropagation()}>
        <div className="inv-modal-bar no-print">
          <span className="inv-modal-bar-title">Invoice Preview</span>
          <div className="inv-modal-bar-actions">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => window.print()}
            >
              <FiPrinter /> Print
            </button>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>
              <FiX /> Close
            </button>
          </div>
        </div>
        <div className="inv-paper">
          <InvoiceDocument invoice={invoice} />
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
