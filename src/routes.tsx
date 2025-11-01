import StockPage from "./pages/StockPage";
import StorePage from "./pages/StorePage";
import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "./auth/LoginPage.tsx";
import SignupPage from "./auth/SignupPage.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import AppLayout from "./Layouts/AppLayout.tsx";

export const router = createBrowserRouter([
  // 1.  auth pages  (no sidebar)
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },

  // 2.  protected pages  (with sidebar)
  {
    element: <AppLayout />,
    children: [
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/stock",
        element: (
          <ProtectedRoute>
            <StockPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/store",
        element: (
          <ProtectedRoute>
            <StorePage />
          </ProtectedRoute>
        ),
      },
      { path: "/", element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);
