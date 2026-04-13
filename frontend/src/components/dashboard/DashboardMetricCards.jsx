import {
  BookOpen,
  CalendarCheck2,
  DollarSign,
  GraduationCap,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const cards = [
  {
    key: "total_students",
    label: "Total Students",
    icon: Users,
    accent: "from-blue-500/15 to-cyan-500/15",
    render: (overview) => overview.total_students || 0,
    helper: (overview) => `${overview.new_admissions_month || 0} new this month`,
  },
  {
    key: "active_courses",
    label: "Active Courses",
    icon: BookOpen,
    accent: "from-violet-500/15 to-fuchsia-500/15",
    render: (overview) => overview.active_courses || 0,
    helper: (overview) => `${overview.total_batches || 0} active/planned batches`,
  },
  {
    key: "fees_collected",
    label: "Fees Collected",
    icon: DollarSign,
    accent: "from-emerald-500/15 to-cyan-500/15",
    render: (overview) => formatCurrency(overview.fees_collected || 0),
    helper: (overview) => `${formatCurrency(overview.today_collection || 0)} collected today`,
  },
  {
    key: "pending_fees",
    label: "Pending Fees",
    icon: Wallet,
    accent: "from-amber-500/15 to-orange-500/15",
    render: (overview) => formatCurrency(overview.pending_fees || 0),
    helper: (overview) => `${formatCurrency(overview.overdue_fees || 0)} overdue`,
  },
  {
    key: "today_attendance_percentage",
    label: "Today Attendance",
    icon: CalendarCheck2,
    accent: "from-primary/20 to-sky-500/20",
    render: (overview) => `${overview.today_attendance_percentage || 0}%`,
    helper: () => "Present and late count as attended",
  },
  {
    key: "net_profit",
    label: "Net Profit",
    icon: TrendingUp,
    accent: "from-rose-500/15 to-red-500/15",
    render: (overview) => formatCurrency(overview.net_profit || 0),
    helper: (overview) => `${formatCurrency(overview.expenses_total || 0)} expenses tracked`,
  },
];

export default function DashboardMetricCards({ overview = {} }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.key}
            className={`overflow-hidden rounded-[28px] border-border bg-gradient-to-br ${card.accent}`}
          >
            <CardContent className="flex items-start justify-between p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  {card.label}
                </p>
                <p className="mt-3 text-3xl font-black tracking-tight text-foreground">
                  {card.render(overview)}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">{card.helper(overview)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background/70 text-primary shadow-sm">
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
