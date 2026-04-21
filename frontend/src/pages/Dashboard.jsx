import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  CalendarCheck2,
  Lightbulb,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";
import DashboardAlertsPanel from "../components/dashboard/DashboardAlertsPanel";
import DashboardMetricCards from "../components/dashboard/DashboardMetricCards";
import DashboardQuickActions from "../components/dashboard/DashboardQuickActions";
import DashboardRecentActivity from "../components/dashboard/DashboardRecentActivity";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { EmptyState } from "../components/ui/empty-state";
import { Skeleton } from "../components/ui/skeleton";
import dashboardService from "../services/dashboardService";

const initialState = {
  overview: {
    total_students: 0,
    active_students: 0,
    active_courses: 0,
    active_batches: 0,
    total_batches: 0,
    planned_batches: 0,
    fees_collected: 0,
    revenue_this_month: 0,
    pending_fees: 0,
    overdue_fees: 0,
    today_collection: 0,
    expenses_total: 0,
    net_profit: 0,
    new_admissions_month: 0,
    today_attendance_percentage: 0,
    underfilled_batches: 0,
  },
  charts: {
    revenue_trend: [],
    attendance_trend: [],
    course_performance: [],
  },
  recent_activity: [],
  alerts: {
    pending_fee_students: [],
    payment_risk_students: [],
    low_attendance_students: [],
    underfilled_batches: [],
    upcoming_dues: [],
  },
  insights: {
    headline: "",
    subheadline: "",
    cards: [],
    suggestions: [],
    priority_counts: {
      payment_risk: 0,
      low_attendance: 0,
      upcoming_dues: 0,
    },
    today_snapshot: {
      collection: 0,
      attendance_percentage: 0,
    },
  },
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const insightToneStyles = {
  positive: {
    container: "border-emerald-500/15 bg-emerald-500/[0.08] dark:bg-emerald-500/[0.10]",
    label: "text-emerald-700 dark:text-emerald-300",
    value: "text-emerald-900 dark:text-emerald-100",
    title: "text-emerald-900 dark:text-emerald-100",
    description: "text-emerald-800/80 dark:text-emerald-100/75",
  },
  warning: {
    container: "border-amber-500/15 bg-amber-500/[0.09] dark:bg-amber-500/[0.12]",
    label: "text-amber-700 dark:text-amber-300",
    value: "text-amber-900 dark:text-amber-100",
    title: "text-amber-900 dark:text-amber-100",
    description: "text-amber-900/75 dark:text-amber-100/75",
  },
  destructive: {
    container: "border-destructive/15 bg-destructive/[0.08] dark:bg-destructive/[0.12]",
    label: "text-destructive dark:text-rose-300",
    value: "text-rose-900 dark:text-rose-100",
    title: "text-rose-900 dark:text-rose-100",
    description: "text-rose-900/75 dark:text-rose-100/75",
  },
};

const MotionDiv = motion.div;

export default function Dashboard() {
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await dashboardService.getOverview();
      setData(response || initialState);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "We couldn't load the dashboard right now.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const revenueChart = useMemo(() => data.charts?.revenue_trend || [], [data.charts]);
  const attendanceChart = useMemo(() => data.charts?.attendance_trend || [], [data.charts]);
  const courseChart = useMemo(() => data.charts?.course_performance || [], [data.charts]);

  if (loading) {
    return (
      <div className="space-y-6 pb-10">
        <div className="page-header">
          <div className="space-y-3">
            <Skeleton className="h-3 w-32 rounded-full" />
            <Skeleton className="h-10 w-72 rounded-2xl" />
            <Skeleton className="h-4 w-80 rounded-full" />
          </div>
          <Skeleton className="h-10 w-48 rounded-full" />
        </div>
        <Skeleton className="h-64 rounded-2xl" />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Skeleton key={item} className="h-36 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-52 rounded-2xl" />
        <div className="grid gap-6 xl:grid-cols-3">
          <Skeleton className="h-[360px] rounded-2xl xl:col-span-2" />
          <Skeleton className="h-[360px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Dashboard unavailable"
        description={error}
        action={<Button onClick={loadDashboard}>Retry Dashboard</Button>}
      />
    );
  }

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-6 pb-10"
    >
      <div className="page-header">
        <div>
          <p className="page-kicker">Operations Center</p>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">
            Monitor admissions, collections, attendance, and operating risks from one live command center.
          </p>
        </div>

        <div className="inline-flex items-center rounded-full border border-border/80 bg-card/80 px-4 py-2.5 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      <Card className="relative overflow-hidden border-border/80 bg-card/95 shadow-card">
        <div className="pointer-events-none absolute inset-0 hero-mesh opacity-50 dark:opacity-30" />
        <div className="pointer-events-none absolute inset-0 soft-grid opacity-40 [mask-image:radial-gradient(circle_at_top_left,black,transparent_75%)] dark:opacity-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-primary/10 via-primary/5 to-transparent dark:from-primary/12 dark:via-primary/4 dark:to-transparent" />
        <CardContent className="relative grid gap-6 p-5 sm:p-6 xl:grid-cols-[1.2fr,0.8fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Smart Dashboard
            </div>
            <h2 className="mt-5 max-w-3xl font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {data.insights?.headline || "Institute pulse"}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              {data.insights?.subheadline}
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {(data.insights?.cards || []).map((card) => {
                const toneStyles = insightToneStyles[card.tone] || insightToneStyles.warning;

                return (
                <div
                  key={card.title}
                  className={`rounded-[1.5rem] border px-4 py-5 shadow-sm backdrop-blur ${toneStyles.container}`}
                >
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${toneStyles.label}`}>
                    Alert
                  </p>
                  <p className={`mt-3 font-mono text-3xl font-bold ${toneStyles.value}`}>{card.value}</p>
                  <p className={`mt-2 text-sm font-semibold leading-6 ${toneStyles.title}`}>{card.title}</p>
                  <p className={`mt-2 text-sm leading-6 ${toneStyles.description}`}>{card.description}</p>
                </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-border/80 bg-background/55 p-5 shadow-card backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary shadow-sm">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Suggested Actions
                </p>
                <p className="font-display text-lg font-semibold text-foreground">What to do next</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {(data.insights?.suggestions || []).map((suggestion, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-border/70 bg-background/65 px-4 py-4 text-sm leading-6 text-foreground shadow-sm"
                >
                  {suggestion}
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-background/60 p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Today's Collection
                </p>
                <p className="mt-2 font-mono text-2xl font-bold text-foreground">
                  {formatCurrency(data.insights?.today_snapshot?.collection || 0)}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/60 p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Today's Attendance
                </p>
                <p className="mt-2 font-mono text-2xl font-bold text-foreground">
                  {data.insights?.today_snapshot?.attendance_percentage || 0}%
                </p>
              </div>
            </div>

            <Button asChild className="mt-6 w-full gap-2 shadow-sm">
              <Link to="/admin/fees">
                <TrendingUp className="h-4 w-4" />
                Review Priority Work
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <DashboardMetricCards overview={data.overview} />

      <DashboardQuickActions />

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="border-b border-gray-100 bg-slate-50/80">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Revenue vs Expenses</CardTitle>
                <CardDescription>Fee collections and expenses across the last 6 months.</CardDescription>
              </div>
              <div className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-text-secondary">
                Last 6 months
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {revenueChart.length ? (
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dashboardRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="dashboardExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fb7185" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(148, 163, 184, 0.25)" />
                    <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rs. ${value}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderRadius: "16px",
                        border: "1px solid rgba(229, 231, 235, 1)",
                        boxShadow: "0 16px 32px rgba(15, 23, 42, 0.08)",
                      }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#dashboardRevenue)" strokeWidth={3} />
                    <Area type="monotone" dataKey="expenses" stroke="#fb7185" fill="url(#dashboardExpense)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                title="No revenue trend yet"
                description="Fee collections and expenses will appear here once operational data is recorded."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-gray-100 bg-slate-50/80">
            <CardTitle className="text-xl">Attendance Trend</CardTitle>
            <CardDescription>Daily attendance percentage over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {attendanceChart.length ? (
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(148, 163, 184, 0.25)" />
                    <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted))" }}
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderRadius: "16px",
                        border: "1px solid rgba(229, 231, 235, 1)",
                        boxShadow: "0 16px 32px rgba(15, 23, 42, 0.08)",
                      }}
                    />
                    <Bar dataKey="attendance_percentage" fill="hsl(var(--primary))" radius={[10, 10, 0, 0]} maxBarSize={42} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                icon={CalendarCheck2}
                title="No attendance trend yet"
                description="Start marking attendance to populate the weekly operational trend."
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-gray-100 bg-slate-50/80">
          <CardTitle className="text-xl">Course Performance</CardTitle>
          <CardDescription>Top courses by enrolled students with collection depth.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[1.2fr,0.8fr]">
          <div>
            {courseChart.length ? (
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={courseChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(148, 163, 184, 0.25)" />
                    <XAxis dataKey="course_name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderRadius: "16px",
                        border: "1px solid rgba(229, 231, 235, 1)",
                        boxShadow: "0 16px 32px rgba(15, 23, 42, 0.08)",
                      }}
                    />
                    <Bar dataKey="enrolled_students" fill="hsl(var(--primary))" radius={[10, 10, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                title="No course performance data"
                description="Course metrics will appear here once students start enrolling."
              />
            )}
          </div>

          <div className="space-y-4">
            {courseChart.map((course) => (
              <div key={course.course_id} className="rounded-2xl border border-gray-100 bg-slate-50/70 p-5 shadow-sm">
                <p className="font-display text-base font-semibold text-text-primary">{course.course_name}</p>
                <div className="mt-3 grid gap-2 text-sm text-text-secondary">
                  <p>
                    Students: <span className="font-medium text-text-primary">{course.enrolled_students}</span>
                  </p>
                  <p>
                    Collected: <span className="font-medium text-text-primary">{formatCurrency(course.collected_amount)}</span>
                  </p>
                  <p>
                    Pending: <span className="font-medium text-text-primary">{formatCurrency(course.pending_amount)}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <DashboardRecentActivity items={data.recent_activity} />
        <DashboardAlertsPanel alerts={data.alerts} />
      </div>
    </MotionDiv>
  );
}
