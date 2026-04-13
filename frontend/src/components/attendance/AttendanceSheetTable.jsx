import { Card, CardContent } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export default function AttendanceSheetTable({
  students,
  statuses,
  onStatusChange,
  onRemarksChange,
}) {
  return (
    <>
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
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
                  <div>
                    <p className="font-semibold text-foreground">{student.student_name}</p>
                    <p className="text-sm text-muted-foreground">{student.student_code}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-foreground">{student.phone || "Phone not available"}</p>
                  <p className="text-sm text-muted-foreground">
                    Joined {student.joined_date || "not recorded"}
                  </p>
                </TableCell>
                <TableCell>
                  <select
                    value={student.status}
                    onChange={(event) =>
                      onStatusChange(student.student_id, event.target.value)
                    }
                    className="flex h-10 w-[160px] rounded-full border border-input bg-background px-4 text-sm"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell>
                  <input
                    value={student.remarks || ""}
                    onChange={(event) =>
                      onRemarksChange(student.student_id, event.target.value)
                    }
                    placeholder="Optional note"
                    className="flex h-10 w-full min-w-[220px] rounded-full border border-input bg-background px-4 text-sm"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-4 p-4 lg:hidden">
        {students.map((student) => (
          <Card key={student.student_id} className="rounded-3xl border-border">
            <CardContent className="space-y-4 p-5">
              <div>
                <p className="font-semibold text-foreground">{student.student_name}</p>
                <p className="text-sm text-muted-foreground">{student.student_code}</p>
              </div>

              <div className="grid gap-3 rounded-2xl bg-muted/20 p-4 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Contact
                  </p>
                  <p className="mt-1 text-foreground">{student.phone || "Phone not available"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Status
                  </p>
                  <select
                    value={student.status}
                    onChange={(event) =>
                      onStatusChange(student.student_id, event.target.value)
                    }
                    className="mt-2 flex h-10 w-full rounded-full border border-input bg-background px-4 text-sm"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Remarks
                  </p>
                  <input
                    value={student.remarks || ""}
                    onChange={(event) =>
                      onRemarksChange(student.student_id, event.target.value)
                    }
                    placeholder="Optional note"
                    className="mt-2 flex h-10 w-full rounded-full border border-input bg-background px-4 text-sm"
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
