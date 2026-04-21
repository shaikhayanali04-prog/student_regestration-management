import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Mail,
  Pencil,
  Phone,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { EmptyState } from "../components/ui/empty-state";
import StudentFormDialog from "../components/students/StudentFormDialog";
import StudentStatusBadge from "../components/students/StudentStatusBadge";
import studentService from "../services/studentService";

const tabs = ["Overview", "Fees", "Attendance", "Performance", "Documents", "Notes"];

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not available";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const MotionDiv = motion.div;

export default function StudentProfile() {
  const { studentId } = useParams();
  const [record, setRecord] = useState(null);
  const [meta, setMeta] = useState({ courses: [], batches: [], statuses: [] });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [activeTab, setActiveTab] = useState("Overview");

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [studentData, metaData] = await Promise.all([
        studentService.getStudent(studentId),
        studentService.getMeta(),
      ]);
      setRecord(studentData);
      setMeta(metaData);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "We couldn't load the student profile right now.",
      );
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const student = record?.student;
  const fees = record?.fees;
  const attendance = record?.attendance;

  const quickStats = useMemo(
    () => [
      {
        label: "Course",
        value: student?.course_name || "Unassigned",
        icon: BookOpen,
      },
      {
        label: "Batch",
        value: student?.batch_name || "Unassigned",
        icon: GraduationCap,
      },
      {
        label: "Pending Fees",
        value: formatCurrency(fees?.summary?.due_amount || 0),
        icon: Wallet,
      },
      {
        label: "Attendance",
        value: `${attendance?.summary?.attendance_percentage || 0}%`,
        icon: CalendarDays,
      },
    ],
    [
      attendance?.summary?.attendance_percentage,
      fees?.summary?.due_amount,
      student?.batch_name,
      student?.course_name,
    ],
  );

  const handleUpdate = async (payload) => {
    try {
      setSaveLoading(true);
      setFormError("");
      const response = await studentService.updateStudent(student.id, payload);
      setRecord(response);
      setEditing(false);
    } catch (requestError) {
      setFormError(
        requestError?.response?.data?.message || "Unable to update the student right now.",
      );
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <Skeleton className="h-10 w-52 rounded-full" />
        <Skeleton className="h-56 rounded-3xl" />
        <div className="grid gap-6 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-32 rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-[420px] rounded-3xl" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <EmptyState
        title="Student profile unavailable"
        description={error || "We couldn't find that student record."}
        action={
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link to="/admin/students">Back to Students</Link>
            </Button>
            <Button onClick={loadProfile}>Retry</Button>
          </div>
        }
      />
    );
  }

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-6 pb-10"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Button variant="ghost" asChild className="mb-3 -ml-3 text-text-secondary">
            <Link to="/admin/students">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to students
            </Link>
          </Button>
          <h1 className="font-display text-3xl font-bold tracking-tight text-text-primary">
            {student.full_name}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {student.student_id} | Admitted on {formatDate(student.admission_date)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StudentStatusBadge status={student.status} />
          <Button onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" />
            Edit Student
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-gray-100 bg-gradient-to-br from-primary/10 via-white to-sky-50">
        <CardContent className="p-0">
          <div className="grid gap-0 lg:grid-cols-[280px,1fr]">
            <div className="border-b border-gray-100 bg-white/80 p-6 lg:border-b-0 lg:border-r">
              <div className="mx-auto flex h-40 w-40 items-center justify-center overflow-hidden rounded-3xl border border-gray-100 bg-slate-50">
                {student.student_photo ? (
                  <img
                    src={student.student_photo}
                    alt={student.full_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-display text-5xl font-bold text-primary">
                    {student.full_name?.charAt(0) || "S"}
                  </span>
                )}
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-text-secondary">
                    Contact
                  </p>
                  <div className="mt-3 space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-text-primary">
                      <Phone className="h-4 w-4 text-primary" />
                      {student.phone || "Not available"}
                    </div>
                    <div className="flex items-center gap-3 text-text-primary">
                      <Mail className="h-4 w-4 text-primary" />
                      {student.email || "Not available"}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-text-secondary">
                    Guardian
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-text-primary">
                    <p>{student.parent_name || "Not available"}</p>
                    <p className="text-text-secondary">
                      {student.parent_phone || "No guardian phone"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {quickStats.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                    >
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-sky-100 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                        {item.label}
                      </p>
                      <p className="mt-2 font-mono text-lg font-bold text-text-primary">
                        {item.value}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap gap-2 rounded-2xl border border-gray-100 bg-white/85 p-2 shadow-sm">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                      activeTab === tab
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-text-secondary hover:bg-primary/5 hover:text-primary"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                {activeTab === "Overview" ? (
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Admission Snapshot</CardTitle>
                        <CardDescription>
                          Core academic placement and current lifecycle stage.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-text-secondary">Student ID</span>
                          <span className="font-medium text-text-primary">{student.student_id}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-text-secondary">Course</span>
                          <span className="font-medium text-text-primary">
                            {student.course_name || "Unassigned"}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-text-secondary">Batch</span>
                          <span className="font-medium text-text-primary">
                            {student.batch_name || "Unassigned"}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-text-secondary">Date of Birth</span>
                          <span className="font-medium text-text-primary">
                            {formatDate(student.date_of_birth)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-text-secondary">Gender</span>
                          <span className="font-medium text-text-primary">
                            {student.gender || "Not specified"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Address & Notes</CardTitle>
                        <CardDescription>Operational context for the admin team.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 text-sm">
                        <div>
                          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                            Address
                          </p>
                          <p className="leading-6 text-text-primary">
                            {student.address || "Address not captured yet."}
                          </p>
                        </div>
                        <div>
                          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                            Notes
                          </p>
                          <p className="leading-6 text-text-primary">
                            {student.notes || "No notes available for this student."}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : null}

                {activeTab === "Fees" ? (
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                      <Card>
                        <CardHeader>
                          <CardDescription>Total Fee</CardDescription>
                          <CardTitle>{formatCurrency(fees?.summary?.total_fee || 0)}</CardTitle>
                        </CardHeader>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardDescription>Collected</CardDescription>
                          <CardTitle>{formatCurrency(fees?.summary?.amount_paid || 0)}</CardTitle>
                        </CardHeader>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardDescription>Pending</CardDescription>
                          <CardTitle>{formatCurrency(fees?.summary?.due_amount || 0)}</CardTitle>
                        </CardHeader>
                      </Card>
                    </div>

                    {fees?.history?.length ? (
                      <Card>
                        <CardHeader>
                          <CardTitle>Payment History</CardTitle>
                          <CardDescription>
                            Recorded fee collections for this student.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {fees.history.map((item) => (
                            <div
                              key={item.id}
                              className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-slate-50/70 p-4 md:flex-row md:items-center md:justify-between"
                            >
                              <div>
                                <p className="font-semibold text-text-primary">
                                  {formatCurrency(item.amount_paid)}
                                </p>
                                <p className="text-sm text-text-secondary">
                                  {item.payment_method} | {formatDate(item.payment_date)}
                                </p>
                              </div>
                              <p className="text-sm text-text-secondary">
                                {item.remarks || "No remarks"}
                              </p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ) : (
                      <EmptyState
                        title="No payments recorded yet"
                        description="Fee entries will appear here once collections are logged for this student."
                      />
                    )}
                  </div>
                ) : null}

                {activeTab === "Attendance" ? (
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-4">
                      {[
                        ["Sessions", attendance?.summary?.total_sessions || 0],
                        ["Present", attendance?.summary?.present_count || 0],
                        ["Absent", attendance?.summary?.absent_count || 0],
                        ["Late", attendance?.summary?.late_count || 0],
                      ].map(([label, value]) => (
                        <Card key={label}>
                          <CardHeader>
                            <CardDescription>{label}</CardDescription>
                            <CardTitle>{value}</CardTitle>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>

                    {attendance?.history?.length ? (
                      <Card>
                        <CardHeader>
                          <CardTitle>Attendance History</CardTitle>
                          <CardDescription>
                            Latest attendance records across batches.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {attendance.history.map((item) => (
                            <div
                              key={item.id}
                              className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-slate-50/70 p-4 md:flex-row md:items-center md:justify-between"
                            >
                              <div>
                                <p className="font-semibold text-text-primary">
                                  {formatDate(item.date)}
                                </p>
                                <p className="text-sm text-text-secondary">
                                  {item.batch_name || "Batch unavailable"}
                                </p>
                              </div>
                              <div className="text-right">
                                <StudentStatusBadge status={item.status} />
                                <p className="mt-2 text-sm text-text-secondary">
                                  {item.remarks || "No remarks"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ) : (
                      <EmptyState
                        title="No attendance history yet"
                        description="Attendance records will show up here after the student is marked in a batch."
                      />
                    )}
                  </div>
                ) : null}

                {activeTab === "Performance" ? (
                  <EmptyState
                    title="Performance module is next in the roadmap"
                    description="Test scores and academic progress will appear here once the exams module is connected."
                  />
                ) : null}

                {activeTab === "Documents" ? (
                  <EmptyState
                    title="Documents have not been uploaded yet"
                    description="Student documents will be managed here once the documents module is enabled."
                  />
                ) : null}

                {activeTab === "Notes" ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Advisor Notes</CardTitle>
                      <CardDescription>Shared context for admissions and follow-up.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap leading-7 text-text-primary">
                        {student.notes || "No notes are available for this student yet."}
                      </p>
                    </CardContent>
                  </Card>
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <StudentFormDialog
        key={`${student.id}-${editing ? "open" : "closed"}`}
        open={editing}
        mode="edit"
        student={student}
        meta={meta}
        loading={saveLoading}
        error={formError}
        onClose={() => {
          setEditing(false);
          setFormError("");
        }}
        onSubmit={handleUpdate}
      />
    </MotionDiv>
  );
}
