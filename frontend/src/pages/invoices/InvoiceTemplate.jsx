import { useEffect, useRef, useState } from "react";
import { FiX, FiPrinter, FiDownload } from "react-icons/fi";
import { useBusiness } from "../../context/BusinessContext.jsx";
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

const fmtDateShort = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  } catch {
    return "—";
  }
};

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmtDateMed = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}-${MONTHS_SHORT[d.getMonth()]}-${d.getFullYear()}`;
  } catch {
    return "—";
  }
};

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

const twoDigitWords = (n) =>
  n < 20 ? ONES[n] : `${TENS[Math.floor(n / 10)]} ${ONES[n % 10]}`.trim();

const threeDigitWords = (n) => {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  return `${h ? ONES[h] + " Hundred " : ""}${twoDigitWords(rest)}`.trim();
};

const numToWords = (value) => {
  let num = Math.round(Number(value) || 0);
  if (num === 0) return "Zero";
  let result = "";
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundred = num;

  if (crore) result += `${twoDigitWords(crore)} Crore `;
  if (lakh) result += `${twoDigitWords(lakh)} Lakh `;
  if (thousand) result += `${twoDigitWords(thousand)} Thousand `;
  if (hundred) result += threeDigitWords(hundred);

  return result.trim();
};

const buildClassSummary = (items) => {
  const map = {};
  items.forEach((item) => {
    const cls = (Number(item.sgst_percent || 0) + Number(item.cgst_percent || 0)).toFixed(2);
    if (!map[cls]) map[cls] = { cls, total: 0, sgst: 0, cgst: 0 };
    map[cls].total += Number(item.quantity || 0) * Number(item.unit_price || 0);
    map[cls].sgst += Number(item.sgst_amount || 0);
    map[cls].cgst += Number(item.cgst_amount || 0);
  });
  return Object.values(map).sort((a, b) => Number(a.cls) - Number(b.cls));
};

const SMALL_MIN_ROWS = 6;

// The actual printable invoice document
export const InvoiceDocument = ({ invoice }) => {
  const { business, terms } = useBusiness();
  const items = invoice.items || [];

  return (
    <div className="inv-doc">
      {/* Header */}
      <div className="inv-header">
        <div className="inv-biz-section">
          {business.logo && (
            <img src={business.logo} className="inv-logo" alt="logo" />
          )}
          <div className="inv-biz-info">
            <div className="inv-biz-name">{business.name || "—"}</div>
            {business.tagline && (
              <div className="inv-biz-tagline">{business.tagline}</div>
            )}
            <div className="inv-biz-line">{business.address}</div>
            <div className="inv-biz-line">Phone No.: {business.phone}</div>
            <div className="inv-biz-line">E-mail: {business.email}</div>
            <div className="inv-biz-line">GSTIN: {business.gstin}</div>
            <div className="inv-biz-line">PAN No.: {business.pan}</div>
          </div>
        </div>
        <div className="inv-title-section">
          <div className="inv-doc-title">TAX INVOICE</div>
          <div className="inv-doc-meta">
            Invoice No.: {invoice.invoice_number || "—"}
          </div>
          <div className="inv-doc-meta">Date: {fmtDateMed(invoice.createdAt)}</div>
        </div>
      </div>

      <div className="inv-rule" />

      {/* Consignee */}
      <div className="inv-consignee">
        <div className="inv-box-title">Consignee Details (Shipped to)</div>
        <div className="inv-cf"><span className="inv-fl">Name:</span> {invoice.client_name || "—"}</div>
        <div className="inv-cf"><span className="inv-fl">Address:</span> {invoice.shipping_address || "—"}</div>
        <div className="inv-cf"><span className="inv-fl">Phone:</span> {invoice.client_phone || "—"}</div>
        {invoice.client_email && (
          <div className="inv-cf"><span className="inv-fl">Email:</span> {invoice.client_email}</div>
        )}
        {invoice.client_gst_no && (
          <div className="inv-cf"><span className="inv-fl">GST No.:</span> {invoice.client_gst_no}</div>
        )}
        {invoice.client_state && (
          <div className="inv-cf"><span className="inv-fl">State:</span> {invoice.client_state}</div>
        )}
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
          <div className="inv-summary-row">
            <span>Base Amount (Excl. GST):</span>
            <span>{fmt(invoice.base_amount ?? invoice.subtotal)}</span>
          </div>
          <div className="inv-summary-row">
            <span>Total GST Amount:</span>
            <span>{fmt(invoice.total_gst ?? invoice.tax_amount)}</span>
          </div>
          <div className="inv-summary-row inv-summary-final">
            <span>Total (Incl. GST):</span>
            <span>{fmt(invoice.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="inv-terms">
        <div className="inv-terms-title">Terms and Conditions</div>
        <div className="inv-terms-list">
          {terms.map((t, i) => (
            <div key={i} className="inv-terms-item">{t}</div>
          ))}
        </div>
      </div>

      {/* Signature */}
      <div className="inv-sig">
        <div className="inv-sig-right">
          <div>For: {business.name || "—"}</div>
          <div className="inv-sig-blank" />
          <div>Auth. Signatory (Billing Executive):</div>
        </div>
      </div>
    </div>
  );
};

// Compact "GST INVOICE" style document — used for the Print (Small) action
export const InvoiceDocumentSmall = ({ invoice }) => {
  const { business } = useBusiness();
  const items = invoice.items || [];

  const classSummary = buildClassSummary(items);
  const totalSgst = classSummary.reduce((s, c) => s + c.sgst, 0);
  const totalCgst = classSummary.reduce((s, c) => s + c.cgst, 0);
  const totalClassAmt = classSummary.reduce((s, c) => s + c.total, 0);
  const grandTotal = invoice.total_amount ?? 0;

  const filledRows = [...items];
  while (filledRows.length < SMALL_MIN_ROWS) filledRows.push(null);

  return (
    <div className="inv-doc-sm">
      {/* Header */}
      <div className="sm-header">
        <div className="sm-biz">
          {business.logo && (
            <img src={business.logo} className="sm-logo" alt="logo" />
          )}
          <div className="sm-biz-name">{business.name || "—"}</div>
          {business.tagline && (
            <div className="sm-biz-tagline">{business.tagline}</div>
          )}
          <div className="sm-biz-line">{business.address}</div>
          <div className="sm-biz-line">Phone : {business.phone}</div>
          <div className="sm-biz-line">Email : {business.email}</div>
          <div className="sm-biz-line">GST No. : {business.gstin}</div>
          <div className="sm-biz-line">PAN : {business.pan}</div>
        </div>
        <div className="sm-divider" />
        <div className="sm-client">
          <div className="sm-client-label">M/s {invoice.client_name || "—"}</div>
        </div>
      </div>

      {/* Title bar */}
      <div className="sm-title-bar">
        <span className="sm-title">GST INVOICE</span>
        <span className="sm-title-meta">Invoice No. : {invoice.invoice_number || "—"}</span>
        <span className="sm-title-meta">Date : {fmtDateShort(invoice.createdAt)}</span>
      </div>

      {/* Items table */}
      <table className="sm-tbl">
        <thead>
          <tr>
            <th>Sn.</th>
            <th>Qty</th>
            <th>Product</th>
            <th>Batch</th>
            <th>Exp</th>
            <th>HSN</th>
            <th>MRP</th>
            <th>Rate</th>
            <th>MFG</th>
            <th>SGST</th>
            <th>CGST</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {filledRows.map((item, idx) => (
            <tr key={idx}>
              <td>{item ? idx + 1 : ""}</td>
              <td>{item?.quantity ?? ""}</td>
              <td>{item?.product_name ?? ""}</td>
              <td>{item?.batch ?? ""}</td>
              <td>{item?.expiry_date ?? ""}</td>
              <td>{item?.hsn_no ?? ""}</td>
              <td>{item ? fmt(item.mrp) : ""}</td>
              <td>{item ? fmt(item.unit_price) : ""}</td>
              <td>{item?.mfg_date ?? ""}</td>
              <td>{item ? item.sgst_percent ?? 0 : ""}</td>
              <td>{item ? item.cgst_percent ?? 0 : ""}</td>
              <td>{item ? fmt(item.total) : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Class summary + Totals */}
      <div className="sm-bottom">
        <table className="sm-class-tbl">
          <thead>
            <tr>
              <th>Class</th>
              <th>Total</th>
              <th>Disc.</th>
              <th>SGST</th>
              <th>CGST</th>
              <th>Total GST</th>
            </tr>
          </thead>
          <tbody>
            {classSummary.map((c) => (
              <tr key={c.cls}>
                <td>GST {c.cls}</td>
                <td>{fmt(c.total)}</td>
                <td>{fmt(0)}</td>
                <td>{fmt(c.sgst)}</td>
                <td>{fmt(c.cgst)}</td>
                <td>{fmt(c.sgst + c.cgst)}</td>
              </tr>
            ))}
            <tr className="sm-class-total">
              <td>TOTAL</td>
              <td>{fmt(totalClassAmt)}</td>
              <td>{fmt(0)}</td>
              <td>{fmt(totalSgst)}</td>
              <td>{fmt(totalCgst)}</td>
              <td>{fmt(totalSgst + totalCgst)}</td>
            </tr>
          </tbody>
        </table>

        <div className="sm-totals">
          <div className="sm-totals-row">
            <span>SUB TOTAL</span>
            <span>{fmt(invoice.base_amount ?? invoice.subtotal)}</span>
          </div>
          <div className="sm-totals-row">
            <span>SGST PAYABLE</span>
            <span>{fmt(totalSgst)}</span>
          </div>
          <div className="sm-totals-row">
            <span>CGST PAYABLE</span>
            <span>{fmt(totalCgst)}</span>
          </div>
          <div className="sm-totals-row sm-grand">
            <span>GRAND TOTAL</span>
            <span>{fmt(grandTotal)}</span>
          </div>
        </div>
      </div>

      <div className="sm-words">Rx. Only</div>

      {/* Terms */}
      <div className="sm-terms">
        <div className="sm-terms-title">Terms &amp; Conditions</div>
        <div className="sm-terms-body">
          <div>Goods once sold will not be taken back or exchanged.</div>
          <div>Bills not paid due date will attract 24% interest.</div>
          <div>All disputes subject to local Jurisdiction only.</div>
        </div>
      </div>

      {/* Signature */}
      <div className="sm-sig">
        <div className="sm-sig-for">For {business.name || "—"}</div>
        <div className="sm-sig-blank" />
        <div>Auth. Signatory</div>
      </div>
    </div>
  );
};

// Modal wrapper — used for both preview and print
const InvoiceTemplate = ({ invoice, onClose, autoPrint = false, small = false }) => {
  const paperRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (autoPrint) {
      const t = setTimeout(() => window.print(), 300);
      return () => clearTimeout(t);
    }
  }, [autoPrint]);

  const handleDownloadPDF = async () => {
    if (!paperRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const el = paperRef.current.firstElementChild;
      const canvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgW = 210; // A4 width in mm
      const imgH = (canvas.height * imgW) / canvas.width;
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgW, imgH);

      pdf.save(`${invoice.invoice_number || "invoice"}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("PDF download failed. Please use the Print button instead.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="inv-modal-bg" onClick={onClose}>
      <div className="inv-modal" onClick={(e) => e.stopPropagation()}>
        <div className="inv-modal-bar no-print">
          <span className="inv-modal-bar-title">
            {small ? "Invoice Preview (Small)" : "Invoice Preview"}
          </span>
          <div className="inv-modal-bar-actions">
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleDownloadPDF}
              disabled={downloading}
            >
              <FiDownload /> {downloading ? "Generating..." : "Download PDF"}
            </button>
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
        <div className="inv-paper" ref={paperRef}>
          {small ? (
            <InvoiceDocumentSmall invoice={invoice} />
          ) : (
            <InvoiceDocument invoice={invoice} />
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
