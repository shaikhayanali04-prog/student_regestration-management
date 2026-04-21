import { CalendarDays, GraduationCap, Users, Zap } from "lucide-react";
import { Card, CardContent } from "../ui/card";

const cards = [
  {
    key: "total_batches",
    label: "Total Batches",
    icon: GraduationCap,
    accent: "from-primary/20 to-fuchsia-500/20",
  },
  {
    key: "active_batches",
    label: "Active Batches",
    icon: Zap,
    accent: "from-emerald-500/15 to-cyan-500/15",
  },
  {
    key: "planned_batches",
    label: "Planned Batches",
    icon: CalendarDays,
    accent: "from-amber-500/15 to-orange-500/15",
  },
  {
    key: "assigned_students",
    label: "Assigned Students",
    icon: Users,
    accent: "from-blue-500/15 to-indigo-500/15",
  },
];

export default function BatchSummaryCards({ summary = {} }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.key} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 font-mono">
                {summary[card.key] || 0}
              </p>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-0.5">
                {card.label}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
