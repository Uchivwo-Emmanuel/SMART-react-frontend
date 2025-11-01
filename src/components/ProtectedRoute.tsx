import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.tsx";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { email, loading } = useAuth();

  if (loading) return <p className="p-4">Loading session…</p>;
  if (!email) return <Navigate to="/login" replace />; // ← forced redirect

  return <>{children}</>;
};
