import { useCallback, useEffect, useState } from "react";
import { Plus, RotateCcw, Search, UserRound } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { EmptyState } from "../components/ui/empty-state";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import ConfirmDialog from "../components/ui/confirm-dialog";
import FacultyDirectoryList from "../components/faculty/FacultyDirectoryList";
import FacultyFormDialog from "../components/faculty/FacultyFormDialog";
import FacultySummaryCards from "../components/faculty/FacultySummaryCards";
import facultyService from "../services/facultyService";

const initialMeta = { statuses: [], batches: [] };
const initialResult = {
  items: [],
  meta: {
    summary: {
      total_faculty: 0,
      active_faculty: 0,
      inactive_faculty: 0,
      assigned_batches: 0,
      student_coverage: 0,
    },
    pagination: { page: 1, limit: 8, total: 0, total_pages: 1 },
  },
};

export default function Faculty() {
  const [facultyResult, setFacultyResult] = useState(initialResult);
  const [meta, setMeta] = useState(initialMeta);
  const [query, setQuery] = useState({
    search: "",
    status: "",
    page: 1,
    limit: 8,
  });
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingFaculty, setDeletingFaculty] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const faculty = facultyResult.items || [];
  const summary = facultyResult.meta?.summary || initialResult.meta.summary;
  const pagination = facultyResult.meta?.pagination || initialResult.meta.pagination;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setQuery((current) => ({ ...current, page: 1, search: searchInput.trim() }));
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const response = await facultyService.getMeta();
        setMeta(response || initialMeta);
      } catch (requestError) {
        console.error(requestError);
      }
    };

    loadMeta();
  }, []);

  const fetchFaculty = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await facultyService.getFaculty(query);
      setFacultyResult(response || initialResult);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || "We couldn't load the faculty module right now.",
      );
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  const refreshMeta = async () => {
    const response = await facultyService.getMeta();
    setMeta(response || initialMeta);
  };

  const updateFilter = (key, value) => {
    setQuery((current) => ({ ...current, page: 1, [key]: value }));
  };

  const resetFilters = () => {
    setSearchInput("");
    setQuery({
      search: "",
      status: "",
      page: 1,
      limit: 8,
    });
  };

  const openCreateDialog = () => {
    setEditingFaculty(null);
    setFormError("");
    setDialogOpen(true);
  };

  const openEditDialog = (member) => {
    const assignedBatchIds = (meta.batches || [])
      .filter((batch) => String(batch.faculty_id) === String(member.id))
      .map((batch) => batch.id);

    setEditingFaculty({ ...member, assigned_batch_ids: assignedBatchIds });
    setFormError("");
    setDialogOpen(true);
  };

  const handleCreate = async (payload) => {
    try {
      setFormLoading(true);
      setFormError("");
      const response = await facultyService.createFaculty(payload);
      setDialogOpen(false);
      setFeedback({
        type: "success",
        message: `${response.faculty.full_name} has been created successfully.`,
      });
      await Promise.all([fetchFaculty(), refreshMeta()]);
    } catch (requestError) {
      setFormError(
        requestError?.response?.data?.message || "Unable to create the faculty record right now.",
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (payload) => {
    if (!editingFaculty) {
      return;
    }

    try {
      setFormLoading(true);
      setFormError("");
      const response = await facultyService.updateFaculty(editingFaculty.id, payload);
      setDialogOpen(false);
      setEditingFaculty(null);
      setFeedback({
        type: "success",
        message: `${response.faculty.full_name} has been updated successfully.`,
      });
      await Promise.all([fetchFaculty(), refreshMeta()]);
    } catch (requestError) {
      setFormError(
        requestError?.response?.data?.message || "Unable to update the faculty record right now.",
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingFaculty) {
      return;
    }

    try {
      setDeleteLoading(true);
      await facultyService.deleteFaculty(deletingFaculty.id);
      setFeedback({
        type: "success",
        message: `${deletingFaculty.full_name} has been deleted.`,
      });
      setDeletingFaculty(null);
      await Promise.all([fetchFaculty(), refreshMeta()]);
    } catch (requestError) {
      setFeedback({
        type: "error",
        message:
          requestError?.response?.data?.message || "Unable to delete the faculty record right now.",
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
            Faculty Module
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
            Faculty Management
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Manage teachers, subject specialization, and live batch ownership with a real operational directory.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={fetchFaculty}>
            <RotateCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button className="gap-2" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            Add Faculty
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
          <FacultySummaryCards summary={summary} />
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
          title="Faculty data could not be loaded"
          description={error}
          action={<Button onClick={fetchFaculty}>Retry Loading Faculty</Button>}
        />
      ) : (
        <>
          <FacultySummaryCards summary={summary} />

          <Card className="rounded-[30px] border-border shadow-sm">
            <CardHeader className="space-y-4 border-b border-border bg-muted/10">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <CardTitle className="text-2xl">Faculty Directory</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Search, filter, manage, and inspect the teaching team in one place.
                  </p>
                </div>
                <div className="flex flex-col gap-3 md:flex-row">
                  <div className="relative min-w-[280px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      placeholder="Search by name, ID, email, phone, or subject"
                      className="rounded-full pl-10"
                    />
                  </div>
                  <Button variant="outline" className="rounded-full" onClick={resetFilters}>
                    Clear Filters
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
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
              {faculty.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={UserRound}
                    title="No faculty records found"
                    description="Start by adding your first faculty member so batches can be assigned to real teachers."
                    action={
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Button variant="outline" onClick={resetFilters}>Reset Filters</Button>
                        <Button onClick={openCreateDialog}>Add Faculty</Button>
                      </div>
                    }
                  />
                </div>
              ) : (
                <>
                  <FacultyDirectoryList
                    faculty={faculty}
                    onEdit={openEditDialog}
                    onDelete={setDeletingFaculty}
                  />

                  <div className="flex flex-col gap-4 border-t border-border px-6 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <p>
                      Showing {(pagination.page - 1) * pagination.limit + 1}-
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} faculty records
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

      <FacultyFormDialog
        key={`${editingFaculty?.id || "new"}-${dialogOpen ? "open" : "closed"}`}
        open={dialogOpen}
        mode={editingFaculty ? "edit" : "create"}
        faculty={editingFaculty}
        meta={meta}
        loading={formLoading}
        error={formError}
        onClose={() => {
          setDialogOpen(false);
          setEditingFaculty(null);
          setFormError("");
        }}
        onSubmit={editingFaculty ? handleUpdate : handleCreate}
      />

      <ConfirmDialog
        open={Boolean(deletingFaculty)}
        title="Delete faculty record?"
        description={`This will remove ${deletingFaculty?.full_name || "this faculty member"} and clear the faculty assignment from any linked batches.`}
        confirmLabel="Delete Faculty"
        loading={deleteLoading}
        onClose={() => setDeletingFaculty(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
