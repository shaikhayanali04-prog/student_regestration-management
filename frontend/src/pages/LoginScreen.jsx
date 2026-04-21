import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, authLoading } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectTo = location.state?.from?.pathname || "/admin";

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, redirectTo]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login({ identifier, password });
      navigate(redirectTo, { replace: true });
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Server error. Please try again in a moment.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8 text-foreground sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="font-display text-3xl font-bold tracking-tight text-foreground">
            Smart Coaching ERP
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to access your institute dashboard.
          </p>
        </div>

        <Card className="border-border bg-card shadow-card">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Use your registered email and password to continue.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error ? (
              <div className="mb-5 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="login-email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <Input
                  id="login-email"
                  type="text"
                  placeholder="Enter your email"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="login-password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
