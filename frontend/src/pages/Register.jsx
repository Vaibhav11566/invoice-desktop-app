import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiFileText, FiUser, FiMail, FiPhone, FiLock } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";
import "./Auth.css";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      toast.error("Name, email and password are required.");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      toast.success("Account created! 🎉");
      navigate("/invoices");
    } catch (error) {
      const msg =
        error.response?.data?.message || "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <FiFileText className="auth-logo-icon" />
          <span className="auth-logo-text">InvoicePro</span>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Get started with Invoice Pro today</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Name */}
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <div className="input-icon">
              <span className="icon">
                <FiUser />
              </span>
              <input
                id="name"
                name="name"
                type="text"
                className="form-control"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <div className="input-icon">
              <span className="icon">
                <FiMail />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="form-group">
            <label htmlFor="phone">
              Phone{" "}
              <span className="optional-label">(optional)</span>
            </label>
            <div className="input-icon">
              <span className="icon">
                <FiPhone />
              </span>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="form-control"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={handleChange}
                autoComplete="tel"
              />
            </div>
          </div>

          {/* Password + Confirm */}
          <div className="auth-form-grid">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-icon">
                <span className="icon">
                  <FiLock />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-control"
                  placeholder="Min 6 chars"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm</label>
              <div className="input-icon">
                <span className="icon">
                  <FiLock />
                </span>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="form-control"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-btn"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
