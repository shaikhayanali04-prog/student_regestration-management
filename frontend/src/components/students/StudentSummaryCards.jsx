import { Filter, GraduationCap, UserPlus, Users } from "lucide-react";
import { Card, CardContent } from "../ui/card";

const summaryCardConfig = [
  {
    key: "total_students",
    label: "Total Students",
    accent: "from-primary/20 to-fuchsia-500/20",
    icon: Users,
  },
  {
    key: "active_students",
    label: "Active Students",
    accent: "from-emerald-500/15 to-cyan-500/15",
    icon: UserPlus,
  },
  {
    key: "inactive_students",
    label: "Inactive",
    accent: "from-amber-500/15 to-orange-500/15",
    icon: Filter,
  },
  {
    key: "dropped_students",
    label: "Dropped / Risk",
    accent: "from-rose-500/15 to-red-500/15",
    icon: GraduationCap,
  },
];

export default function StudentSummaryCards({ summary = {} }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {summaryCardConfig.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.key} className="overflow-hidden border-gray-100 bg-white">
            <CardContent className="flex items-start justify-between gap-4 p-5 sm:p-6">
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                  {card.label}
                </p>
                <p className="font-mono text-3xl font-bold tracking-tight text-text-primary">
                  {summary[card.key] || 0}
                </p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} text-primary shadow-sm`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
