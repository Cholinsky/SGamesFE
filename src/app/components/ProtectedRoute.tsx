import { Navigate } from "react-router";
import { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {
  const {
    isAuthenticated,
    isLoading,
  } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-400">
        Verificando sesión...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  return <>{children}</>;
}