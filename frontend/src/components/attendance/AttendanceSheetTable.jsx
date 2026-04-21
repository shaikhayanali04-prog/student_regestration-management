import { Card, CardContent } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const getStatusTone = (status, active) => {
  if (!active) {
    return "border-gray-200 bg-white text-text-secondary hover:border-primary/20 hover:bg-primary/5 hover:text-primary";
  }

  if (status === "Present") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "Absent") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
};

function StatusButtons({ student, statuses, onStatusChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => (
        <button
          key={status}
          type="button"
          onClick={() => onStatusChange(student.student_id, status)}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${getStatusTone(
            status,
            student.status === status,
          )}`}
        >
          {status}
        </button>
      ))}
    </div>
  );
}

export default function AttendanceSheetTable({
  students,
  statuses,
  onStatusChange,
  onRemarksChange,
}) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-gray-100 bg-white lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.student_id}>
                <TableCell>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-sky-100 font-display text-sm font-bold text-primary">
                      {student.student_name?.charAt(0) || "S"}
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">{student.student_name}</p>
                      <p className="text-sm text-text-secondary">{student.student_code}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-text-primary">{student.phone || "Phone not available"}</p>
                  <p className="text-sm text-text-secondary">
                    Joined {student.joined_date || "not recorded"}
                  </p>
                </TableCell>
                <TableCell>
                  <StatusButtons
                    student={student}
                    statuses={statuses}
                    onStatusChange={onStatusChange}
                  />
                </TableCell>
                <TableCell>
                  <input
                    value={student.remarks || ""}
                    onChange={(event) =>
                      onRemarksChange(student.student_id, event.target.value)
                    }
                    placeholder="Optional note"
                    className="flex h-10 w-full min-w-[240px] rounded-lg border border-gray-200 bg-white px-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-4 lg:hidden">
        {students.map((student) => (
          <Card key={student.student_id}>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-sky-100 font-display text-sm font-bold text-primary">
                  {student.student_name?.charAt(0) || "S"}
                </div>
                <div>
                  <p className="font-semibold text-text-primary">{student.student_name}</p>
                  <p className="text-sm text-text-secondary">{student.student_code}</p>
                </div>
              </div>

              <div className="grid gap-4 rounded-2xl border border-gray-100 bg-slate-50/70 p-4 text-sm">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                    Contact
                  </p>
                  <p className="mt-1 text-text-primary">{student.phone || "Phone not available"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                    Status
                  </p>
                  <div className="mt-2">
                    <StatusButtons
                      student={student}
                      statuses={statuses}
                      onStatusChange={onStatusChange}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                    Remarks
                  </p>
                  <input
                    value={student.remarks || ""}
                    onChange={(event) =>
                      onRemarksChange(student.student_id, event.target.value)
                    }
                    placeholder="Optional note"
                    className="mt-2 flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
