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
      <div className="hidden overflow-hidden rounded-xl border border-gray-100 bg-white lg:block">
        <Table>
          <TableHeader>
            <TableRow>
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
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-sky-100 text-primary">
                      <View className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">{course.course_name}</p>
                      <p className="text-sm text-text-secondary">{course.course_id}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {course.subjects.slice(0, 3).map((subject) => (
                          <span
                            key={subject}
                            className="rounded-full border border-primary/10 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                          >
                            {subject}
                          </span>
                        ))}
                        {course.subjects.length > 3 ? (
                          <span className="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs text-text-secondary">
                            +{course.subjects.length - 3}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-text-primary">{course.mode}</p>
                  <p className="text-sm text-text-secondary">
                    {course.description || "No description added"}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="font-mono font-medium text-text-primary">
                    {formatCurrency(course.fee_amount)}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {course.duration_months ? `${course.duration_months} months` : "Flexible duration"}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-text-primary">{course.enrolled_students} students</p>
                  <p className="text-sm text-text-secondary">
                    {course.batch_count} batches | {course.active_batch_count} active
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
                    <Button variant="outline" size="icon" asChild aria-label="View course">
                      <Link to={`/admin/courses/${course.id}`}>
                        <View className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEdit(course)}
                      aria-label="Edit course"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => onDelete(course)}
                      aria-label="Delete course"
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
        {courses.map((course) => (
          <Card key={course.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-text-primary">{course.course_name}</p>
                  <p className="text-sm text-text-secondary">{course.course_id}</p>
                </div>
                <CourseStatusBadge value={course.status} />
              </div>

              <div className="mt-4 grid gap-3 rounded-2xl border border-gray-100 bg-slate-50/70 p-4 text-sm">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                    Delivery
                  </p>
                  <p className="mt-1 text-text-primary">{course.mode}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                    Fee & Duration
                  </p>
                  <p className="mt-1 font-mono text-text-primary">{formatCurrency(course.fee_amount)}</p>
                  <p className="text-text-secondary">
                    {course.duration_months ? `${course.duration_months} months` : "Flexible duration"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                    Activity
                  </p>
                  <p className="mt-1 text-text-primary">
                    {course.enrolled_students} students | {course.batch_count} batches
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {course.subjects.map((subject) => (
                  <span
                    key={subject}
                    className="rounded-full border border-primary/10 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                  >
                    {subject}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/admin/courses/${course.id}`}>
                    <View className="h-4 w-4" />
                    View
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => onEdit(course)}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(course)}>
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
