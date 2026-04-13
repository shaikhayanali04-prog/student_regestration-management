import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-sm rounded-[28px] border border-border bg-card/80 p-8 text-center shadow-xl backdrop-blur">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <ShieldCheck className="h-8 w-8 animate-pulse" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-foreground">Verifying access</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Checking your secure ERP session before loading the dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
