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
import CourseStatusBadge from "./CourseStatusBadge";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function CourseDirectoryList({ courses, onEdit, onDelete }) {
  return (
    <>
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead>Course</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Fee & Duration</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>
                  <div>
                    <p className="font-semibold text-foreground">{course.course_name}</p>
                    <p className="text-sm text-muted-foreground">{course.course_id}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {course.subjects.slice(0, 3).map((subject) => (
                        <span
                          key={subject}
                          className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                        >
                          {subject}
                        </span>
                      ))}
                      {course.subjects.length > 3 ? (
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                          +{course.subjects.length - 3}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">{course.mode}</p>
                  <p className="text-sm text-muted-foreground">
                    {course.description || "No description added"}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">{formatCurrency(course.fee_amount)}</p>
                  <p className="text-sm text-muted-foreground">
                    {course.duration_months ? `${course.duration_months} months` : "Flexible duration"}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">{course.enrolled_students} students</p>
                  <p className="text-sm text-muted-foreground">
                    {course.batch_count} batches • {course.active_batch_count} active
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <CourseStatusBadge value={course.status} />
                    <CourseStatusBadge value={course.mode} />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/admin/courses/${course.id}`}>
                        <View className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onEdit(course)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => onDelete(course)}
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
        {courses.map((course) => (
          <Card key={course.id} className="rounded-3xl border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{course.course_name}</p>
                  <p className="text-sm text-muted-foreground">{course.course_id}</p>
                </div>
                <CourseStatusBadge value={course.status} />
              </div>

              <div className="mt-4 grid gap-3 rounded-2xl bg-muted/20 p-4 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Delivery
                  </p>
                  <p className="mt-1 text-foreground">{course.mode}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Fee & Duration
                  </p>
                  <p className="mt-1 text-foreground">{formatCurrency(course.fee_amount)}</p>
                  <p className="text-muted-foreground">
                    {course.duration_months ? `${course.duration_months} months` : "Flexible duration"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Activity
                  </p>
                  <p className="mt-1 text-foreground">
                    {course.enrolled_students} students • {course.batch_count} batches
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {course.subjects.map((subject) => (
                  <span
                    key={subject}
                    className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                  >
                    {subject}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/admin/courses/${course.id}`}>
                    <View className="mr-2 h-4 w-4" />
                    View
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => onEdit(course)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => onDelete(course)}
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
