import { Link } from "react-router-dom";
import { Pencil, Trash2, View } from "lucide-react";
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
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
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
                  <div>
                    <p className="font-semibold text-foreground">{batch.batch_name}</p>
                    <p className="text-sm text-muted-foreground">{batch.batch_id}</p>
                    <div className="mt-2">
                      <BatchStatusBadge status={batch.status} />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">{batch.course_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {batch.days_of_week.length ? batch.days_of_week.join(", ") : "Days not set"}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">{batch.timing || "Time not set"}</p>
                  <p className="text-sm text-muted-foreground">
                    {batch.start_date || "--"} to {batch.end_date || "--"}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">
                    {batch.faculty_name || "Faculty not assigned"}
                  </p>
                  <p className="text-sm text-muted-foreground">{batch.room || "Room not set"}</p>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">{batch.student_count} students</p>
                  <p className="text-sm text-muted-foreground">
                    {batch.capacity ? `${batch.available_seats} seats left` : "Open capacity"}
                  </p>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/admin/batches/${batch.id}`}>
                        <View className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onEdit(batch)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => onDelete(batch)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-4 p-4 lg:hidden">
        {batches.map((batch) => (
          <Card key={batch.id} className="rounded-3xl border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{batch.batch_name}</p>
                  <p className="text-sm text-muted-foreground">{batch.batch_id}</p>
                </div>
                <BatchStatusBadge status={batch.status} />
              </div>

              <div className="mt-4 grid gap-3 rounded-2xl bg-muted/20 p-4 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Course
                  </p>
                  <p className="mt-1 text-foreground">{batch.course_name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Schedule
                  </p>
                  <p className="mt-1 text-foreground">{batch.timing || "Time not set"}</p>
                  <p className="text-muted-foreground">
                    {batch.days_of_week.length ? batch.days_of_week.join(", ") : "Days not set"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Strength
                  </p>
                  <p className="mt-1 text-foreground">
                    {batch.student_count} students • {batch.capacity ? `${batch.available_seats} seats left` : "Open capacity"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/admin/batches/${batch.id}`}>
                    <View className="mr-2 h-4 w-4" />
                    View
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => onEdit(batch)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => onDelete(batch)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
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
