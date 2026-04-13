import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Pencil,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { EmptyState } from "../components/ui/empty-state";
import { Skeleton } from "../components/ui/skeleton";
import CourseFormDialog from "../components/courses/CourseFormDialog";
import CourseStatusBadge from "../components/courses/CourseStatusBadge";
import courseService from "../services/courseService";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function CourseProfile() {
  const { courseId } = useParams();
  const [record, setRecord] = useState(null);
  const [meta, setMeta] = useState({ modes: [], statuses: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const loadCourse = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [courseData, metaData] = await Promise.all([
        courseService.getCourse(courseId),
        courseService.getMeta(),
      ]);
      setRecord(courseData);
      setMeta(metaData);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "We couldn't load the course details right now.",
      );
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  const course = record?.course;

  const stats = useMemo(
    () => [
      { label: "Fee Amount", value: formatCurrency(course?.fee_amount || 0), icon: Wallet },
      { label: "Duration", value: course?.duration_months ? `${course.duration_months} months` : "Flexible", icon: BookOpen },
      { label: "Batches", value: course?.batch_count || 0, icon: GraduationCap },
      { label: "Students", value: course?.enrolled_students || 0, icon: Users },
    ],
    [course],
  );

  const handleUpdate = async (payload) => {
    if (!course) {
      return;
    }

    try {
      setSaveLoading(true);
      setFormError("");
      const response = await courseService.updateCourse(course.id, payload);
      setRecord(response);
      setEditing(false);
    } catch (requestError) {
      setFormError(
        requestError?.response?.data?.message ||
          "Unable to update the course right now.",
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

  if (error || !course) {
    return (
      <EmptyState
        title="Course profile unavailable"
        description={error || "We couldn't find that course."}
        action={
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link to="/admin/courses">Back to Courses</Link>
            </Button>
            <Button onClick={loadCourse}>Retry</Button>
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
            <Link to="/admin/courses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to courses
            </Link>
          </Button>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {course.course_name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {course.course_id} • {course.mode} delivery
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CourseStatusBadge value={course.status} />
          <Button className="gap-2" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" />
            Edit Course
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden rounded-[28px] border-border bg-gradient-to-br from-primary/15 via-card to-card shadow-lg">
        <CardContent className="p-0">
          <div className="grid gap-0 lg:grid-cols-[300px,1fr]">
            <div className="border-b border-border/70 bg-background/60 p-6 lg:border-b-0 lg:border-r">
              <div className="flex h-40 items-center justify-center rounded-3xl border border-border bg-muted/30">
                <BookOpen className="h-16 w-16 text-primary" />
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-border bg-card/90 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    Delivery
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <CourseStatusBadge value={course.mode} />
                    <CourseStatusBadge value={course.status} />
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-card/90 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    Subjects
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {course.subjects.length ? (
                      course.subjects.map((subject) => (
                        <span
                          key={subject}
                          className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                        >
                          {subject}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No subjects added yet.</p>
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
                    <CardTitle>Course Overview</CardTitle>
                    <CardDescription>Commercial and academic configuration.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Course ID</span>
                      <span className="font-medium text-foreground">{course.course_id}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Mode</span>
                      <span className="font-medium text-foreground">{course.mode}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Fee</span>
                      <span className="font-medium text-foreground">{formatCurrency(course.fee_amount)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium text-foreground">
                        {course.duration_months ? `${course.duration_months} months` : "Flexible"}
                      </span>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        Description
                      </p>
                      <p className="leading-6 text-foreground">
                        {course.description || "No description available for this course yet."}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-border">
                  <CardHeader>
                    <CardTitle>Recent Students</CardTitle>
                    <CardDescription>Latest enrollments mapped into this course.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {record?.recent_students?.length ? (
                      record.recent_students.map((student) => (
                        <div
                          key={student.id}
                          className="rounded-2xl border border-border p-4"
                        >
                          <p className="font-semibold text-foreground">{student.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {student.student_id} • {student.status}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No students have been enrolled in this course yet.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6 rounded-3xl border-border">
                <CardHeader>
                  <CardTitle>Batches Using This Course</CardTitle>
                  <CardDescription>
                    Track all batches linked to the course and their current strength.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  {record?.batches?.length ? (
                    record.batches.map((batch) => (
                      <div
                        key={batch.id}
                        className="rounded-3xl border border-border bg-muted/10 p-5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-foreground">{batch.batch_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {batch.schedule_days || "Schedule not added"}
                            </p>
                          </div>
                          <CourseStatusBadge value={batch.status} />
                        </div>
                        <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                          <p>
                            Time: {batch.start_time || "--"} to {batch.end_time || "--"}
                          </p>
                          <p>Students: {batch.student_count}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      title="No batches linked yet"
                      description="Batches created for this course will appear here with their live strength."
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <CourseFormDialog
        key={`${course.id}-${editing ? "open" : "closed"}`}
        open={editing}
        mode="edit"
        course={course}
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
