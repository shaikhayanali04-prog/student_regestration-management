import {
  AlertTriangle,
  CalendarCheck,
  CalendarClock,
  Users,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";

const cards = [
  {
    key: "today_percentage",
    label: "Today's Attendance",
    icon: CalendarCheck,
    accent: "from-emerald-500/15 to-cyan-500/15",
    formatter: (value) => `${value || 0}%`,
  },
  {
    key: "today_absent",
    label: "Today's Absences",
    icon: AlertTriangle,
    accent: "from-rose-500/15 to-orange-500/15",
    formatter: (value) => value || 0,
  },
  {
    key: "sessions_marked",
    label: "Sessions Logged",
    icon: CalendarClock,
    accent: "from-primary/20 to-violet-500/20",
    formatter: (value) => value || 0,
  },
  {
    key: "risk_count",
    label: "Low Attendance Alerts",
    icon: Users,
    accent: "from-amber-500/15 to-yellow-500/15",
    formatter: (value) => value || 0,
  },
];

export default function AttendanceSummaryCards({ report = {} }) {
  const values = {
    today_percentage: report.today?.attendance_percentage || 0,
    today_absent: report.today?.absent_count || 0,
    sessions_marked: report.summary?.sessions_marked || 0,
    risk_count: report.low_attendance_students?.length || 0,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                  {card.formatter(values[card.key])}
                </p>
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
