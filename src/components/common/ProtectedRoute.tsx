import { JSX, useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

interface ProtectedRouteProps {
  children: JSX.Element;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const auth = useContext(AuthContext);

  if (auth?.loading) return null;

  if (!auth?.token) return <Navigate to="/login" replace />;

  if (adminOnly && auth?.user?.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
