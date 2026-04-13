import { useCallback, useEffect, useState } from "react";
import { Plus, RotateCcw, Search } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { EmptyState } from "../components/ui/empty-state";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import ConfirmDialog from "../components/ui/confirm-dialog";
import StudentDirectoryList from "../components/students/StudentDirectoryList";
import StudentFormDialog from "../components/students/StudentFormDialog";
import StudentSummaryCards from "../components/students/StudentSummaryCards";
import studentService from "../services/studentService";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not available";

const initialMeta = { courses: [], batches: [], statuses: [] };
const initialResult = {
  items: [],
  meta: {
    summary: {
      total_students: 0,
      active_students: 0,
      inactive_students: 0,
      dropped_students: 0,
      completed_students: 0,
    },
    pagination: { page: 1, limit: 8, total: 0, total_pages: 1 },
  },
};

export default function Students() {
  const [studentsResult, setStudentsResult] = useState(initialResult);
  const [meta, setMeta] = useState(initialMeta);
  const [query, setQuery] = useState({
    search: "",
    status: "",
    course_id: "",
    batch_id: "",
    page: 1,
    limit: 8,
  });
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const students = studentsResult.items || [];
  const summary = studentsResult.meta?.summary || initialResult.meta.summary;
  const pagination = studentsResult.meta?.pagination || initialResult.meta.pagination;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setQuery((current) => ({ ...current, page: 1, search: searchInput.trim() }));
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const response = await studentService.getMeta();
        setMeta(response || initialMeta);
      } catch (requestError) {
        console.error(requestError);
      }
    };

    loadMeta();
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await studentService.getStudents(query);
      setStudentsResult(response || initialResult);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || "We couldn't load the students right now.",
      );
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const updateFilter = (key, value) => {
    setQuery((current) => ({
      ...current,
      page: 1,
      [key]: value,
      ...(key === "course_id" ? { batch_id: "" } : {}),
    }));
  };

  const resetFilters = () => {
    setSearchInput("");
    setQuery({
      search: "",
      status: "",
      course_id: "",
      batch_id: "",
      page: 1,
      limit: 8,
    });
  };

  const openCreateDialog = () => {
    setEditingStudent(null);
    setFormError("");
    setDialogOpen(true);
  };

  const openEditDialog = (student) => {
    setEditingStudent(student);
    setFormError("");
    setDialogOpen(true);
  };

  const handleCreate = async (payload) => {
    try {
      setFormLoading(true);
      setFormError("");
      const response = await studentService.createStudent(payload);
      setDialogOpen(false);
      setFeedback({
        type: "success",
        message: `${response.student.full_name} has been added successfully.`,
      });
      await fetchStudents();
    } catch (requestError) {
      setFormError(
        requestError?.response?.data?.message || "Unable to create the student right now.",
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (payload) => {
    if (!editingStudent) return;

    try {
      setFormLoading(true);
      setFormError("");
      const response = await studentService.updateStudent(editingStudent.id, payload);
      setDialogOpen(false);
      setEditingStudent(null);
      setFeedback({
        type: "success",
        message: `${response.student.full_name} has been updated successfully.`,
      });
      await fetchStudents();
    } catch (requestError) {
      setFormError(
        requestError?.response?.data?.message || "Unable to update the student right now.",
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingStudent) return;

    try {
      setDeleteLoading(true);
      await studentService.deleteStudent(deletingStudent.id);
      setFeedback({
        type: "success",
        message: `${deletingStudent.full_name} has been removed from the ERP.`,
      });
      setDeletingStudent(null);
      await fetchStudents();
    } catch (requestError) {
      setFeedback({
        type: "error",
        message:
          requestError?.response?.data?.message || "Unable to delete the student right now.",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Students Module
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
            Student Operations
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Manage admissions, guardian records, course placement, lifecycle status, and profile visibility from one working flow.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={fetchStudents}>
            <RotateCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button className="gap-2" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

      {feedback ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            feedback.type === "error"
              ? "border-destructive/20 bg-destructive/10 text-destructive"
              : "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-4">
          <StudentSummaryCards summary={summary} />
          <Card className="rounded-[28px] border-border">
            <CardContent className="space-y-3 p-6">
              {[1, 2, 3, 4].map((item) => (
                <Skeleton key={item} className="h-20 rounded-2xl" />
              ))}
            </CardContent>
          </Card>
        </div>
      ) : error ? (
        <EmptyState
          title="Student data could not be loaded"
          description={error}
          action={<Button onClick={fetchStudents}>Retry Loading Students</Button>}
        />
      ) : (
        <>
          <StudentSummaryCards summary={summary} />

          <Card className="rounded-[30px] border-border shadow-sm">
            <CardHeader className="space-y-4 border-b border-border bg-muted/10">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <CardTitle className="text-2xl">Students Directory</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Search, filter, review, edit, and drill into individual student records.
                  </p>
                </div>
                <div className="flex flex-col gap-3 md:flex-row">
                  <div className="relative min-w-[280px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      placeholder="Search by name, phone, email, guardian, or ID"
                      className="rounded-full pl-10"
                    />
                  </div>
                  <Button variant="outline" className="rounded-full" onClick={resetFilters}>
                    Clear Filters
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <select
                  value={query.status}
                  onChange={(event) => updateFilter("status", event.target.value)}
                  className="flex h-10 w-full rounded-full border border-input bg-background px-4 text-sm"
                >
                  <option value="">All statuses</option>
                  {(meta.statuses || []).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <select
                  value={query.course_id}
                  onChange={(event) => updateFilter("course_id", event.target.value)}
                  className="flex h-10 w-full rounded-full border border-input bg-background px-4 text-sm"
                >
                  <option value="">All courses</option>
                  {(meta.courses || []).map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
                <select
                  value={query.batch_id}
                  onChange={(event) => updateFilter("batch_id", event.target.value)}
                  className="flex h-10 w-full rounded-full border border-input bg-background px-4 text-sm"
                >
                  <option value="">All batches</option>
                  {(meta.batches || []).map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
                <select
                  value={String(query.limit)}
                  onChange={(event) => updateFilter("limit", Number(event.target.value))}
                  className="flex h-10 w-full rounded-full border border-input bg-background px-4 text-sm"
                >
                  {[8, 12, 20].map((size) => (
                    <option key={size} value={size}>
                      {size} per page
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {students.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    title="No students found"
                    description="No student records matched the current search and filters. Try resetting filters or add your first student."
                    action={
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Button variant="outline" onClick={resetFilters}>Reset Filters</Button>
                        <Button onClick={openCreateDialog}>Add Student</Button>
                      </div>
                    }
                  />
                </div>
              ) : (
                <>
                  <StudentDirectoryList
                    students={students}
                    formatDate={formatDate}
                    onEdit={openEditDialog}
                    onDelete={setDeletingStudent}
                  />

                  <div className="flex flex-col gap-4 border-t border-border px-6 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <p>
                      Showing {(pagination.page - 1) * pagination.limit + 1}-
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} students
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuery((current) => ({ ...current, page: current.page - 1 }))}
                        disabled={pagination.page <= 1}
                      >
                        Previous
                      </Button>
                      <span className="min-w-[92px] text-center">
                        Page {pagination.page} of {pagination.total_pages || 1}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuery((current) => ({ ...current, page: current.page + 1 }))}
                        disabled={pagination.page >= pagination.total_pages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <StudentFormDialog
        key={`${editingStudent?.id || "new"}-${dialogOpen ? "open" : "closed"}`}
        open={dialogOpen}
        mode={editingStudent ? "edit" : "create"}
        student={editingStudent}
        meta={meta}
        loading={formLoading}
        error={formError}
        onClose={() => {
          setDialogOpen(false);
          setEditingStudent(null);
          setFormError("");
        }}
        onSubmit={editingStudent ? handleUpdate : handleCreate}
      />

      <ConfirmDialog
        open={Boolean(deletingStudent)}
        title="Delete student record?"
        description={`This will permanently remove ${deletingStudent?.full_name || "this student"} and related attendance / fee mappings from the current ERP database.`}
        confirmLabel="Delete Student"
        loading={deleteLoading}
        onClose={() => setDeletingStudent(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
