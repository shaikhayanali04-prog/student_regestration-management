import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Layers3, LoaderCircle } from "lucide-react";
import { ModeToggle } from "../components/ModeToggle";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useTheme } from "../components/ThemeProvider";
import { useAuth } from "../context/AuthContext";
import useGoogleIdentity from "../hooks/useGoogleIdentity";
import { cn } from "../lib/utils";

const PLACEHOLDER_GOOGLE_CLIENT_ID = "your-google-client-id.apps.googleusercontent.com";

const getAuthErrorMessage = (requestError) => {
  if (requestError?.response?.data?.message) {
    return requestError.response.data.message;
  }

  if (requestError?.code === "ERR_NETWORK") {
    return "Unable to reach the ERP server. Check that the backend is running and try again.";
  }

  return "Server error. Please try again in a moment.";
};

export default function LoginScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { login, loginWithGoogle, isAuthenticated, authLoading } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const redirectPathname =
    location.state?.from?.pathname && location.state.from.pathname !== "/login"
      ? location.state.from.pathname
      : "/admin";
  const redirectSearch = typeof location.state?.from?.search === "string"
    ? location.state.from.search
    : "";
  const redirectHash = typeof location.state?.from?.hash === "string"
    ? location.state.from.hash
    : "";
  const googleClientId = typeof import.meta.env.VITE_GOOGLE_CLIENT_ID === "string"
    ? import.meta.env.VITE_GOOGLE_CLIENT_ID.trim()
    : "";
  const googleEnabled =
    googleClientId !== "" && googleClientId !== PLACEHOLDER_GOOGLE_CLIENT_ID;
  const resolvedTheme =
    theme === "system"
      ? document.documentElement.classList.contains("dark")
        ? "dark"
        : "light"
      : theme;
  const isDarkTheme = resolvedTheme === "dark";
  const isBusy = authLoading || loading || googleLoading;

  const handleSuccessfulLogin = useCallback(() => {
    navigate(
      {
        pathname: redirectPathname,
        search: redirectSearch,
        hash: redirectHash,
      },
      { replace: true },
    );
  }, [navigate, redirectHash, redirectPathname, redirectSearch]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      handleSuccessfulLogin();
    }
  }, [authLoading, handleSuccessfulLogin, isAuthenticated]);

  const handleGoogleScriptError = useCallback((message) => {
    setError((currentError) => currentError || message);
  }, []);

  const handleGoogleCredential = useCallback(async (credential) => {
    setGoogleLoading(true);
    setError("");
    setNotice("");

    try {
      await loginWithGoogle(credential);
      handleSuccessfulLogin();
    } catch (requestError) {
      setError(getAuthErrorMessage(requestError));
    } finally {
      setGoogleLoading(false);
    }
  }, [handleSuccessfulLogin, loginWithGoogle]);

  const { buttonRef, ready: googleReady } = useGoogleIdentity({
    enabled: googleEnabled,
    clientId: googleClientId,
    theme: resolvedTheme,
    onCredential: handleGoogleCredential,
    onScriptError: handleGoogleScriptError,
  });

  const handleLogin = async (event) => {
    event.preventDefault();

    const normalizedIdentifier = identifier.trim();
    if (normalizedIdentifier === "") {
      setError("Enter your email or phone number.");
      return;
    }

    if (password.trim() === "") {
      setError("Enter your password.");
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");

    try {
      await login({ identifier: normalizedIdentifier, password });
      handleSuccessfulLogin();
    } catch (requestError) {
      setError(getAuthErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const handleIdentifierChange = (event) => {
    setIdentifier(event.target.value);
    if (error) {
      setError("");
    }
    if (notice) {
      setNotice("");
    }
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    if (error) {
      setError("");
    }
    if (notice) {
      setNotice("");
    }
  };

  const handleForgotPassword = () => {
    setError("");
    setNotice("Forgot password recovery is not set up yet. Use your current password for now.");
  };

  const handleOtpRequest = () => {
    setError("");
    setNotice("OTP sign-in is planned next, but it is not available in this build yet.");
  };

  const showReturnMessage =
    Boolean(location.state?.from?.pathname) && redirectPathname !== "/admin";
  const googleStatusMessage = googleLoading
    ? "Signing you in with Google..."
    : !googleReady
      ? "Loading Google sign-in..."
      : "";

  return (
    <div
      className={cn(
        "relative min-h-screen overflow-hidden px-3 py-3 sm:px-5 sm:py-5",
        isDarkTheme ? "bg-[#0b1018] text-white" : "bg-[#edf2fb] text-slate-950",
      )}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-52",
            isDarkTheme
              ? "bg-[radial-gradient(circle_at_top,rgba(104,114,255,0.22),transparent_62%)]"
              : "bg-[radial-gradient(circle_at_top,rgba(93,122,255,0.18),transparent_62%)]",
          )}
        />
        <div
          className={cn(
            "absolute left-[-8%] top-1/3 h-56 w-56 rounded-full blur-3xl",
            isDarkTheme ? "bg-[rgba(86,98,255,0.08)]" : "bg-[rgba(111,134,255,0.12)]",
          )}
        />
        <div
          className={cn(
            "absolute right-[-10%] top-24 h-72 w-72 rounded-full blur-3xl",
            isDarkTheme ? "bg-[rgba(80,120,255,0.06)]" : "bg-[rgba(123,150,255,0.12)]",
          )}
        />
      </div>

      <div
        className={cn(
          "relative mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[840px] items-center justify-center rounded-[18px] px-4 py-6 backdrop-blur-xl sm:min-h-[calc(100vh-2.5rem)] sm:px-6 sm:py-8",
          isDarkTheme
            ? "border border-white/10 bg-[rgba(10,14,22,0.78)] shadow-[0_30px_120px_rgba(0,0,0,0.45)]"
            : "border border-slate-200/80 bg-[rgba(255,255,255,0.78)] shadow-[0_24px_100px_rgba(62,84,138,0.14)]",
        )}
      >
        <div className="absolute right-4 top-4 sm:right-5 sm:top-5">
          <ModeToggle />
        </div>

        <div className="w-full max-w-[460px]">
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6172ff] to-[#4b56e8] shadow-[0_14px_40px_rgba(97,114,255,0.35)]">
              <Layers3 className="h-4.5 w-4.5 text-white" />
            </div>
            <h1
              className={cn(
                "mt-3 font-display text-[1.7rem] font-extrabold tracking-tight sm:text-[1.95rem]",
                isDarkTheme ? "text-white" : "text-slate-950",
              )}
            >
              Smart Coaching ERP
            </h1>
            <p
              className={cn(
                "mt-1.5 text-base sm:text-[1.05rem]",
                isDarkTheme ? "text-slate-400" : "text-slate-600",
              )}
            >
              Sign in to access your institute dashboard
            </p>
          </div>

          <div
            className={cn(
              "relative rounded-[20px] px-5 py-6 sm:px-7 sm:py-7",
              isDarkTheme
                ? "border border-[#283245] bg-[#171e2a] shadow-[0_24px_80px_rgba(0,0,0,0.36)]"
                : "border border-slate-200 bg-[rgba(255,255,255,0.88)] shadow-[0_24px_80px_rgba(78,99,150,0.12)]",
            )}
          >
            <div>
              <h2
                className={cn(
                  "font-display text-[1.8rem] font-extrabold tracking-tight sm:text-[1.95rem]",
                  isDarkTheme ? "text-white" : "text-slate-950",
                )}
              >
                Welcome back
              </h2>
              <p
                className={cn(
                  "mt-1.5 text-[0.98rem] sm:text-[1.02rem]",
                  isDarkTheme ? "text-slate-400" : "text-slate-600",
                )}
              >
                Enter your registered email or phone to continue.
              </p>
            </div>

            {showReturnMessage ? (
              <div
                className={cn(
                  "mt-5 rounded-xl px-4 py-3 text-sm",
                  isDarkTheme
                    ? "border border-[#31405c] bg-[#121925] text-slate-300"
                    : "border border-indigo-100 bg-indigo-50 text-slate-700",
                )}
              >
                Sign in to continue where you left off.
              </div>
            ) : null}

            {authLoading ? (
              <div
                className={cn(
                  "mt-5 flex items-center gap-3 rounded-xl px-4 py-3 text-sm",
                  isDarkTheme
                    ? "border border-[#31405c] bg-[#121925] text-slate-300"
                    : "border border-slate-200 bg-slate-50 text-slate-700",
                )}
              >
                <LoaderCircle className="h-4 w-4 animate-spin text-[#7383ff]" />
                Checking for an active session...
              </div>
            ) : null}

            {notice ? (
              <div
                className="mt-5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
                role="status"
              >
                {notice}
              </div>
            ) : null}

            {error ? (
              <div
                className="mt-5 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                role="alert"
              >
                {error}
              </div>
            ) : null}

            <form onSubmit={handleLogin} className="mt-6 space-y-5">
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="login-email"
                    className={cn(
                      "text-[0.98rem] font-semibold",
                      isDarkTheme ? "text-slate-200" : "text-slate-800",
                    )}
                  >
                    Email or phone
                  </label>
                  <span className="rounded-md border border-lime-500/30 bg-lime-500/10 px-2 py-0.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-lime-300">
                    Clearer label
                  </span>
                </div>
                <Input
                  id="login-email"
                  type="text"
                  placeholder="Enter your email or phone"
                  value={identifier}
                  onChange={handleIdentifierChange}
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  disabled={isBusy}
                  required
                  autoFocus
                  className={cn(
                    "h-12 rounded-xl px-4 text-[0.98rem] font-semibold focus-visible:border-[#7383ff] focus-visible:ring-[#7383ff]/20",
                    isDarkTheme
                      ? "border-[#404655] bg-[#33322f] text-white placeholder:text-slate-500"
                      : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm",
                  )}
                />
              </div>

              <div className="space-y-2.5">
                <label
                  htmlFor="login-password"
                  className={cn(
                    "text-[0.98rem] font-semibold",
                    isDarkTheme ? "text-slate-200" : "text-slate-800",
                  )}
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={handlePasswordChange}
                    autoComplete="current-password"
                    disabled={isBusy}
                    required
                    className={cn(
                      "h-12 rounded-xl px-4 pr-12 text-[0.98rem] font-semibold focus-visible:border-[#7383ff] focus-visible:ring-[#7383ff]/20",
                      isDarkTheme
                        ? "border-[#404655] bg-[#33322f] text-white placeholder:text-slate-500"
                        : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm",
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword((currentValue) => !currentValue)}
                    disabled={isBusy}
                    className={cn(
                      "absolute right-1.5 top-1.5 h-9 w-9 rounded-lg",
                      isDarkTheme
                        ? "text-slate-400 hover:bg-white/5 hover:text-white"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                    )}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="flex items-center justify-end gap-3 text-sm">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className={cn(
                      "font-semibold text-[#7383ff] transition-colors",
                      isDarkTheme ? "hover:text-[#91a0ff]" : "hover:text-[#5265ff]",
                    )}
                  >
                    Forgot password?
                  </button>
                  <span className="rounded-md border border-lime-500/30 bg-lime-500/10 px-2 py-0.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-lime-300">
                    New
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isBusy}
                className={cn(
                  "h-12 w-full rounded-xl text-xl font-bold shadow-none hover:translate-y-0 hover:shadow-none",
                  isDarkTheme
                    ? "border border-[#4a5264] bg-transparent text-white hover:bg-white/5"
                    : "border border-slate-300 bg-white text-slate-950 hover:bg-slate-50",
                )}
              >
                {loading ? "Signing in..." : authLoading ? "Checking session..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-6">
              <div className={cn("flex items-center gap-4 text-sm", isDarkTheme ? "text-slate-500" : "text-slate-400")}>
                <div className={cn("h-px flex-1", isDarkTheme ? "bg-[#2f3848]" : "bg-slate-200")} />
                <span>or</span>
                <div className={cn("h-px flex-1", isDarkTheme ? "bg-[#2f3848]" : "bg-slate-200")} />
              </div>

              <Button
                type="button"
                variant="ghost"
                onClick={handleOtpRequest}
                className={cn(
                  "mt-5 h-12 w-full rounded-xl text-lg font-bold shadow-none hover:translate-y-0 hover:shadow-none",
                  isDarkTheme
                    ? "border border-[#4a5264] bg-transparent text-white hover:bg-white/5"
                    : "border border-slate-300 bg-white text-slate-950 hover:bg-slate-50",
                )}
              >
                <span>Send OTP instead</span>
                <span className="rounded-md border border-lime-500/30 bg-lime-500/10 px-2 py-0.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-lime-300">
                  New
                </span>
              </Button>
            </div>

            {googleEnabled ? (
              <div className="mt-5 space-y-3">
                <div
                  className={cn(
                    "rounded-xl px-3 py-3",
                    isDarkTheme
                      ? "border border-[#31405c] bg-[#121925]"
                      : "border border-slate-200 bg-slate-50",
                  )}
                >
                  <div ref={buttonRef} className="flex min-h-11 w-full items-center justify-center" />
                </div>
                {googleStatusMessage ? (
                  <p className={cn("text-center text-xs", isDarkTheme ? "text-slate-400" : "text-slate-500")}>
                    {googleStatusMessage}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
