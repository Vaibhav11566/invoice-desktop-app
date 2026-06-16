import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { BusinessProvider } from "./context/BusinessContext.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import InvoiceList from "./pages/invoices/InvoiceList.jsx";
import CreateInvoice from "./pages/invoices/CreateInvoice.jsx";
import EditInvoice from "./pages/invoices/EditInvoice.jsx";
import InvoiceDetail from "./pages/invoices/InvoiceDetail.jsx";
import Settings from "./pages/Settings.jsx";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="loading-center" style={{ height: "100vh" }}>
        <div className="spinner" />
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="loading-center" style={{ height: "100vh" }}>
        <div className="spinner" />
      </div>
    );
  }
  return !user ? children : <Navigate to="/invoices" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route
      path="/login"
      element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      }
    />
    <Route
      path="/register"
      element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      }
    />
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="/invoices" replace />} />
      <Route path="invoices" element={<InvoiceList />} />
      <Route path="invoices/create" element={<CreateInvoice />} />
      <Route path="invoices/:id" element={<InvoiceDetail />} />
      <Route path="invoices/:id/edit" element={<EditInvoice />} />
      <Route path="settings" element={<Settings />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App = () => (
  <HashRouter>
    <BusinessProvider>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <AppRoutes />
      </AuthProvider>
    </BusinessProvider>
  </HashRouter>
);

export default App;
