import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FiFileText, FiPlusCircle, FiLogOut } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";
import "./Layout.css";

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully.");
    navigate("/login");
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <FiFileText className="logo-icon" />
          <span className="logo-text">Invoice Pro</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <NavLink
            to="/invoices"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
            end
          >
            <FiFileText className="nav-icon" />
            <span>All Invoices</span>
          </NavLink>

          <NavLink
            to="/invoices/create"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <FiPlusCircle className="nav-icon" />
            <span>Create Invoice</span>
          </NavLink>
        </nav>

        {/* User Footer */}
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <FiLogOut />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
