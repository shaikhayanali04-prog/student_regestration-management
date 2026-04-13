import { AlertTriangle, CalendarClock, GraduationCap, Users, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { EmptyState } from "../ui/empty-state";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not available";

function Section({ icon, title, items, emptyTitle, emptyDescription, renderItem }) {
  const IconComponent = icon;

  return (
    <div className="rounded-3xl border border-border bg-background/60">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <IconComponent className="h-5 w-5" />
        </div>
        <p className="font-semibold text-foreground">{title}</p>
      </div>
      <div className="space-y-3 p-5">
        {items.length ? (
          items.map(renderItem)
        ) : (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        )}
      </div>
    </div>
  );
}

export default function DashboardAlertsPanel({ alerts = {} }) {
  return (
    <Card className="rounded-[30px] border-border shadow-sm">
      <CardHeader className="border-b border-border bg-muted/10">
        <CardTitle className="text-2xl">Priority Panel</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 p-6 xl:grid-cols-2">
        <Section
          icon={Wallet}
          title="Pending Fee Students"
          items={alerts.pending_fee_students || []}
          emptyTitle="No pending fees"
          emptyDescription="All tracked fee ledgers are currently settled."
          renderItem={(item) => (
            <div key={`pending-${item.ledger_id}`} className="rounded-2xl border border-border p-4">
              <p className="font-semibold text-foreground">{item.student_name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.student_code} - {item.course_name}
              </p>
              <p className="mt-3 text-sm text-foreground">
                Due {formatCurrency(item.due_amount)} by {formatDate(item.due_date)}
              </p>
            </div>
          )}
        />

        <Section
          icon={Users}
          title="Low Attendance Students"
          items={alerts.low_attendance_students || []}
          emptyTitle="No low-attendance alerts"
          emptyDescription="Attendance risk is currently under control."
          renderItem={(item) => (
            <div key={`attendance-${item.student_id}`} className="rounded-2xl border border-border p-4">
              <p className="font-semibold text-foreground">{item.student_name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.student_code} - {item.batch_name}
              </p>
              <p className="mt-3 text-sm text-foreground">
                Attendance {item.attendance_percentage}% across {item.total_sessions} sessions
              </p>
            </div>
          )}
        />

        <Section
          icon={GraduationCap}
          title="Underfilled Batches"
          items={alerts.underfilled_batches || []}
          emptyTitle="No underfilled batches"
          emptyDescription="Current batch utilization looks healthy."
          renderItem={(item) => (
            <div key={`batch-${item.batch_id}`} className="rounded-2xl border border-border p-4">
              <p className="font-semibold text-foreground">{item.batch_name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.course_name} - {item.batch_code}
              </p>
              <p className="mt-3 text-sm text-foreground">
                {item.student_count}/{item.capacity} seats filled ({item.fill_percentage}%)
              </p>
            </div>
          )}
        />

        <Section
          icon={CalendarClock}
          title="Upcoming Dues"
          items={alerts.upcoming_dues || []}
          emptyTitle="No upcoming dues"
          emptyDescription="No fee due dates are scheduled in the next 7 days."
          renderItem={(item) => (
            <div key={`due-${item.ledger_id}`} className="rounded-2xl border border-border p-4">
              <p className="font-semibold text-foreground">{item.student_name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.batch_name || item.course_name}
              </p>
              <p className="mt-3 text-sm text-foreground">
                {formatCurrency(item.due_amount)} due on {formatDate(item.due_date)}
              </p>
            </div>
          )}
        />
      </CardContent>
    </Card>
  );
}
