import { Link } from "react-router-dom";
import {
  BookOpen,
  CalendarCheck2,
  CreditCard,
  GraduationCap,
  MoveRight,
  Users,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { EmptyState } from "../ui/empty-state";

const iconMap = {
  student: Users,
  payment: CreditCard,
  attendance: CalendarCheck2,
  course: BookOpen,
  batch: GraduationCap,
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not available";

export default function DashboardRecentActivity({ items = [] }) {
  return (
    <Card className="rounded-[30px] border-border shadow-sm">
      <CardHeader className="border-b border-border bg-muted/10">
        <CardTitle className="text-2xl">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {items.length ? (
          items.map((item, index) => {
            const Icon = iconMap[item.type] || Users;

            return (
              <div
                key={`${item.type}-${index}`}
                className="rounded-3xl border border-border bg-background/60 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </p>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        {formatDate(item.date)}
                      </p>
                    </div>
                  </div>

                  {item.href ? (
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={item.href}>
                        <MoveRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState
            title="No activity yet"
            description="Recent admissions, payments, attendance saves, and setup actions will appear here."
          />
        )}
      </CardContent>
    </Card>
  );
}
