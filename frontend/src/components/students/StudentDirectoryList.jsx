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
            <TableRow className="bg-muted/30 hover:bg-muted/30">
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
              <tr key={student.id} className="border-b">
                <TableCell>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-lg font-black text-primary">
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
                      <p className="font-semibold text-foreground">{student.full_name}</p>
                      <p className="text-sm text-muted-foreground">{student.student_id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">{student.phone || "No phone"}</p>
                  <p className="text-sm text-muted-foreground">
                    {student.email || student.parent_phone || "No email"}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">
                    {student.course_name || "Unassigned"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {student.batch_name || "No batch assigned"}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">
                    {formatDate(student.admission_date)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Parent: {student.parent_name || "N/A"}
                  </p>
                </TableCell>
                <TableCell>
                  <StudentStatusBadge status={student.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/admin/students/${student.id}`}>
                        <View className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onEdit(student)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => onDelete(student)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </tr>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-4 p-4 lg:hidden">
        {students.map((student) => (
          <Card key={student.id} className="rounded-3xl border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-xl font-black text-primary">
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
                    <p className="font-semibold text-foreground">{student.full_name}</p>
                    <p className="text-sm text-muted-foreground">{student.student_id}</p>
                  </div>
                </div>
                <StudentStatusBadge status={student.status} />
              </div>

              <div className="mt-4 grid gap-3 rounded-2xl bg-muted/20 p-4 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Contact
                  </p>
                  <p className="mt-1 text-foreground">{student.phone || "No phone"}</p>
                  <p className="text-muted-foreground">{student.email || "No email"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Course / Batch
                  </p>
                  <p className="mt-1 text-foreground">{student.course_name || "Unassigned"}</p>
                  <p className="text-muted-foreground">{student.batch_name || "No batch"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Admission
                  </p>
                  <p className="mt-1 text-foreground">{formatDate(student.admission_date)}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/admin/students/${student.id}`}>
                    <View className="mr-2 h-4 w-4" />
                    View
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => onEdit(student)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => onDelete(student)}
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
