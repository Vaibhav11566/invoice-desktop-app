import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiRefreshCw,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiPlusCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
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

const InvoiceList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });

  const fetchInvoices = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page,
          limit: 10,
        });
        if (search) params.set("search", search);
        if (statusFilter) params.set("status", statusFilter);

        const res = await api.get(`/invoices?${params.toString()}`);
        const { invoices: list, pagination: pg } = res.data.data;
        setInvoices(list);
        setPagination(pg);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch invoices."
        );
      } finally {
        setLoading(false);
      }
    },
    [search, statusFilter]
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
    `₹${Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    })}`;

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">{pagination.total} invoices total</p>
        </div>
        <Link to="/invoices/create" className="btn btn-primary">
          <FiPlusCircle />
          New Invoice
        </Link>
      </div>

      {/* Filters */}
      <div className="card filters-bar">
        <div className="search-wrap">
          <span className="search-icon">
            <FiSearch />
          </span>
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search by invoice #, client name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-control filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <button
          className="btn btn-ghost btn-sm"
          onClick={() => fetchInvoices(pagination.page)}
          title="Refresh"
        >
          <FiRefreshCw />
        </button>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="empty-state">
            <FiSearch size={40} />
            <p>No invoices found</p>
            <Link to="/invoices/create" className="btn btn-primary btn-sm">
              <FiPlusCircle /> Create Invoice
            </Link>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Client</th>
                    <th>Amount (₹)</th>
                    <th>Order Status</th>
                    <th>Payment</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv._id}>
                      <td>
                        <span className="invoice-num">{inv.invoice_number}</span>
                      </td>
                      <td>
                        <div className="client-cell">
                          <span className="client-name">{inv.client_name}</span>
                          {inv.client_email && (
                            <span className="client-email">
                              {inv.client_email}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="amount-cell">
                          {formatAmount(inv.total_amount)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            STATUS_COLORS[inv.order_status] || "badge-pending"
                          }`}
                        >
                          {inv.order_status}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            PAYMENT_COLORS[inv.payment_status] || "badge-pending"
                          }`}
                        >
                          {inv.payment_status}
                        </span>
                      </td>
                      <td>
                        <span className="purchase-type">{inv.purchase_type}</span>
                      </td>
                      <td>
                        <span className="date-cell">
                          {formatDate(inv.createdAt)}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button
                            className="icon-btn view"
                            onClick={() => navigate(`/invoices/${inv._id}`)}
                            title="View"
                          >
                            <FiEye />
                          </button>
                          <button
                            className="icon-btn edit"
                            onClick={() =>
                              navigate(`/invoices/${inv._id}/edit`)
                            }
                            title="Edit"
                          >
                            <FiEdit2 />
                          </button>
                          {user?.role === "admin" && (
                            <button
                              className="icon-btn delete"
                              onClick={() => handleDelete(inv._id)}
                              title="Delete"
                            >
                              <FiTrash2 />
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
