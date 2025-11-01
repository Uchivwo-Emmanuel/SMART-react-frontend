import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./auth/LoginPage";
import SignupPage from "./auth/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import StockPage from "./pages/StockPage";
import { Toaster } from "react-hot-toast";
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";
import StorePage from "./pages/StorePage.tsx";
import PlaceOrderPage from "./pages/PlaceOrderPage.tsx";
import TransactionHistory from "./pages/TransactionHistory.tsx";
import { AuthProvider } from "./auth/AuthProvider.tsx";
import AppLayout from "./Layouts/AppLayout.tsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {" "}
        {/*  ALWAYS outside every Route  */}
        <Routes>
          {/* 1.  auth pages (no sidebar) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* 2.  protected pages (sidebar + outlet) */}
          <Route element={<AppLayout />}>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stock"
              element={
                <ProtectedRoute>
                  <StockPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/store"
              element={
                <ProtectedRoute>
                  <StorePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order"
              element={
                <ProtectedRoute>
                  <PlaceOrderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <TransactionHistory />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* 3.  default */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
