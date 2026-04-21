import {
  CalendarClock,
  CheckCircle2,
  GraduationCap,
  Users,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const formatCurrency = (value) => (
  <>
    <span className="mr-1 font-sans text-gray-400">Rs.</span>
    <span className="font-mono">{Number(value || 0).toLocaleString("en-IN")}</span>
  </>
);

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not available";

function Section({ icon, title, items, emptyDescription, renderItem }) {
  const IconComponent = icon;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-sky-100 text-primary">
          <IconComponent className="h-5 w-5" />
        </div>
        <p className="font-display text-base font-semibold text-text-primary">{title}</p>
      </div>
      <div className="space-y-3 p-5">
        {items.length ? (
          items.map(renderItem)
        ) : (
          <div className="rounded-xl border border-green-100 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
              <div>
                <p className="font-medium text-green-700">All clear</p>
                <p className="mt-0.5 text-sm text-green-600">{emptyDescription}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardAlertsPanel({ alerts = {} }) {
  return (
    <Card>
      <CardHeader className="border-b border-gray-100 bg-slate-50/80">
        <CardTitle className="text-xl">Priority Panel</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 p-5 sm:p-6 xl:grid-cols-2">
        <Section
          icon={Wallet}
          title="Pending Fee Students"
          items={alerts.pending_fee_students || []}
          emptyDescription="All tracked fee ledgers are currently settled."
          renderItem={(item) => (
            <div
              key={`pending-${item.ledger_id}`}
              className="rounded-2xl border border-gray-100 bg-slate-50/70 p-4"
            >
              <p className="font-semibold text-text-primary">{item.student_name}</p>
              <p className="mt-1 text-sm text-text-secondary">
                {item.student_code} | {item.course_name}
              </p>
              <p className="mt-3 text-sm text-text-primary">
                Due {formatCurrency(item.due_amount)} by {formatDate(item.due_date)}
              </p>
            </div>
          )}
        />

        <Section
          icon={Users}
          title="Low Attendance Students"
          items={alerts.low_attendance_students || []}
          emptyDescription="Attendance risk is currently under control."
          renderItem={(item) => (
            <div
              key={`attendance-${item.student_id}`}
              className="rounded-2xl border border-gray-100 bg-slate-50/70 p-4"
            >
              <p className="font-semibold text-text-primary">{item.student_name}</p>
              <p className="mt-1 text-sm text-text-secondary">
                {item.student_code} | {item.batch_name}
              </p>
              <p className="mt-3 text-sm text-text-primary">
                Attendance {item.attendance_percentage}% across {item.total_sessions} sessions
              </p>
            </div>
          )}
        />

        <Section
          icon={GraduationCap}
          title="Underfilled Batches"
          items={alerts.underfilled_batches || []}
          emptyDescription="Current batch utilization looks healthy."
          renderItem={(item) => (
            <div
              key={`batch-${item.batch_id}`}
              className="rounded-2xl border border-gray-100 bg-slate-50/70 p-4"
            >
              <p className="font-semibold text-text-primary">{item.batch_name}</p>
              <p className="mt-1 text-sm text-text-secondary">
                {item.course_name} | {item.batch_code}
              </p>
              <p className="mt-3 text-sm text-text-primary">
                {item.student_count}/{item.capacity} seats filled ({item.fill_percentage}%)
              </p>
            </div>
          )}
        />

        <Section
          icon={CalendarClock}
          title="Upcoming Dues"
          items={alerts.upcoming_dues || []}
          emptyDescription="No fee due dates are scheduled in the next 7 days."
          renderItem={(item) => (
            <div
              key={`due-${item.ledger_id}`}
              className="rounded-2xl border border-gray-100 bg-slate-50/70 p-4"
            >
              <p className="font-semibold text-text-primary">{item.student_name}</p>
              <p className="mt-1 text-sm text-text-secondary">
                {item.batch_name || item.course_name}
              </p>
              <p className="mt-3 text-sm text-text-primary">
                {formatCurrency(item.due_amount)} due on {formatDate(item.due_date)}
              </p>
            </div>
          )}
        />
      </CardContent>
    </Card>
  );
}
