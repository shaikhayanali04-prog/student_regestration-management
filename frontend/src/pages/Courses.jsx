import { useCallback, useEffect, useState } from "react";
import { BookOpen, Plus, RotateCcw, Search } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { EmptyState } from "../components/ui/empty-state";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import ConfirmDialog from "../components/ui/confirm-dialog";
import CourseDirectoryList from "../components/courses/CourseDirectoryList";
import CourseFormDialog from "../components/courses/CourseFormDialog";
import CourseSummaryCards from "../components/courses/CourseSummaryCards";
import courseService from "../services/courseService";

const initialMeta = { modes: [], statuses: [] };
const initialResult = {
  items: [],
  meta: {
    summary: {
      total_courses: 0,
      active_courses: 0,
      inactive_courses: 0,
      total_batches: 0,
      enrolled_students: 0,
    },
    pagination: { page: 1, limit: 8, total: 0, total_pages: 1 },
  },
};

export default function Courses() {
  const [coursesResult, setCoursesResult] = useState(initialResult);
  const [meta, setMeta] = useState(initialMeta);
  const [query, setQuery] = useState({
    search: "",
    status: "",
    mode: "",
    page: 1,
    limit: 8,
  });
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingCourse, setDeletingCourse] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const courses = coursesResult.items || [];
  const summary = coursesResult.meta?.summary || initialResult.meta.summary;
  const pagination = coursesResult.meta?.pagination || initialResult.meta.pagination;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setQuery((current) => ({ ...current, page: 1, search: searchInput.trim() }));
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const response = await courseService.getMeta();
        setMeta(response || initialMeta);
      } catch (requestError) {
        console.error(requestError);
      }
    };

    loadMeta();
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await courseService.getCourses(query);
      setCoursesResult(response || initialResult);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || "We couldn't load the courses right now.",
      );
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const updateFilter = (key, value) => {
    setQuery((current) => ({ ...current, page: 1, [key]: value }));
  };

  const resetFilters = () => {
    setSearchInput("");
    setQuery({
      search: "",
      status: "",
      mode: "",
      page: 1,
      limit: 8,
    });
  };

  const openCreateDialog = () => {
    setEditingCourse(null);
    setFormError("");
    setDialogOpen(true);
  };

  const openEditDialog = (course) => {
    setEditingCourse(course);
    setFormError("");
    setDialogOpen(true);
  };

  const handleCreate = async (payload) => {
    try {
      setFormLoading(true);
      setFormError("");
      const response = await courseService.createCourse(payload);
      setDialogOpen(false);
      setFeedback({
        type: "success",
        message: `${response.course.course_name} has been created successfully.`,
      });
      await fetchCourses();
    } catch (requestError) {
      setFormError(
        requestError?.response?.data?.message || "Unable to create the course right now.",
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (payload) => {
    if (!editingCourse) {
      return;
    }

    try {
      setFormLoading(true);
      setFormError("");
      const response = await courseService.updateCourse(editingCourse.id, payload);
      setDialogOpen(false);
      setEditingCourse(null);
      setFeedback({
        type: "success",
        message: `${response.course.course_name} has been updated successfully.`,
      });
      await fetchCourses();
    } catch (requestError) {
      setFormError(
        requestError?.response?.data?.message || "Unable to update the course right now.",
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCourse) {
      return;
    }

    try {
      setDeleteLoading(true);
      await courseService.deleteCourse(deletingCourse.id);
      setFeedback({
        type: "success",
        message: `${deletingCourse.course_name} has been deleted.`,
      });
      setDeletingCourse(null);
      await fetchCourses();
    } catch (requestError) {
      setFeedback({
        type: "error",
        message:
          requestError?.response?.data?.message || "Unable to delete the course right now.",
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
            Courses Module
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
            Courses Management
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Manage commercial course offerings, fee structure, subjects, delivery mode, and the batch ecosystem attached to each course.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={fetchCourses}>
            <RotateCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button className="gap-2" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            Create Course
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
          <CourseSummaryCards summary={summary} />
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
          title="Course data could not be loaded"
          description={error}
          action={<Button onClick={fetchCourses}>Retry Loading Courses</Button>}
        />
      ) : (
        <>
          <CourseSummaryCards summary={summary} />

          <Card className="rounded-[30px] border-border shadow-sm">
            <CardHeader className="space-y-4 border-b border-border bg-muted/10">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <CardTitle className="text-2xl">Course Directory</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Search, filter, manage, and inspect every course in the ERP.
                  </p>
                </div>
                <div className="flex flex-col gap-3 md:flex-row">
                  <div className="relative min-w-[280px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      placeholder="Search by name, ID, description, or subject"
                      className="rounded-full pl-10"
                    />
                  </div>
                  <Button variant="outline" className="rounded-full" onClick={resetFilters}>
                    Clear Filters
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
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
                  value={query.mode}
                  onChange={(event) => updateFilter("mode", event.target.value)}
                  className="flex h-10 w-full rounded-full border border-input bg-background px-4 text-sm"
                >
                  <option value="">All modes</option>
                  {(meta.modes || []).map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
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
              {courses.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={BookOpen}
                    title="No courses found"
                    description="No courses matched the current filters yet. Create your first course to start structuring batches and student admissions."
                    action={
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Button variant="outline" onClick={resetFilters}>Reset Filters</Button>
                        <Button onClick={openCreateDialog}>Create Course</Button>
                      </div>
                    }
                  />
                </div>
              ) : (
                <>
                  <CourseDirectoryList
                    courses={courses}
                    onEdit={openEditDialog}
                    onDelete={setDeletingCourse}
                  />

                  <div className="flex flex-col gap-4 border-t border-border px-6 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <p>
                      Showing {(pagination.page - 1) * pagination.limit + 1}-
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} courses
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

      <CourseFormDialog
        key={`${editingCourse?.id || "new"}-${dialogOpen ? "open" : "closed"}`}
        open={dialogOpen}
        mode={editingCourse ? "edit" : "create"}
        course={editingCourse}
        meta={meta}
        loading={formLoading}
        error={formError}
        onClose={() => {
          setDialogOpen(false);
          setEditingCourse(null);
          setFormError("");
        }}
        onSubmit={editingCourse ? handleUpdate : handleCreate}
      />

      <ConfirmDialog
        open={Boolean(deletingCourse)}
        title="Delete course?"
        description={`This will remove ${deletingCourse?.course_name || "this course"} and its linked batch mappings from the current ERP database.`}
        confirmLabel="Delete Course"
        loading={deleteLoading}
        onClose={() => setDeletingCourse(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
