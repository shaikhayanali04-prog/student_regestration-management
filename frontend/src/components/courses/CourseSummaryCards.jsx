import { BookOpen, GraduationCap, Users, Zap } from "lucide-react";
import { Card, CardContent } from "../ui/card";

const cards = [
  {
    key: "total_courses",
    label: "Total Courses",
    icon: BookOpen,
    accent: "from-primary/20 to-violet-500/20",
  },
  {
    key: "active_courses",
    label: "Active Courses",
    icon: Zap,
    accent: "from-emerald-500/15 to-cyan-500/15",
  },
  {
    key: "total_batches",
    label: "Linked Batches",
    icon: GraduationCap,
    accent: "from-amber-500/15 to-orange-500/15",
  },
  {
    key: "enrolled_students",
    label: "Enrolled Students",
    icon: Users,
    accent: "from-blue-500/15 to-indigo-500/15",
  },
];

export default function CourseSummaryCards({ summary = {} }) {
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
                  {summary[card.key] || 0}
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
