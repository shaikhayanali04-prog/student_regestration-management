import { Link } from "react-router-dom";
import {
  BookOpen,
  CalendarCheck2,
  CreditCard,
  GraduationCap,
  PlusCircle,
  Users,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const actions = [
  {
    label: "Add Student",
    description: "Open the students workspace and create a new admission.",
    href: "/admin/students",
    icon: Users,
  },
  {
    label: "Create Course",
    description: "Configure a new course structure and pricing.",
    href: "/admin/courses",
    icon: BookOpen,
  },
  {
    label: "Create Batch",
    description: "Launch a new delivery batch and assign students.",
    href: "/admin/batches",
    icon: GraduationCap,
  },
  {
    label: "Record Fee",
    description: "Open fee ledgers and capture a new installment.",
    href: "/admin/fees",
    icon: CreditCard,
  },
  {
    label: "Mark Attendance",
    description: "Go to the daily attendance sheet for batch marking.",
    href: "/admin/attendance",
    icon: CalendarCheck2,
  },
];

export default function DashboardQuickActions() {
  return (
    <Card>
      <CardHeader className="border-b border-gray-100 bg-slate-50/80">
        <CardTitle className="text-xl">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-5">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <div
              key={action.label}
              className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-sky-100 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-display text-base font-semibold text-text-primary">{action.label}</p>
              <p className="mt-2 min-h-[48px] text-sm leading-6 text-text-secondary">
                {action.description}
              </p>
              <Button asChild className="mt-4 w-full">
                <Link to={action.href}>
                  <PlusCircle className="h-4 w-4" />
                  Open
                </Link>
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
