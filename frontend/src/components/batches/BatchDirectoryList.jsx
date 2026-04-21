import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import BatchStatusBadge from "./BatchStatusBadge";

export default function BatchDirectoryList({ batches, onEdit, onDelete }) {
  return (
    <>
      <div className="hidden w-full overflow-hidden rounded-xl border border-gray-100 bg-white lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Batch</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Faculty & Room</TableHead>
              <TableHead>Strength</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.map((batch) => (
              <TableRow key={batch.id}>
                <TableCell>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-sky-100 text-primary">
                      <Eye className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{batch.batch_name}</p>
                      <p className="text-sm text-text-secondary">{batch.batch_id}</p>
                      <div className="mt-2">
                        <BatchStatusBadge status={batch.status} />
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">{batch.course_name}</p>
                  <p className="text-sm text-text-secondary">
                    {batch.days_of_week.length ? batch.days_of_week.join(", ") : "Days not set"}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">{batch.timing || "Time not set"}</p>
                  <p className="text-sm text-text-secondary">
                    {batch.start_date || "--"} to {batch.end_date || "--"}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">
                    {batch.faculty_name || "Faculty not assigned"}
                  </p>
                  <p className="text-sm text-text-secondary">{batch.room || "Room not set"}</p>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">{batch.student_count} students</p>
                  <p className="text-sm text-text-secondary">
                    {batch.capacity ? `${batch.available_seats} seats left` : "Open capacity"}
                  </p>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" asChild aria-label="View batch">
                      <Link to={`/admin/batches/${batch.id}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEdit(batch)}
                      aria-label="Edit batch"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => onDelete(batch)}
                      aria-label="Delete batch"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-4 lg:hidden">
        {batches.map((batch) => (
          <Card key={batch.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{batch.batch_name}</p>
                  <p className="text-sm text-text-secondary">{batch.batch_id}</p>
                </div>
                <BatchStatusBadge status={batch.status} />
              </div>

              <div className="mt-4 grid gap-3 rounded-2xl border border-gray-100 bg-slate-50/70 p-4 text-sm">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                    Course
                  </p>
                  <p className="mt-1 text-text-primary">{batch.course_name}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                    Schedule
                  </p>
                  <p className="mt-1 text-text-primary">{batch.timing || "Time not set"}</p>
                  <p className="text-text-secondary">
                    {batch.days_of_week.length ? batch.days_of_week.join(", ") : "Days not set"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                    Strength
                  </p>
                  <p className="mt-1 text-text-primary">
                    {batch.student_count} students | {batch.capacity ? `${batch.available_seats} seats left` : "Open capacity"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/admin/batches/${batch.id}`}>
                    <Eye className="h-4 w-4" />
                    View
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => onEdit(batch)}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(batch)}>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
