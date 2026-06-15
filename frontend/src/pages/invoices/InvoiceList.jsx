import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlusCircle, FiRefreshCw } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import InvoiceTemplate from "./InvoiceTemplate.jsx";
import { BUSINESS } from "../../config/business.js";
import "./Invoices.css";

const PAYMENT_COLORS = {
  Pending: "badge-pending",
  Verified: "badge-verified",
  Failed: "badge-failed",
};

const InvoiceList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [printInvoice, setPrintInvoice] = useState(null);
  const [printSmall, setPrintSmall] = useState(false);
  const [stats, setStats] = useState({ totalIssued: 0, totalCancelled: 0, totalGross: 0 });
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  const fetchInvoices = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, limit: rowsPerPage });
        if (statusFilter) params.set("status", statusFilter);

        const res = await api.get(`/invoices?${params.toString()}`);
        const { invoices: list, pagination: pg, stats: st } = res.data.data;
        setInvoices(list);
        setPagination(pg);
        if (st) setStats(st);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch invoices.");
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, rowsPerPage]
  );

  useEffect(() => {
    fetchInvoices(1);
  }, [fetchInvoices]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await api.delete(`/invoices/${id}`);
      toast.success("Invoice deleted.");
      fetchInvoices(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete invoice.");
    }
  };

  const formatAmount = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}-${d.toLocaleString("en-IN", { month: "short" })}-${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const getDocStatus = (inv) =>
    inv.order_status === "Cancelled" ? "Cancelled" : "Issued";

  const rangeStart = (pagination.page - 1) * rowsPerPage + 1;
  const rangeEnd = Math.min(pagination.page * rowsPerPage, pagination.total);

  return (
    <div className="page-container">
      {printInvoice && (
        <InvoiceTemplate
          invoice={printInvoice}
          onClose={() => { setPrintInvoice(null); setPrintSmall(false); }}
          autoPrint={true}
          small={printSmall}
        />
      )}

      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Invoices</h1>
        <button className="btn btn-primary" onClick={() => navigate("/invoices/create")}>
          <FiPlusCircle /> New invoice
        </button>
      </div>

      {/* Stats Cards */}
      <div className="inv-stats-row">
        <div className="inv-stat-card">
          <div className="inv-stat-value">{stats.totalIssued}</div>
          <div className="inv-stat-label">Total issued</div>
          <div className="inv-stat-note">Not scoped by status filter</div>
        </div>
        <div className="inv-stat-card">
          <div className="inv-stat-value">{stats.totalCancelled}</div>
          <div className="inv-stat-label">Total cancelled</div>
          <div className="inv-stat-note">Not scoped by status filter</div>
        </div>
        <div className="inv-stat-card">
          <div className="inv-stat-value inv-stat-gross">{formatAmount(stats.totalGross)}</div>
          <div className="inv-stat-label">Total gross</div>
          <div className="inv-stat-note">For current filter · all pages</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="inv-filter-bar">
        <div className="inv-filter-left">
          <label className="inv-filter-label">Status</label>
          <select
            className="form-control inv-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <label className="inv-filter-label">Rows</label>
          <select
            className="form-control inv-filter-select"
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(Number(e.target.value)); }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => fetchInvoices(pagination.page)}
            title="Refresh"
          >
            <FiRefreshCw size={14} />
          </button>
        </div>

        {pagination.total > 0 && (
          <div className="inv-filter-count">
            {rangeStart}–{rangeEnd} of {pagination.total}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="empty-state">
            <p>No invoices found</p>
            <button className="btn btn-primary btn-sm" onClick={() => navigate("/invoices/create")}>
              <FiPlusCircle /> Create Invoice
            </button>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="inv-list-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Invoice ID</th>
                    <th>Business</th>
                    <th>Type</th>
                    <th>Receiver</th>
                    <th>Issued on</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv, idx) => (
                    <tr key={inv._id}>
                      <td className="inv-list-idx">{rangeStart + idx}</td>
                      <td>
                        <span
                          className="inv-list-id-link"
                          onClick={() => navigate(`/invoices/${inv._id}`)}
                        >
                          #{inv.invoice_number}
                        </span>
                      </td>
                      <td className="inv-list-cell">{BUSINESS.name}</td>
                      <td className="inv-list-cell">{inv.document_type || "Invoice"}</td>
                      <td className="inv-list-cell">{inv.client_name || "—"}</td>
                      <td className="inv-list-cell inv-list-date">{formatDate(inv.createdAt)}</td>
                      <td>
                        <span className={`inv-doc-status ${getDocStatus(inv) === "Issued" ? "status-issued" : "status-cancelled"}`}>
                          {getDocStatus(inv)}
                        </span>
                      </td>
                      <td className="inv-list-amount">{formatAmount(inv.total_amount)}</td>
                      <td>
                        <div className="inv-list-actions">
                          <button
                            className="print-link"
                            onClick={() => { setPrintSmall(false); setPrintInvoice(inv); }}
                          >
                            🖨 Print (A4)
                          </button>
                          <button
                            className="print-link"
                            onClick={() => { setPrintSmall(true); setPrintInvoice(inv); }}
                          >
                            🖨 Print (Small)
                          </button>
                          {user?.role === "admin" && (
                            <button
                              className="print-link print-link-danger"
                              onClick={() => handleDelete(inv._id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchInvoices(pagination.page - 1)}
                >
                  ← Prev
                </button>
                <span className="page-info">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchInvoices(pagination.page + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InvoiceList;
