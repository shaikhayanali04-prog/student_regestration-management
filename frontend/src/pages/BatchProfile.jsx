import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  GraduationCap,
  Pencil,
  UserRound,
  Users,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { EmptyState } from "../components/ui/empty-state";
import { Skeleton } from "../components/ui/skeleton";
import BatchFormDialog from "../components/batches/BatchFormDialog";
import BatchStatusBadge from "../components/batches/BatchStatusBadge";
import batchService from "../services/batchService";

export default function BatchProfile() {
  const { batchId } = useParams();
  const [record, setRecord] = useState(null);
  const [meta, setMeta] = useState({ statuses: [], courses: [], students: [], faculty: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const loadBatch = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [batchData, metaData] = await Promise.all([
        batchService.getBatch(batchId),
        batchService.getMeta(),
      ]);

      setRecord(batchData);
      setMeta(metaData);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "We couldn't load the batch details right now.",
      );
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    loadBatch();
  }, [loadBatch]);

  const batch = record?.batch;

  const hydratedBatch = useMemo(
    () =>
      batch
        ? {
            ...batch,
            assigned_student_ids: (record?.students || []).map((student) => student.id),
          }
        : null,
    [batch, record?.students],
  );

  const stats = useMemo(
    () => [
      { label: "Students", value: batch?.student_count || 0, icon: Users },
      { label: "Available Seats", value: batch?.available_seats ?? "Open", icon: GraduationCap },
      { label: "Faculty", value: batch?.faculty_name || "Unassigned", icon: UserRound },
      { label: "Timing", value: batch?.timing || "Not set", icon: CalendarDays },
    ],
    [batch],
  );

  const handleUpdate = async (payload) => {
    if (!batch) {
      return;
    }

    try {
      setSaveLoading(true);
      setFormError("");
      const response = await batchService.updateBatch(batch.id, payload);
      setRecord(response);
      setEditing(false);
    } catch (requestError) {
      setFormError(
        requestError?.response?.data?.message ||
          "Unable to update the batch right now.",
      );
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <Skeleton className="h-10 w-44 rounded-full" />
        <Skeleton className="h-52 rounded-3xl" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-28 rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-[360px] rounded-3xl" />
      </div>
    );
  }

  if (error || !batch) {
    return (
      <EmptyState
        title="Batch profile unavailable"
        description={error || "We couldn't find that batch."}
        action={
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link to="/admin/batches">Back to Batches</Link>
            </Button>
            <Button onClick={loadBatch}>Retry</Button>
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Button variant="ghost" asChild className="mb-3 -ml-3 text-muted-foreground">
            <Link to="/admin/batches">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to batches
            </Link>
          </Button>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {batch.batch_name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {batch.batch_id} • {batch.course_name}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <BatchStatusBadge status={batch.status} />
          <Button className="gap-2" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" />
            Edit Batch
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden rounded-[28px] border-border bg-gradient-to-br from-primary/15 via-card to-card shadow-lg">
        <CardContent className="p-0">
          <div className="grid gap-0 lg:grid-cols-[300px,1fr]">
            <div className="border-b border-border/70 bg-background/60 p-6 lg:border-b-0 lg:border-r">
              <div className="flex h-40 items-center justify-center rounded-3xl border border-border bg-muted/30">
                <GraduationCap className="h-16 w-16 text-primary" />
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-border bg-card/90 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    Weekly Days
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {batch.days_of_week.length ? (
                      batch.days_of_week.map((day) => (
                        <span
                          key={day}
                          className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                        >
                          {day}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No days configured.</p>
                    )}
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-card/90 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    Room & Faculty
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-foreground">
                    <p>{batch.room || "Room not assigned"}</p>
                    {batch.faculty_id ? (
                      <Link
                        to={`/admin/faculty/${batch.faculty_id}`}
                        className="text-primary hover:underline"
                      >
                        {batch.faculty_name}
                      </Link>
                    ) : (
                      <p className="text-muted-foreground">Faculty not assigned</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="rounded-3xl border border-border bg-card/90 p-4 shadow-sm"
                    >
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="mt-2 text-lg font-bold text-foreground">{item.value}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <Card className="rounded-3xl border-border">
                  <CardHeader>
                    <CardTitle>Batch Overview</CardTitle>
                    <CardDescription>Delivery, schedule, and seat planning.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Course</span>
                      <span className="font-medium text-foreground">{batch.course_name}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Timing</span>
                      <span className="font-medium text-foreground">{batch.timing || "Not set"}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Date Range</span>
                      <span className="font-medium text-foreground">
                        {batch.start_date || "--"} to {batch.end_date || "--"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Capacity</span>
                      <span className="font-medium text-foreground">
                        {batch.capacity ? `${batch.capacity} seats` : "Open"}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-border">
                  <CardHeader>
                    <CardTitle>Assignment Snapshot</CardTitle>
                    <CardDescription>Current student coverage for the batch.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="rounded-2xl border border-border p-4">
                      <p className="font-semibold text-foreground">{batch.student_count} students assigned</p>
                      <p className="text-muted-foreground">
                        {batch.capacity
                          ? `${batch.available_seats} seats are still available`
                          : "Capacity is open and can scale as needed"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border p-4">
                      <p className="font-semibold text-foreground">{batch.faculty_name || "No faculty yet"}</p>
                      <p className="text-muted-foreground">{batch.room || "Room not yet assigned"}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6 rounded-3xl border-border">
                <CardHeader>
                  <CardTitle>Assigned Students</CardTitle>
                  <CardDescription>
                    Students currently attached to this batch through the enrollment mapping.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  {record?.students?.length ? (
                    record.students.map((student) => (
                      <div
                        key={student.id}
                        className="rounded-3xl border border-border bg-muted/10 p-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-foreground">{student.full_name}</p>
                            <p className="text-sm text-muted-foreground">{student.student_id}</p>
                          </div>
                          <BatchStatusBadge status={student.status === "Active" ? "Active" : "Completed"} />
                        </div>
                        <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                          <p>Phone: {student.phone || "Not available"}</p>
                          <p>Joined: {student.joined_date || "Not recorded"}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      title="No students assigned yet"
                      description="Use edit batch to assign enrolled students from the linked course."
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <BatchFormDialog
        key={`${batch.id}-${editing ? "open" : "closed"}`}
        open={editing}
        mode="edit"
        batch={hydratedBatch}
        meta={meta}
        loading={saveLoading}
        error={formError}
        onClose={() => {
          setEditing(false);
          setFormError("");
        }}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
