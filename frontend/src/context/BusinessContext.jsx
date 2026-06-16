import { createContext, useContext, useState } from "react";

const DEFAULT_BUSINESS = {
  name: "",
  address: "",
  phone: "",
  email: "",
  gstin: "",
  pan: "",
};

const DEFAULT_TERMS = [
  "Subject to jurisdiction.",
  "Goods once sold, can be exchanged/returned subject to the company's refund/exchange policy.",
  "Products are sold with manufacturer warranty wherever applicable.",
  "Products sold subject to availability.",
  "*Terms & conditions apply as per company policy.",
];

const BusinessContext = createContext(null);

export const BusinessProvider = ({ children }) => {
  const [business, setBusiness] = useState(() => {
    try {
      const saved = localStorage.getItem("inv_business");
      return saved ? { ...DEFAULT_BUSINESS, ...JSON.parse(saved) } : DEFAULT_BUSINESS;
    } catch {
      return DEFAULT_BUSINESS;
    }
  });

  const [terms, setTerms] = useState(() => {
    try {
      const saved = localStorage.getItem("inv_terms");
      return saved ? JSON.parse(saved) : DEFAULT_TERMS;
    } catch {
      return DEFAULT_TERMS;
    }
  });

  const saveBusiness = (data) => {
    const merged = { ...DEFAULT_BUSINESS, ...data };
    setBusiness(merged);
    localStorage.setItem("inv_business", JSON.stringify(merged));
  };

  const saveTerms = (list) => {
    setTerms(list);
    localStorage.setItem("inv_terms", JSON.stringify(list));
  };

  return (
    <BusinessContext.Provider value={{ business, saveBusiness, terms, saveTerms }}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => useContext(BusinessContext);
