import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarCheck2,
  Clock3,
  RotateCcw,
  Save,
  Search,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import AttendanceSheetTable from "../components/attendance/AttendanceSheetTable";
import AttendanceSummaryCards from "../components/attendance/AttendanceSummaryCards";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { EmptyState } from "../components/ui/empty-state";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import attendanceService from "../services/attendanceService";

const today = new Date().toISOString().slice(0, 10);
const rangeStart = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10);

const initialMeta = { statuses: [], batches: [] };
const initialSheet = {
  batch: null,
  date: today,
  students: [],
  summary: {
    total_records: 0,
    sessions_marked: 0,
    students_marked: 0,
    present_count: 0,
    absent_count: 0,
    late_count: 0,
    excused_count: 0,
    attendance_percentage: 0,
  },
};
const initialHistory = {
  items: [],
  meta: {
    pagination: { page: 1, limit: 10, total: 0, total_pages: 1 },
    summary: initialSheet.summary,
  },
};
const initialReport = {
  summary: initialSheet.summary,
  today: initialSheet.summary,
  recent_sessions: [],
  low_attendance_students: [],
};

const MotionDiv = motion.div;

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not available";

const formatPercent = (value) => `${value || 0}%`;

export default function Attendance() {
  const [meta, setMeta] = useState(initialMeta);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedDate, setSelectedDate] = useState(today);
  const [sheet, setSheet] = useState(initialSheet);
  const [sheetStudents, setSheetStudents] = useState([]);
  const [historyResult, setHistoryResult] = useState(initialHistory);
  const [report, setReport] = useState(initialReport);
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    date_from: rangeStart,
    date_to: today,
    page: 1,
    limit: 10,
  });
  const [metaLoading, setMetaLoading] = useState(true);
  const [sheetLoading, setSheetLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [sheetSaving, setSheetSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [sheetError, setSheetError] = useState("");
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setFilters((current) => ({ ...current, page: 1, search: searchInput.trim() }));
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const loadMeta = useCallback(async () => {
    try {
      setMetaLoading(true);
      const response = await attendanceService.getMeta();
      const nextMeta = response || initialMeta;
      setMeta(nextMeta);

      setSelectedBatchId((current) =>
        current || (nextMeta.batches?.length ? String(nextMeta.batches[0].id) : ""),
      );
    } catch (requestError) {
      setPageError(
        requestError?.response?.data?.message ||
          "We couldn't load the attendance settings right now.",
      );
    } finally {
      setMetaLoading(false);
    }
  }, []);

  const fetchSheet = useCallback(async () => {
    if (!selectedBatchId) {
      setSheet(initialSheet);
      setSheetStudents([]);
      setSheetLoading(false);
      return;
    }

    try {
      setSheetLoading(true);
      setSheetError("");
      const response = await attendanceService.getSheet(selectedBatchId, selectedDate);
      setSheet(response || initialSheet);
      setSheetStudents(response?.students || []);
    } catch (requestError) {
      setSheetError(
        requestError?.response?.data?.message ||
          "We couldn't load the attendance sheet right now.",
      );
    } finally {
      setSheetLoading(false);
    }
  }, [selectedBatchId, selectedDate]);

  const fetchHistoryAndReport = useCallback(async () => {
    try {
      setHistoryLoading(true);
      setPageError("");

      const batchFilter = selectedBatchId || "";
      const [historyData, reportData] = await Promise.all([
        attendanceService.getAttendance({
          ...filters,
          batch_id: batchFilter,
        }),
        attendanceService.getReport({
          batch_id: batchFilter,
          date_from: filters.date_from,
          date_to: filters.date_to,
        }),
      ]);

      setHistoryResult(historyData || initialHistory);
      setReport(reportData || initialReport);
    } catch (requestError) {
      setPageError(
        requestError?.response?.data?.message ||
          "We couldn't load the attendance report right now.",
      );
    } finally {
      setHistoryLoading(false);
    }
  }, [filters, selectedBatchId]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    fetchSheet();
  }, [fetchSheet]);

  useEffect(() => {
    fetchHistoryAndReport();
  }, [fetchHistoryAndReport]);

  const pagination = historyResult.meta?.pagination || initialHistory.meta.pagination;
  const historyItems = historyResult.items || [];
  const batches = useMemo(() => meta.batches || [], [meta.batches]);
  const statuses = useMemo(() => meta.statuses || [], [meta.statuses]);

  const activeBatch = useMemo(
    () => batches.find((batch) => String(batch.id) === String(selectedBatchId)) || null,
    [batches, selectedBatchId],
  );

  const updateStudent = (studentId, key, value) => {
    setSheetStudents((current) =>
      current.map((student) =>
        student.student_id === studentId ? { ...student, [key]: value } : student,
      ),
    );
  };

  const markAll = (status) => {
    setSheetStudents((current) =>
      current.map((student) => ({
        ...student,
        status,
      })),
    );
  };

  const resetFilters = () => {
    setSearchInput("");
    setFilters({
      search: "",
      status: "",
      date_from: rangeStart,
      date_to: today,
      page: 1,
      limit: 10,
    });
  };

  const handleSaveSheet = async () => {
    if (!selectedBatchId || !sheetStudents.length) {
      return;
    }

    try {
      setSheetSaving(true);
      const response = await attendanceService.saveSheet({
        batch_id: Number(selectedBatchId),
        date: selectedDate,
        records: sheetStudents.map((student) => ({
          student_id: student.student_id,
          status: student.status,
          remarks: student.remarks || "",
        })),
      });

      setSheet(response || initialSheet);
      setSheetStudents(response?.students || []);
      setFeedback({
        type: "success",
        message: `Attendance saved for ${response?.batch?.batch_name || "the selected batch"} on ${formatDate(selectedDate)}.`,
      });
      await fetchHistoryAndReport();
    } catch (requestError) {
      setFeedback({
        type: "error",
        message:
          requestError?.response?.data?.message ||
          "Unable to save attendance right now.",
      });
    } finally {
      setSheetSaving(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([loadMeta(), fetchSheet(), fetchHistoryAndReport()]);
  };

  if (metaLoading && !batches.length) {
    return (
      <div className="space-y-6 pb-12">
        <Skeleton className="h-14 rounded-3xl" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-28 rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-[460px] rounded-3xl" />
      </div>
    );
  }

  if (!metaLoading && !batches.length) {
    return (
      <EmptyState
        icon={Users}
        title="No batches available for attendance"
        description="Create a batch and assign students before marking attendance from this module."
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
      <div className="page-header">
        <div>
          <p className="page-kicker">Attendance Module</p>
          <h1 className="page-title">Batch Attendance Operations</h1>
          <p className="page-description">
            Mark attendance batch-wise, review recent sessions, and surface low-attendance risks before they impact student outcomes.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={refreshAll}>
            <RotateCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            className="gap-2"
            onClick={handleSaveSheet}
            disabled={sheetSaving || !sheetStudents.length}
          >
            <Save className={`h-4 w-4 ${sheetSaving ? "animate-pulse" : ""}`} />
            {sheetSaving ? "Saving..." : "Save Attendance"}
          </Button>
        </div>
      </div>

      {feedback ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm shadow-sm ${
            feedback.type === "error"
              ? "border-red-200 bg-red-50 text-red-600"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <AttendanceSummaryCards report={report} />

      <Card>
        <CardHeader className="space-y-4 border-b border-gray-100 bg-slate-50/80">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <CardTitle className="text-xl">Attendance Sheet</CardTitle>
              <CardDescription>
                Choose a batch and date, then mark or update each student's attendance in one save action.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Present", "Absent", "Late"].map((status) => (
                <Button
                  key={status}
                  variant="secondary"
                  size="sm"
                  onClick={() => markAll(status)}
                  disabled={!sheetStudents.length}
                >
                  Mark All {status}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <select
              value={selectedBatchId}
              onChange={(event) => setSelectedBatchId(event.target.value)}
              className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-text-primary shadow-sm"
            >
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.batch_name} - {batch.course_name}
                </option>
              ))}
            </select>
            <Input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className=""
            />
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-text-secondary shadow-sm">
              Students in batch: <span className="font-semibold text-text-primary">{activeBatch?.student_count || 0}</span>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-text-secondary shadow-sm">
              Saved attendance: <span className="font-semibold text-text-primary">{formatPercent(sheet.summary?.attendance_percentage || 0)}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {sheetLoading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3, 4].map((item) => (
                <Skeleton key={item} className="h-20 rounded-2xl" />
              ))}
            </div>
          ) : sheetError ? (
            <div className="p-6">
              <EmptyState
                icon={CalendarCheck2}
                title="Attendance sheet unavailable"
                description={sheetError}
                action={<Button onClick={fetchSheet}>Retry Loading Sheet</Button>}
              />
            </div>
          ) : !sheetStudents.length ? (
            <div className="p-6">
              <EmptyState
                icon={Users}
                title="No students assigned to this batch"
                description="Assign students to the selected batch first, then you can mark attendance for them here."
              />
            </div>
          ) : (
            <>
              <div className="grid gap-4 border-b border-gray-100 px-6 py-5 md:grid-cols-4">
                {[
                  ["Marked Students", sheet.summary?.students_marked || 0],
                  ["Present", sheet.summary?.present_count || 0],
                  ["Absent", sheet.summary?.absent_count || 0],
                  ["Late", sheet.summary?.late_count || 0],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-gray-100 bg-slate-50/70 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                      {label}
                    </p>
                    <p className="mt-2 font-mono text-2xl font-bold text-text-primary">{value}</p>
                  </div>
                ))}
              </div>

              <AttendanceSheetTable
                students={sheetStudents}
                statuses={statuses}
                onStatusChange={(studentId, value) => updateStudent(studentId, "status", value)}
                onRemarksChange={(studentId, value) => updateStudent(studentId, "remarks", value)}
              />
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>
              Latest marked sessions for the selected batch and date range.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {historyLoading ? (
              [1, 2, 3].map((item) => <Skeleton key={item} className="h-24 rounded-2xl" />)
            ) : report.recent_sessions?.length ? (
              report.recent_sessions.map((session) => (
                <div key={`${session.batch_id}-${session.date}`} className="rounded-2xl border border-gray-100 bg-slate-50/70 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{session.batch_name}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(session.date)}</p>
                    </div>
                    <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                      {formatPercent(session.attendance_percentage)}
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-text-secondary md:grid-cols-3">
                    <p>Present: <span className="font-medium text-text-primary">{session.present_count}</span></p>
                    <p>Absent: <span className="font-medium text-text-primary">{session.absent_count}</span></p>
                    <p>Late: <span className="font-medium text-text-primary">{session.late_count}</span></p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon={Clock3}
                title="No sessions marked yet"
                description="Once attendance is saved, recent session summaries will appear here."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Attendance Alerts</CardTitle>
            <CardDescription>
              Students under 75% attendance in the selected report window.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {historyLoading ? (
              [1, 2, 3].map((item) => <Skeleton key={item} className="h-20 rounded-2xl" />)
            ) : report.low_attendance_students?.length ? (
              report.low_attendance_students.map((student) => (
                <div key={`${student.student_id}-${student.batch_name}`} className="rounded-2xl border border-gray-100 bg-slate-50/70 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{student.student_name}</p>
                      <p className="text-sm text-text-secondary">
                        {student.student_code} | {student.batch_name}
                      </p>
                    </div>
                    <div className="rounded-full bg-destructive/10 px-3 py-1 text-sm font-semibold text-destructive">
                      {formatPercent(student.attendance_percentage)}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-text-secondary">
                    {student.attended_sessions} of {student.total_sessions} sessions attended.
                  </p>
                </div>
              ))
            ) : (
              <EmptyState
                icon={AlertTriangle}
                title="No low attendance alerts"
                description="All tracked students are currently above the alert threshold in this date window."
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-4 border-b border-gray-100 bg-slate-50/80">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <CardTitle className="text-xl">Attendance History</CardTitle>
              <CardDescription>
                Search by student or batch, filter by status, and review recorded attendance entries.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="search-shell min-w-[280px] bg-white">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by student, batch, or course"
                  className="border-0 pl-10 shadow-none focus-visible:ring-0"
                />
              </div>
              <Button variant="secondary" onClick={resetFilters}>
                Clear Filters
              </Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <select
              value={filters.status}
              onChange={(event) =>
                setFilters((current) => ({ ...current, page: 1, status: event.target.value }))
              }
              className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-text-primary shadow-sm"
            >
              <option value="">All statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <Input
              type="date"
              value={filters.date_from}
              onChange={(event) =>
                setFilters((current) => ({ ...current, page: 1, date_from: event.target.value }))
              }
              className=""
            />
            <Input
              type="date"
              value={filters.date_to}
              onChange={(event) =>
                setFilters((current) => ({ ...current, page: 1, date_to: event.target.value }))
              }
              className=""
            />
            <select
              value={String(filters.limit)}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  page: 1,
                  limit: Number(event.target.value),
                }))
              }
              className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-text-primary shadow-sm"
            >
              {[10, 20, 30].map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {historyLoading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3, 4].map((item) => (
                <Skeleton key={item} className="h-20 rounded-2xl" />
              ))}
            </div>
          ) : pageError ? (
            <div className="p-6">
              <EmptyState
                icon={CalendarCheck2}
                title="Attendance history unavailable"
                description={pageError}
                action={<Button onClick={fetchHistoryAndReport}>Retry Loading History</Button>}
              />
            </div>
          ) : !historyItems.length ? (
            <div className="p-6">
              <EmptyState
                icon={CalendarCheck2}
                title="No attendance history found"
                description="No attendance records match the current filters yet."
                action={<Button onClick={resetFilters}>Reset Filters</Button>}
              />
            </div>
          ) : (
            <>
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Date</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{formatDate(item.date)}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-foreground">{item.student_name}</p>
                            <p className="text-sm text-muted-foreground">{item.student_code}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-foreground">{item.batch_name}</p>
                          <p className="text-sm text-muted-foreground">{item.course_name}</p>
                        </TableCell>
                        <TableCell>
                          <span className="rounded-full border border-primary/10 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                            {item.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.remarks || "No remarks"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="grid gap-4 p-4 lg:hidden">
                {historyItems.map((item) => (
                  <Card key={item.id} className="rounded-3xl border-border">
                    <CardContent className="space-y-3 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{item.student_name}</p>
                          <p className="text-sm text-muted-foreground">{item.student_code}</p>
                        </div>
                        <span className="rounded-full border border-primary/10 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                          {item.status}
                        </span>
                      </div>
                      <div className="grid gap-2 text-sm text-muted-foreground">
                        <p>{formatDate(item.date)}</p>
                        <p>{item.batch_name}</p>
                        <p>{item.course_name}</p>
                        <p>{item.remarks || "No remarks"}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex flex-col gap-4 border-t border-gray-100 px-6 py-4 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Showing {(pagination.page - 1) * pagination.limit + 1}-
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} records
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setFilters((current) => ({ ...current, page: current.page - 1 }))
                    }
                    disabled={pagination.page <= 1}
                  >
                    Previous
                  </Button>
                  <span className="min-w-[96px] text-center">
                    Page {pagination.page} of {pagination.total_pages || 1}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setFilters((current) => ({ ...current, page: current.page + 1 }))
                    }
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
    </MotionDiv>
  );
}
