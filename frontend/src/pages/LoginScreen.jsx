import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { useTheme } from '../components/ThemeProvider';
import { useAuth } from '../context/AuthContext';
import useGoogleIdentity from '../hooks/useGoogleIdentity';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const DEMO_EMAIL = 'admin@example.com';
const DEMO_PHONE = '9876543210';
const DEMO_PASSWORD = 'password123';

const trustPoints = [
  'Login with your registered institute email or mobile number',
  'Google sign-in links to matching ERP users securely',
  'Session-based access is now protected across the admin app',
];

const statCards = [
  { label: 'Secured modules', value: '16+' },
  { label: 'Live workflows', value: 'Students, fees, batches' },
  { label: 'Access model', value: 'Session + Google' },
];

const MotionDiv = motion.div;

export default function LoginScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { login, loginWithGoogle, isAuthenticated, authLoading } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const redirectTo = location.state?.from?.pathname || '/admin';

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, redirectTo]);

  const resolvedTheme = useMemo(() => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    return theme;
  }, [theme]);

  const handleGoogleCredential = useCallback(
    async (credential) => {
      try {
        setGoogleLoading(true);
        setError('');
        await loginWithGoogle(credential);
        navigate(redirectTo, { replace: true });
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message ||
            'Google sign-in could not be completed right now.',
        );
      } finally {
        setGoogleLoading(false);
      }
    },
    [loginWithGoogle, navigate, redirectTo],
  );

  const { buttonRef, ready: googleReady } = useGoogleIdentity({
    enabled: Boolean(GOOGLE_CLIENT_ID),
    clientId: GOOGLE_CLIENT_ID,
    theme: resolvedTheme,
    onCredential: handleGoogleCredential,
    onScriptError: setError,
  });

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ identifier, password });
      navigate(redirectTo, { replace: true });
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          'Server error. Please try again in a moment.',
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (mode) => {
    setIdentifier(mode === 'phone' ? DEMO_PHONE : DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError('');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[460px] w-[840px] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]" />
        <div className="absolute -left-20 bottom-10 h-[280px] w-[280px] rounded-full bg-indigo-500/15 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-[320px] w-[320px] rounded-full bg-fuchsia-500/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_35%),linear-gradient(to_bottom,transparent,rgba(0,0,0,0.05))]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.08fr,0.92fr] lg:items-center">
          <MotionDiv
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="hidden rounded-[36px] border border-border/70 bg-card/60 p-8 shadow-2xl backdrop-blur-xl lg:block"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-primary">
              <Sparkles className="h-4 w-4" />
              SmartERP Secure Access
            </div>

            <h1 className="mt-8 text-5xl font-black tracking-tight text-foreground">
              Welcome back to the
              <span className="block bg-gradient-to-r from-primary via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
                coaching command center.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
              Sign in with your institute-linked phone, email, or Google account to
              manage admissions, batches, fees, attendance, and AI insights from one
              premium workspace.
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {statCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-3xl border border-border/70 bg-background/60 p-5 shadow-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {card.label}
                  </p>
                  <p className="mt-3 text-xl font-black text-foreground">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 space-y-4">
              {trustPoints.map((point) => (
                <div key={point} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/50 px-4 py-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{point}</p>
                </div>
              ))}
            </div>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.08 }}
            className="mx-auto w-full max-w-xl"
          >
            <div className="mb-6 text-center lg:text-left">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm backdrop-blur lg:mx-0">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Production login for Smart Coaching ERP
              </div>
            </div>

            <Card className="overflow-hidden rounded-[36px] border border-border/80 bg-card/80 shadow-[0_30px_100px_rgba(0,0,0,0.25)] backdrop-blur-xl">
              <CardContent className="p-0">
                <div className="border-b border-border/70 bg-gradient-to-br from-primary/15 via-background to-background px-6 py-7 sm:px-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-primary">
                        Sign In
                      </p>
                      <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">
                        Access your institute workspace
                      </h2>
                      <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                        Use your registered email or mobile number with password, or continue
                        with a linked Google account.
                      </p>
                    </div>
                    <div className="hidden h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary sm:flex">
                      <LockKeyhole className="h-6 w-6" />
                    </div>
                  </div>
                </div>

                <div className="space-y-6 px-6 py-7 sm:px-8">
                  {error ? (
                    <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                      {error}
                    </div>
                  ) : null}

                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Email address or phone number
                      </label>
                      <div className="relative">
                        <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="admin@example.com or 9876543210"
                          value={identifier}
                          onChange={(event) => setIdentifier(event.target.value)}
                          disabled={loading || googleLoading}
                          className="h-12 rounded-2xl border-border/70 bg-background/80 pl-11 text-sm shadow-sm"
                          required
                        />
                      </div>
                      <p className="text-xs leading-5 text-muted-foreground">
                        Phone login uses the admin mobile number stored in your ERP user record.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Password</label>
                      <div className="relative">
                        <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          disabled={loading || googleLoading}
                          className="h-12 rounded-2xl border-border/70 bg-background/80 pl-11 pr-12 text-sm shadow-sm"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((current) => !current)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button
                        type="submit"
                        className="h-12 flex-1 rounded-2xl text-sm font-semibold shadow-lg shadow-primary/20"
                        disabled={loading || googleLoading}
                      >
                        {loading ? 'Signing in...' : 'Sign In to Dashboard'}
                        {!loading ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 rounded-2xl border-border/70 px-5"
                        onClick={() => {
                          setIdentifier('');
                          setPassword('');
                          setError('');
                        }}
                        disabled={loading || googleLoading}
                      >
                        Clear
                      </Button>
                    </div>
                  </form>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border/70" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-card px-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        Or continue with Google
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {GOOGLE_CLIENT_ID ? (
                      <div className="rounded-3xl border border-border/70 bg-background/60 p-4">
                        <div ref={buttonRef} className="min-h-[44px] w-full" />
                        {!googleReady || googleLoading ? (
                          <p className="mt-3 text-xs text-muted-foreground">
                            {googleLoading
                              ? 'Completing Google sign-in...'
                              : 'Preparing secure Google sign-in...'}
                          </p>
                        ) : (
                          <p className="mt-3 text-xs text-muted-foreground">
                            Google login works for linked ERP accounts and configured domains.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-3xl border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                        Google sign-in is ready in code. Add <code>VITE_GOOGLE_CLIENT_ID</code> on the frontend
                        and <code>SMARTERP_GOOGLE_CLIENT_ID</code> on the backend to enable it.
                      </div>
                    )}
                  </div>

                  <div className="rounded-[28px] border border-border/70 bg-background/50 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                          Demo Access
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          Use the seeded admin account by email or phone while setting up your own users.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => fillDemo('email')}>
                          Use Email
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => fillDemo('phone')}>
                          Use Phone
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 rounded-3xl border border-border/70 bg-card/80 p-4 text-sm text-foreground sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Email
                        </p>
                        <p className="mt-2 font-medium">{DEMO_EMAIL}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Phone
                        </p>
                        <p className="mt-2 font-medium">{DEMO_PHONE}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Password
                        </p>
                        <p className="mt-2 font-medium">{DEMO_PASSWORD}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </MotionDiv>
        </div>
      </div>
    </div>
  );
}
