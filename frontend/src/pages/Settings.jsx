import { useState } from "react";
import { FiSave } from "react-icons/fi";
import toast from "react-hot-toast";
import { useBusiness } from "../context/BusinessContext.jsx";
import "./Settings.css";

const Settings = () => {
  const { business, saveBusiness, terms, saveTerms } = useBusiness();

  const [bizForm, setBizForm] = useState({ ...business });
  const [termsText, setTermsText] = useState(terms.join("\n"));

  const handleBizChange = (field, value) =>
    setBizForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    saveBusiness(bizForm);
    const parsed = termsText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    saveTerms(parsed.length > 0 ? parsed : terms);
    toast.success("Settings saved!");
  };

  const termCount = termsText.split("\n").filter((l) => l.trim()).length;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <button className="btn btn-primary" onClick={handleSave}>
          <FiSave /> Save Changes
        </button>
      </div>

      {/* Business Details */}
      <div className="card settings-card">
        <h2 className="settings-section-title">Business Details</h2>
        <p className="settings-section-desc">
          These details appear on all invoices as the seller / billing party.
        </p>

        <div className="settings-grid">
          <div className="form-group form-full">
            <label>Business / Company Name</label>
            <input
              className="form-control"
              placeholder="e.g. ABC Traders Pvt. Ltd."
              value={bizForm.name}
              onChange={(e) => handleBizChange("name", e.target.value)}
            />
          </div>

          <div className="form-group form-full">
            <label>Address</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Full address including city, state, PIN"
              value={bizForm.address}
              onChange={(e) => handleBizChange("address", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              className="form-control"
              placeholder="+91 XXXXX XXXXX"
              value={bizForm.phone}
              onChange={(e) => handleBizChange("phone", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="info@yourbusiness.com"
              value={bizForm.email}
              onChange={(e) => handleBizChange("email", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>GSTIN</label>
            <input
              className="form-control"
              placeholder="e.g. 07AAAAA0000A1Z5"
              value={bizForm.gstin}
              onChange={(e) => handleBizChange("gstin", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>PAN Number</label>
            <input
              className="form-control"
              placeholder="e.g. AAAAA0000A"
              value={bizForm.pan}
              onChange={(e) => handleBizChange("pan", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Invoice Terms */}
      <div className="card settings-card">
        <h2 className="settings-section-title">Terms and Conditions</h2>
        <p className="settings-section-desc">
          One term per line. These appear at the bottom of every invoice.
        </p>
        <div className="form-group">
          <textarea
            className="form-control settings-terms-area"
            rows={8}
            placeholder={"Enter each term on a new line...\n\ne.g. Subject to jurisdiction.\nGoods once sold cannot be returned."}
            value={termsText}
            onChange={(e) => setTermsText(e.target.value)}
          />
        </div>
        <p className="settings-hint">{termCount} term{termCount !== 1 ? "s" : ""}</p>
      </div>

      <div className="settings-save-footer">
        <button className="btn btn-primary" onClick={handleSave}>
          <FiSave /> Save Changes
        </button>
      </div>
    </div>
  );
};

export default Settings;
