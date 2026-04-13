import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Briefcase,
  CalendarDays,
  Pencil,
  UserRound,
  Users,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { EmptyState } from "../components/ui/empty-state";
import { Skeleton } from "../components/ui/skeleton";
import FacultyFormDialog from "../components/faculty/FacultyFormDialog";
import FacultyStatusBadge from "../components/faculty/FacultyStatusBadge";
import facultyService from "../services/facultyService";

export default function FacultyProfile() {
  const { facultyId } = useParams();
  const [record, setRecord] = useState(null);
  const [meta, setMeta] = useState({ statuses: [], batches: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const loadFaculty = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [facultyData, metaData] = await Promise.all([
        facultyService.getFacultyMember(facultyId),
        facultyService.getMeta(),
      ]);
      setRecord(facultyData);
      setMeta(metaData);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "We couldn't load the faculty profile right now.",
      );
    } finally {
      setLoading(false);
    }
  }, [facultyId]);

  useEffect(() => {
    loadFaculty();
  }, [loadFaculty]);

  const faculty = record?.faculty;

  const hydratedFaculty = useMemo(
    () =>
      faculty
        ? {
            ...faculty,
            assigned_batch_ids: (record?.batches || []).map((batch) => batch.id),
          }
        : null,
    [faculty, record?.batches],
  );

  const stats = useMemo(
    () => [
      { label: "Assigned Batches", value: faculty?.assigned_batches_count || 0, icon: Briefcase },
      { label: "Active Batches", value: faculty?.active_batches_count || 0, icon: BookOpen },
      { label: "Student Coverage", value: faculty?.student_coverage || 0, icon: Users },
      { label: "Joining Date", value: faculty?.joining_date || "Not recorded", icon: CalendarDays },
    ],
    [faculty],
  );

  const handleUpdate = async (payload) => {
    if (!faculty) {
      return;
    }

    try {
      setSaveLoading(true);
      setFormError("");
      const response = await facultyService.updateFaculty(faculty.id, payload);
      setRecord(response);
      setEditing(false);
    } catch (requestError) {
      setFormError(
        requestError?.response?.data?.message ||
          "Unable to update the faculty record right now.",
      );
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <Skeleton className="h-10 w-44 rounded-full" />
        <Skeleton className="h-56 rounded-3xl" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-28 rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-[360px] rounded-3xl" />
      </div>
    );
  }

  if (error || !faculty) {
    return (
      <EmptyState
        title="Faculty profile unavailable"
        description={error || "We couldn't find that faculty member."}
        action={
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link to="/admin/faculty">Back to Faculty</Link>
            </Button>
            <Button onClick={loadFaculty}>Retry</Button>
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
            <Link to="/admin/faculty">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to faculty
            </Link>
          </Button>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {faculty.full_name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {faculty.faculty_id} - {faculty.email || "No email added"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <FacultyStatusBadge value={faculty.status} />
          <Button className="gap-2" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" />
            Edit Faculty
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden rounded-[28px] border-border bg-gradient-to-br from-primary/15 via-card to-card shadow-lg">
        <CardContent className="p-0">
          <div className="grid gap-0 lg:grid-cols-[300px,1fr]">
            <div className="border-b border-border/70 bg-background/60 p-6 lg:border-b-0 lg:border-r">
              <div className="flex h-40 items-center justify-center rounded-3xl border border-border bg-muted/30">
                <UserRound className="h-16 w-16 text-primary" />
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-border bg-card/90 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    Contact
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-foreground">
                    <p>{faculty.phone || "Phone not added"}</p>
                    <p className="text-muted-foreground">
                      {faculty.email || "Email not added"}
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-card/90 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    Subjects
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {faculty.subject_specialization.length ? (
                      faculty.subject_specialization.map((subject) => (
                        <span
                          key={subject}
                          className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                        >
                          {subject}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No specializations added yet.</p>
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
                    <CardTitle>Faculty Overview</CardTitle>
                    <CardDescription>Profile, employment, and notes.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Faculty ID</span>
                      <span className="font-medium text-foreground">{faculty.faculty_id}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-medium text-foreground">{faculty.status}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Joining Date</span>
                      <span className="font-medium text-foreground">
                        {faculty.joining_date || "Not recorded"}
                      </span>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        Notes
                      </p>
                      <p className="leading-6 text-foreground">
                        {faculty.notes || "No notes have been added for this faculty record yet."}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-border">
                  <CardHeader>
                    <CardTitle>Assignment Snapshot</CardTitle>
                    <CardDescription>Current teaching load and active reach.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="rounded-2xl border border-border p-4">
                      <p className="font-semibold text-foreground">
                        {faculty.assigned_batches_count || 0} batches assigned
                      </p>
                      <p className="text-muted-foreground">
                        {faculty.active_batches_count || 0} of them are currently active
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border p-4">
                      <p className="font-semibold text-foreground">
                        {faculty.student_coverage || 0} students covered
                      </p>
                      <p className="text-muted-foreground">
                        Based on the student strength of linked batches
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6 rounded-3xl border-border">
                <CardHeader>
                  <CardTitle>Assigned Batches</CardTitle>
                  <CardDescription>
                    Batches currently mapped to this faculty member.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  {record?.batches?.length ? (
                    record.batches.map((batch) => (
                      <div
                        key={batch.id}
                        className="rounded-3xl border border-border bg-muted/10 p-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-foreground">{batch.batch_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {batch.batch_id} - {batch.course_name}
                            </p>
                          </div>
                          <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
                            {batch.status}
                          </span>
                        </div>
                        <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                          <p>Students: {batch.student_count}</p>
                          <p>Timing: {batch.timing || "Not set"}</p>
                          <p>Room: {batch.room || "Not assigned"}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      title="No batches assigned yet"
                      description="Assign batches to this faculty member to see their current teaching load."
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <FacultyFormDialog
        key={`${faculty.id}-${editing ? "open" : "closed"}`}
        open={editing}
        mode="edit"
        faculty={hydratedFaculty}
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
