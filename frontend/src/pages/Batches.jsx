import { useCallback, useEffect, useState } from "react";
import { GraduationCap, Plus, RotateCcw, Search } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { EmptyState } from "../components/ui/empty-state";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import ConfirmDialog from "../components/ui/confirm-dialog";
import BatchDirectoryList from "../components/batches/BatchDirectoryList";
import BatchFormDialog from "../components/batches/BatchFormDialog";
import BatchSummaryCards from "../components/batches/BatchSummaryCards";
import batchService from "../services/batchService";

const initialMeta = { statuses: [], courses: [], students: [], faculty: [] };
const initialResult = {
  items: [],
  meta: {
    summary: {
      total_batches: 0,
      active_batches: 0,
      planned_batches: 0,
      assigned_students: 0,
    },
    pagination: { page: 1, limit: 8, total: 0, total_pages: 1 },
  },
};

export default function Batches() {
  const [batchesResult, setBatchesResult] = useState(initialResult);
  const [meta, setMeta] = useState(initialMeta);
  const [query, setQuery] = useState({
    search: "",
    status: "",
    course_id: "",
    page: 1,
    limit: 8,
  });
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [editingBatch, setEditingBatch] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingBatch, setDeletingBatch] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const batches = batchesResult.items || [];
  const summary = batchesResult.meta?.summary || initialResult.meta.summary;
  const pagination = batchesResult.meta?.pagination || initialResult.meta.pagination;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setQuery((current) => ({ ...current, page: 1, search: searchInput.trim() }));
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const response = await batchService.getMeta();
        setMeta(response || initialMeta);
      } catch (requestError) {
        console.error(requestError);
      }
    };

    loadMeta();
  }, []);

  const fetchBatches = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await batchService.getBatches(query);
      setBatchesResult(response || initialResult);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || "We couldn't load the batches right now.",
      );
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const updateFilter = (key, value) => {
    setQuery((current) => ({ ...current, page: 1, [key]: value }));
  };

  const resetFilters = () => {
    setSearchInput("");
    setQuery({
      search: "",
      status: "",
      course_id: "",
      page: 1,
      limit: 8,
    });
  };

  const openCreateDialog = () => {
    setEditingBatch(null);
    setFormError("");
    setDialogOpen(true);
  };

  const openEditDialog = (batch) => {
    const assignedStudentIds = (meta.students || [])
      .filter((student) => String(student.batch_id) === String(batch.id))
      .map((student) => student.id);

    setEditingBatch({ ...batch, assigned_student_ids: assignedStudentIds });
    setFormError("");
    setDialogOpen(true);
  };

  const handleCreate = async (payload) => {
    try {
      setFormLoading(true);
      setFormError("");
      const response = await batchService.createBatch(payload);
      setDialogOpen(false);
      setFeedback({
        type: "success",
        message: `${response.batch.batch_name} has been created successfully.`,
      });
      await Promise.all([fetchBatches(), batchService.getMeta().then((nextMeta) => setMeta(nextMeta || initialMeta))]);
    } catch (requestError) {
      setFormError(
        requestError?.response?.data?.message || "Unable to create the batch right now.",
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (payload) => {
    if (!editingBatch) {
      return;
    }

    try {
      setFormLoading(true);
      setFormError("");
      const response = await batchService.updateBatch(editingBatch.id, payload);
      setDialogOpen(false);
      setEditingBatch(null);
      setFeedback({
        type: "success",
        message: `${response.batch.batch_name} has been updated successfully.`,
      });
      await Promise.all([fetchBatches(), batchService.getMeta().then((nextMeta) => setMeta(nextMeta || initialMeta))]);
    } catch (requestError) {
      setFormError(
        requestError?.response?.data?.message || "Unable to update the batch right now.",
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBatch) {
      return;
    }

    try {
      setDeleteLoading(true);
      await batchService.deleteBatch(deletingBatch.id);
      setFeedback({
        type: "success",
        message: `${deletingBatch.batch_name} has been deleted.`,
      });
      setDeletingBatch(null);
      await Promise.all([fetchBatches(), batchService.getMeta().then((nextMeta) => setMeta(nextMeta || initialMeta))]);
    } catch (requestError) {
      setFeedback({
        type: "error",
        message:
          requestError?.response?.data?.message || "Unable to delete the batch right now.",
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
            Batches Module
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
            Batch Operations
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Organize delivery groups, assign students, manage schedule windows, and track batch strength in a real operational workflow.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={fetchBatches}>
            <RotateCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button className="gap-2" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            Create Batch
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
          <BatchSummaryCards summary={summary} />
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
          title="Batch data could not be loaded"
          description={error}
          action={<Button onClick={fetchBatches}>Retry Loading Batches</Button>}
        />
      ) : (
        <>
          <BatchSummaryCards summary={summary} />

          <Card className="rounded-[30px] border-border shadow-sm">
            <CardHeader className="space-y-4 border-b border-border bg-muted/10">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <CardTitle className="text-2xl">Batch Directory</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Search, filter, assign, and manage every batch under each course.
                  </p>
                </div>
                <div className="flex flex-col gap-3 md:flex-row">
                  <div className="relative min-w-[280px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      placeholder="Search by batch, faculty, course, room, or ID"
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
                  value={query.course_id}
                  onChange={(event) => updateFilter("course_id", event.target.value)}
                  className="flex h-10 w-full rounded-full border border-input bg-background px-4 text-sm"
                >
                  <option value="">All courses</option>
                  {(meta.courses || []).map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.course_name}
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
              {batches.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={GraduationCap}
                    title="No batches found"
                    description="No batches matched the current filters yet. Create your first batch to start assigning students and running classes."
                    action={
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Button variant="outline" onClick={resetFilters}>Reset Filters</Button>
                        <Button onClick={openCreateDialog}>Create Batch</Button>
                      </div>
                    }
                  />
                </div>
              ) : (
                <>
                  <BatchDirectoryList
                    batches={batches}
                    onEdit={openEditDialog}
                    onDelete={setDeletingBatch}
                  />

                  <div className="flex flex-col gap-4 border-t border-border px-6 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <p>
                      Showing {(pagination.page - 1) * pagination.limit + 1}-
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} batches
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

      <BatchFormDialog
        key={`${editingBatch?.id || "new"}-${dialogOpen ? "open" : "closed"}`}
        open={dialogOpen}
        mode={editingBatch ? "edit" : "create"}
        batch={editingBatch}
        meta={meta}
        loading={formLoading}
        error={formError}
        onClose={() => {
          setDialogOpen(false);
          setEditingBatch(null);
          setFormError("");
        }}
        onSubmit={editingBatch ? handleUpdate : handleCreate}
      />

      <ConfirmDialog
        open={Boolean(deletingBatch)}
        title="Delete batch?"
        description={`This will remove ${deletingBatch?.batch_name || "this batch"} and unassign its students from the batch map.`}
        confirmLabel="Delete Batch"
        loading={deleteLoading}
        onClose={() => setDeletingBatch(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
