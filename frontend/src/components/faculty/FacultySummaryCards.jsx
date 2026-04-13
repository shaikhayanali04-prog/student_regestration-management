import { Briefcase, GraduationCap, ShieldCheck, UserRound, Users } from "lucide-react";
import { Card, CardContent } from "../ui/card";

const cards = [
  {
    key: "total_faculty",
    label: "Total Faculty",
    icon: UserRound,
    accent: "from-primary/20 to-indigo-500/20",
    render: (summary) => summary.total_faculty || 0,
    helper: () => "All active and inactive records",
  },
  {
    key: "active_faculty",
    label: "Active Faculty",
    icon: ShieldCheck,
    accent: "from-emerald-500/15 to-cyan-500/15",
    render: (summary) => summary.active_faculty || 0,
    helper: () => "Available for current assignments",
  },
  {
    key: "inactive_faculty",
    label: "Inactive Faculty",
    icon: Briefcase,
    accent: "from-amber-500/15 to-orange-500/15",
    render: (summary) => summary.inactive_faculty || 0,
    helper: () => "Archived or temporarily unavailable",
  },
  {
    key: "assigned_batches",
    label: "Assigned Batches",
    icon: GraduationCap,
    accent: "from-violet-500/15 to-fuchsia-500/15",
    render: (summary) => summary.assigned_batches || 0,
    helper: () => "Live batch ownership count",
  },
  {
    key: "student_coverage",
    label: "Student Coverage",
    icon: Users,
    accent: "from-blue-500/15 to-cyan-500/15",
    render: (summary) => summary.student_coverage || 0,
    helper: () => "Students reached through assigned batches",
  },
];

export default function FacultySummaryCards({ summary = {} }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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
                  {card.render(summary)}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">{card.helper(summary)}</p>
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
