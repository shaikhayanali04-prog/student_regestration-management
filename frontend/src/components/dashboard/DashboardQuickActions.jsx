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
    <Card className="rounded-[30px] border-border shadow-sm">
      <CardHeader className="border-b border-border bg-muted/10">
        <CardTitle className="text-2xl">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-5">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <div
              key={action.label}
              className="rounded-3xl border border-border bg-background/60 p-5"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-semibold text-foreground">{action.label}</p>
              <p className="mt-2 min-h-[48px] text-sm leading-6 text-muted-foreground">
                {action.description}
              </p>
              <Button asChild className="mt-4 w-full gap-2">
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
