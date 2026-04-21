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
    <Card>
      <CardHeader className="border-b border-gray-100 bg-slate-50/80">
        <CardTitle className="text-xl">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-5 sm:p-6">
        {items.length ? (
          items.map((item, index) => {
            const Icon = iconMap[item.type] || Users;

            return (
              <div
                key={`${item.type}-${index}`}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-sky-100 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-display text-base font-semibold text-text-primary">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-text-secondary">
                        {item.description}
                      </p>
                      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                        {formatDate(item.date)}
                      </p>
                    </div>
                  </div>

                  {item.href ? (
                    <Button variant="outline" size="icon" asChild>
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
