import {
  CalendarCheck2,
  CreditCard,
  GraduationCap,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";

const formatCount = (value) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatPercentage = (value) => {
  const numericValue = Number(value) || 0;
  return `${Number.isInteger(numericValue) ? numericValue : numericValue.toFixed(1)}%`;
};

const cards = [
  {
    key: "total_students",
    label: "Total Students",
    icon: Users,
    accent: "from-primary/10 to-sky-100",
    valueClassName: "text-[clamp(2.25rem,2.4vw,2.9rem)]",
    render: (overview) => formatCount(overview.total_students),
    helper: (overview) =>
      `${formatCount(overview.new_admissions_month)} new admissions this month`,
  },
  {
    key: "active_students",
    label: "Active Students",
    icon: UserCheck,
    accent: "from-emerald-100 to-teal-100",
    valueClassName: "text-[clamp(2.25rem,2.4vw,2.9rem)]",
    render: (overview) => formatCount(overview.active_students),
    helper: (overview) =>
      `${formatCount(Math.max((overview.total_students || 0) - (overview.active_students || 0), 0))} inactive or completed`,
  },
  {
    key: "active_batches",
    label: "Active Batches",
    icon: GraduationCap,
    accent: "from-violet-100 to-indigo-100",
    valueClassName: "text-[clamp(2.25rem,2.4vw,2.9rem)]",
    render: (overview) => formatCount(overview.active_batches),
    helper: (overview) =>
      `${formatCount(overview.planned_batches)} planned, ${formatCount(overview.underfilled_batches)} underfilled`,
  },
  {
    key: "revenue_month",
    label: "Revenue This Month",
    icon: TrendingUp,
    accent: "from-amber-100 to-orange-100",
    valueClassName: "text-[clamp(1.9rem,2.05vw,2.45rem)] tracking-[-0.06em]",
    render: (overview) => formatCurrency(overview.revenue_this_month),
    helper: (overview) => `${formatCurrency(overview.today_collection)} collected today`,
  },
  {
    key: "pending_fees",
    label: "Pending Fees",
    icon: CreditCard,
    accent: "from-rose-100 to-pink-100",
    valueClassName: "text-[clamp(1.9rem,2.05vw,2.45rem)] tracking-[-0.06em]",
    render: (overview) => formatCurrency(overview.pending_fees),
    helper: (overview) => `${formatCurrency(overview.overdue_fees)} overdue`,
  },
  {
    key: "attendance_rate",
    label: "Attendance Rate",
    icon: CalendarCheck2,
    accent: "from-cyan-100 to-sky-100",
    valueClassName: "text-[clamp(2.25rem,2.4vw,2.9rem)]",
    render: (overview) => formatPercentage(overview.today_attendance_percentage),
    helper: () => "Today's attendance capture",
  },
];

export default function DashboardMetricCards({ overview = {} }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:[grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.key}
            className="overflow-hidden border-border/80 bg-card shadow-card transition-shadow duration-200 hover:shadow-lift"
          >
            <CardContent className="relative min-h-[230px] p-5 sm:min-h-[240px] sm:p-6">
              <div
                className={`absolute right-5 top-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} text-primary shadow-sm sm:right-6 sm:top-6`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="flex h-full flex-col pr-16 sm:pr-20">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  {card.label}
                </p>
                <p
                  className={`mt-8 font-mono font-bold leading-[0.92] text-foreground ${card.valueClassName || "text-[clamp(2rem,2.2vw,2.5rem)] tracking-tight"}`}
                >
                  {card.render(overview)}
                </p>
                <p className="mt-auto max-w-[18ch] pt-6 text-sm leading-8 text-muted-foreground">
                  {card.helper(overview)}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
