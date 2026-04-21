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
import StudentStatusBadge from "./StudentStatusBadge";

export default function StudentDirectoryList({
  students,
  formatDate,
  onEdit,
  onDelete,
}) {
  return (
    <>
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Student</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Course & Batch</TableHead>
              <TableHead>Admission</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-sky-100 text-lg font-black text-primary">
                      {student.student_photo ? (
                        <img
                          src={student.student_photo}
                          alt={student.full_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        student.full_name?.charAt(0) || "S"
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="font-display text-base font-semibold text-text-primary">{student.full_name}</p>
                      <p className="text-sm text-text-secondary">{student.student_id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-text-primary">{student.phone || "No phone"}</p>
                  <p className="text-sm text-text-secondary">
                    {student.email || student.parent_phone || "No email"}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-text-primary">
                    {student.course_name || "Unassigned"}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {student.batch_name || "No batch assigned"}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-text-primary">
                    {formatDate(student.admission_date)}
                  </p>
                  <p className="text-sm text-text-secondary">
                    Parent: {student.parent_name || "N/A"}
                  </p>
                </TableCell>
                <TableCell>
                  <StudentStatusBadge status={student.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" asChild title="View student">
                      <Link to={`/admin/students/${student.id}`}>
                        <View className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => onEdit(student)} title="Edit student">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => onDelete(student)}
                      title="Delete student"
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

      <div className="grid gap-4 p-4 lg:hidden">
        {students.map((student) => (
          <Card key={student.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-sky-100 text-xl font-black text-primary">
                    {student.student_photo ? (
                      <img
                        src={student.student_photo}
                        alt={student.full_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      student.full_name?.charAt(0) || "S"
                    )}
                  </div>
                  <div>
                    <p className="font-display text-base font-semibold text-text-primary">{student.full_name}</p>
                    <p className="text-sm text-text-secondary">{student.student_id}</p>
                  </div>
                </div>
                <StudentStatusBadge status={student.status} />
              </div>

              <div className="mt-4 grid gap-3 rounded-2xl border border-gray-100 bg-slate-50/80 p-4 text-sm">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                    Contact
                  </p>
                  <p className="mt-1 text-text-primary">{student.phone || "No phone"}</p>
                  <p className="text-text-secondary">{student.email || "No email"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                    Course / Batch
                  </p>
                  <p className="mt-1 text-text-primary">{student.course_name || "Unassigned"}</p>
                  <p className="text-text-secondary">{student.batch_name || "No batch"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                    Admission
                  </p>
                  <p className="mt-1 text-text-primary">{formatDate(student.admission_date)}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="icon" asChild title="View student">
                  <Link to={`/admin/students/${student.id}`}>
                    <View className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="icon" onClick={() => onEdit(student)} title="Edit student">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => onDelete(student)}
                  title="Delete student"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
