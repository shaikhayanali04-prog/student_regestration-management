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
    active_courses: 0,
    total_batches: 0,
    fees_collected: 0,
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
  positive: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  warning: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  destructive: "border-destructive/20 bg-destructive/10 text-destructive",
};

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
      <div className="space-y-8 pb-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-10 w-72 rounded-2xl" />
            <Skeleton className="h-4 w-80 rounded-full" />
          </div>
          <Skeleton className="h-12 w-48 rounded-full" />
        </div>
        <Skeleton className="h-64 rounded-[32px]" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Skeleton key={item} className="h-36 rounded-[28px]" />
          ))}
        </div>
        <Skeleton className="h-52 rounded-[30px]" />
        <div className="grid gap-6 xl:grid-cols-3">
          <Skeleton className="h-[360px] rounded-[30px] xl:col-span-2" />
          <Skeleton className="h-[360px] rounded-[30px]" />
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
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Operations Center
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
            Dashboard Command Center
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Monitor admissions, collections, attendance, and operating risks from one live command center.
          </p>
        </div>

        <div className="rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground shadow-sm">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      <Card className="overflow-hidden rounded-[32px] border-border bg-gradient-to-br from-primary/20 via-card to-card shadow-lg">
        <CardContent className="grid gap-6 p-6 xl:grid-cols-[1.2fr,0.8fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <Sparkles className="h-4 w-4" />
              Smart Dashboard
            </div>
            <h2 className="mt-5 text-4xl font-black tracking-tight text-foreground">
              {data.insights?.headline || "Institute pulse"}
            </h2>
            <p className="mt-3 max-w-2xl text-lg leading-8 text-muted-foreground">
              {data.insights?.subheadline}
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {(data.insights?.cards || []).map((card) => (
                <div
                  key={card.title}
                  className={`rounded-3xl border px-4 py-5 ${insightToneStyles[card.tone] || insightToneStyles.warning}`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em]">
                    Alert
                  </p>
                  <p className="mt-3 text-3xl font-black">{card.value}</p>
                  <p className="mt-2 text-sm font-semibold leading-6">{card.title}</p>
                  <p className="mt-2 text-sm leading-6 opacity-90">{card.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-border bg-background/80 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Suggested Actions
                </p>
                <p className="text-lg font-semibold text-foreground">What to do next</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {(data.insights?.suggestions || []).map((suggestion, index) => (
                <div key={index} className="rounded-2xl border border-border bg-muted/10 px-4 py-4 text-sm leading-6 text-foreground">
                  {suggestion}
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Today's Collection
                </p>
                <p className="mt-2 text-2xl font-black text-foreground">
                  {formatCurrency(data.insights?.today_snapshot?.collection || 0)}
                </p>
              </div>
              <div className="rounded-2xl border border-border p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Today's Attendance
                </p>
                <p className="mt-2 text-2xl font-black text-foreground">
                  {data.insights?.today_snapshot?.attendance_percentage || 0}%
                </p>
              </div>
            </div>

            <Button asChild className="mt-6 w-full gap-2">
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
        <Card className="rounded-[30px] border-border shadow-sm xl:col-span-2">
          <CardHeader className="border-b border-border bg-muted/10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">Revenue vs Expenses</CardTitle>
                <CardDescription>Fee collections and expenses across the last 6 months.</CardDescription>
              </div>
              <div className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
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
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rs. ${value}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderRadius: "12px",
                        border: "1px solid hsl(var(--border))",
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

        <Card className="rounded-[30px] border-border shadow-sm">
          <CardHeader className="border-b border-border bg-muted/10">
            <CardTitle className="text-2xl">Attendance Trend</CardTitle>
            <CardDescription>Daily attendance percentage over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {attendanceChart.length ? (
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted))" }}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderRadius: "12px",
                        border: "1px solid hsl(var(--border))",
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

      <Card className="rounded-[30px] border-border shadow-sm">
        <CardHeader className="border-b border-border bg-muted/10">
          <CardTitle className="text-2xl">Course Performance</CardTitle>
          <CardDescription>Top courses by enrolled students with collection depth.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 p-6 xl:grid-cols-[1.2fr,0.8fr]">
          <div>
            {courseChart.length ? (
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={courseChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="course_name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderRadius: "12px",
                        border: "1px solid hsl(var(--border))",
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
              <div key={course.course_id} className="rounded-3xl border border-border bg-background/60 p-5">
                <p className="font-semibold text-foreground">{course.course_name}</p>
                <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                  <p>
                    Students: <span className="font-medium text-foreground">{course.enrolled_students}</span>
                  </p>
                  <p>
                    Collected: <span className="font-medium text-foreground">{formatCurrency(course.collected_amount)}</span>
                  </p>
                  <p>
                    Pending: <span className="font-medium text-foreground">{formatCurrency(course.pending_amount)}</span>
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
    </div>
  );
}
