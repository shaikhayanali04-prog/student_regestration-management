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
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Attendance Module
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
            Batch Attendance Operations
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Mark attendance batch-wise, review recent sessions, and surface low-attendance risks before they impact student outcomes.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="gap-2" onClick={refreshAll}>
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
          className={`rounded-2xl border px-4 py-3 text-sm ${
            feedback.type === "error"
              ? "border-destructive/20 bg-destructive/10 text-destructive"
              : "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <AttendanceSummaryCards report={report} />

      <Card className="rounded-[30px] border-border shadow-sm">
        <CardHeader className="space-y-4 border-b border-border bg-muted/10">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <CardTitle className="text-2xl">Attendance Sheet</CardTitle>
              <CardDescription>
                Choose a batch and date, then mark or update each student's attendance in one save action.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Present", "Absent", "Late"].map((status) => (
                <Button
                  key={status}
                  variant="outline"
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
              className="flex h-10 w-full rounded-full border border-input bg-background px-4 text-sm"
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
              className="rounded-full"
            />
            <div className="rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground">
              Students in batch: <span className="font-semibold text-foreground">{activeBatch?.student_count || 0}</span>
            </div>
            <div className="rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground">
              Saved attendance: <span className="font-semibold text-foreground">{formatPercent(sheet.summary?.attendance_percentage || 0)}</span>
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
              <div className="grid gap-4 border-b border-border px-6 py-5 md:grid-cols-4">
                {[
                  ["Marked Students", sheet.summary?.students_marked || 0],
                  ["Present", sheet.summary?.present_count || 0],
                  ["Absent", sheet.summary?.absent_count || 0],
                  ["Late", sheet.summary?.late_count || 0],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-border bg-background/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      {label}
                    </p>
                    <p className="mt-2 text-2xl font-black text-foreground">{value}</p>
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
        <Card className="rounded-[30px] border-border shadow-sm">
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
                <div key={`${session.batch_id}-${session.date}`} className="rounded-3xl border border-border bg-muted/10 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{session.batch_name}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(session.date)}</p>
                    </div>
                    <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                      {formatPercent(session.attendance_percentage)}
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                    <p>Present: <span className="font-medium text-foreground">{session.present_count}</span></p>
                    <p>Absent: <span className="font-medium text-foreground">{session.absent_count}</span></p>
                    <p>Late: <span className="font-medium text-foreground">{session.late_count}</span></p>
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

        <Card className="rounded-[30px] border-border shadow-sm">
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
                <div key={`${student.student_id}-${student.batch_name}`} className="rounded-3xl border border-border bg-muted/10 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{student.student_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {student.student_code} - {student.batch_name}
                      </p>
                    </div>
                    <div className="rounded-full bg-destructive/10 px-3 py-1 text-sm font-semibold text-destructive">
                      {formatPercent(student.attendance_percentage)}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
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

      <Card className="rounded-[30px] border-border shadow-sm">
        <CardHeader className="space-y-4 border-b border-border bg-muted/10">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <CardTitle className="text-2xl">Attendance History</CardTitle>
              <CardDescription>
                Search by student or batch, filter by status, and review recorded attendance entries.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative min-w-[280px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by student, batch, or course"
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
              value={filters.status}
              onChange={(event) =>
                setFilters((current) => ({ ...current, page: 1, status: event.target.value }))
              }
              className="flex h-10 w-full rounded-full border border-input bg-background px-4 text-sm"
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
              className="rounded-full"
            />
            <Input
              type="date"
              value={filters.date_to}
              onChange={(event) =>
                setFilters((current) => ({ ...current, page: 1, date_to: event.target.value }))
              }
              className="rounded-full"
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
              className="flex h-10 w-full rounded-full border border-input bg-background px-4 text-sm"
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
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
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
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
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
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
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

              <div className="flex flex-col gap-4 border-t border-border px-6 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Showing {(pagination.page - 1) * pagination.limit + 1}-
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} records
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
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
                    variant="outline"
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
    </div>
  );
}
