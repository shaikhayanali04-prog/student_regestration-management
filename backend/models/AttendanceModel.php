<?php

require_once __DIR__ . '/../helpers/attendance_schema.php';

class AttendanceModel
{
    private PDO $conn;

    private array $statuses = ['Present', 'Absent', 'Late', 'Excused'];

    public function __construct(PDO $conn)
    {
        $this->conn = $conn;
        ensureAttendanceSchema($conn);
    }

    public function getMeta(): array
    {
        $batches = $this->conn
            ->query(
                "SELECT
                    b.id,
                    b.batch_code,
                    b.name,
                    b.status,
                    b.schedule_days,
                    b.start_time,
                    b.end_time,
                    c.name AS course_name,
                    COALESCE(stats.student_count, 0) AS student_count
                 FROM batches b
                 LEFT JOIN courses c ON c.id = b.course_id
                 LEFT JOIN (
                    SELECT batch_id, COUNT(DISTINCT student_id) AS student_count
                    FROM student_course
                    WHERE batch_id IS NOT NULL
                    GROUP BY batch_id
                 ) stats ON stats.batch_id = b.id
                 ORDER BY b.name ASC"
            )
            ->fetchAll(PDO::FETCH_ASSOC);

        return [
            'statuses' => $this->statuses,
            'batches' => array_map(
                fn (array $batch) => $this->transformBatchOption($batch),
                $batches
            ),
        ];
    }

    public function paginate(array $filters): array
    {
        $page = max(1, (int) ($filters['page'] ?? 1));
        $limit = max(1, min(25, (int) ($filters['limit'] ?? 10)));
        $offset = ($page - 1) * $limit;

        [$whereSql, $params] = $this->buildFilters($filters);

        $baseFrom = "
            FROM attendance a
            INNER JOIN students s ON s.id = a.student_id
            INNER JOIN batches b ON b.id = a.batch_id
            LEFT JOIN courses c ON c.id = b.course_id
        ";

        $countStmt = $this->conn->prepare(
            "SELECT COUNT(*) AS total
             {$baseFrom}
             {$whereSql}"
        );
        $countStmt->execute($params);
        $total = (int) ($countStmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);

        $summaryStmt = $this->conn->prepare(
            "SELECT
                COUNT(*) AS total_records,
                COUNT(DISTINCT CONCAT(a.batch_id, '-', a.date)) AS sessions_marked,
                COUNT(DISTINCT a.student_id) AS students_marked,
                SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) AS present_count,
                SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) AS absent_count,
                SUM(CASE WHEN a.status = 'Late' THEN 1 ELSE 0 END) AS late_count,
                SUM(CASE WHEN a.status = 'Excused' THEN 1 ELSE 0 END) AS excused_count
             {$baseFrom}
             {$whereSql}"
        );
        $summaryStmt->execute($params);
        $summary = $summaryStmt->fetch(PDO::FETCH_ASSOC) ?: [];

        $itemsStmt = $this->conn->prepare(
            "SELECT
                a.id,
                a.batch_id,
                a.student_id,
                a.date,
                a.status,
                a.remarks,
                CONCAT_WS(' ', s.first_name, s.last_name) AS full_name,
                s.admission_no,
                s.phone,
                b.batch_code,
                b.name AS batch_name,
                c.name AS course_name
             {$baseFrom}
             {$whereSql}
             ORDER BY a.date DESC, b.name ASC, s.first_name ASC, s.last_name ASC
             LIMIT :limit OFFSET :offset"
        );

        foreach ($params as $key => $value) {
            $itemsStmt->bindValue(':' . $key, $value);
        }
        $itemsStmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $itemsStmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $itemsStmt->execute();

        $items = array_map(
            fn (array $row) => $this->transformHistoryRow($row),
            $itemsStmt->fetchAll(PDO::FETCH_ASSOC)
        );

        $summaryPayload = $this->summaryPayload($summary);

        return [
            'items' => $items,
            'meta' => [
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'total_pages' => max(1, (int) ceil($total / $limit)),
                ],
                'summary' => $summaryPayload,
            ],
        ];
    }

    public function getSheet(int $batchId, string $date): ?array
    {
        $batch = $this->getBatchSheetContext($batchId);
        if (!$batch) {
            return null;
        }

        $rosterStmt = $this->conn->prepare(
            "SELECT
                s.id,
                s.admission_no,
                CONCAT_WS(' ', s.first_name, s.last_name) AS full_name,
                s.phone,
                s.status AS student_status,
                sc.joined_date
             FROM student_course sc
             INNER JOIN students s ON s.id = sc.student_id
             WHERE sc.batch_id = :batch_id
             ORDER BY s.first_name ASC, s.last_name ASC"
        );
        $rosterStmt->execute(['batch_id' => $batchId]);
        $roster = $rosterStmt->fetchAll(PDO::FETCH_ASSOC);

        $existingStmt = $this->conn->prepare(
            "SELECT id, student_id, status, remarks
             FROM attendance
             WHERE batch_id = :batch_id AND date = :date"
        );
        $existingStmt->execute([
            'batch_id' => $batchId,
            'date' => $date,
        ]);

        $existingMap = [];
        $existingRows = [];
        foreach ($existingStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $studentId = (int) $row['student_id'];
            $existingMap[$studentId] = $row;
            $existingRows[] = $row;
        }

        $students = array_map(function (array $student) use ($existingMap) {
            $studentId = (int) $student['id'];
            $existing = $existingMap[$studentId] ?? null;

            return [
                'student_id' => $studentId,
                'student_code' => $student['admission_no'],
                'student_name' => $student['full_name'],
                'phone' => $student['phone'],
                'student_status' => $student['student_status'],
                'joined_date' => $student['joined_date'],
                'attendance_id' => $existing ? (int) $existing['id'] : null,
                'status' => $existing['status'] ?? 'Present',
                'remarks' => $existing['remarks'] ?? '',
                'is_marked' => (bool) $existing,
            ];
        }, $roster);

        return [
            'batch' => $batch,
            'date' => $date,
            'students' => $students,
            'summary' => $this->summaryPayload($this->summariesFromRows($existingRows), count($roster)),
        ];
    }

    public function saveSheet(int $batchId, string $date, array $records): array
    {
        $sheet = $this->getSheet($batchId, $date);
        if (!$sheet) {
            throw new RuntimeException('Batch not found.');
        }

        $rosterIds = array_map(
            static fn (array $student) => (int) $student['student_id'],
            $sheet['students']
        );
        $existingMap = [];
        foreach ($sheet['students'] as $student) {
            if (!empty($student['is_marked'])) {
                $existingMap[(int) $student['student_id']] = true;
            }
        }

        if (!$rosterIds) {
            throw new RuntimeException('This batch does not have any students assigned yet.');
        }

        $allowedIds = array_fill_keys($rosterIds, true);

        $updateStmt = $this->conn->prepare(
            "UPDATE attendance
             SET status = :status, remarks = :remarks
             WHERE batch_id = :batch_id AND student_id = :student_id AND date = :date"
        );

        $insertStmt = $this->conn->prepare(
            "INSERT INTO attendance (batch_id, student_id, date, status, remarks)
             VALUES (:batch_id, :student_id, :date, :status, :remarks)"
        );

        $this->conn->beginTransaction();

        try {
            foreach ($records as $record) {
                $studentId = (int) ($record['student_id'] ?? 0);
                if ($studentId <= 0 || !isset($allowedIds[$studentId])) {
                    throw new InvalidArgumentException('Attendance contains an invalid student selection.');
                }

                $params = [
                    'batch_id' => $batchId,
                    'student_id' => $studentId,
                    'date' => $date,
                    'status' => $record['status'],
                    'remarks' => trim((string) ($record['remarks'] ?? '')) ?: null,
                ];

                if (isset($existingMap[$studentId])) {
                    $updateStmt->execute($params);
                } else {
                    $insertStmt->execute($params);
                }
            }

            $this->conn->commit();
        } catch (Throwable $exception) {
            $this->conn->rollBack();
            throw $exception;
        }

        return $this->getSheet($batchId, $date);
    }

    public function getReport(array $filters): array
    {
        [$whereSql, $params] = $this->buildFilters($filters);

        $baseFrom = "
            FROM attendance a
            INNER JOIN students s ON s.id = a.student_id
            INNER JOIN batches b ON b.id = a.batch_id
            LEFT JOIN courses c ON c.id = b.course_id
        ";

        $summaryStmt = $this->conn->prepare(
            "SELECT
                COUNT(*) AS total_records,
                COUNT(DISTINCT CONCAT(a.batch_id, '-', a.date)) AS sessions_marked,
                COUNT(DISTINCT a.student_id) AS students_marked,
                SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) AS present_count,
                SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) AS absent_count,
                SUM(CASE WHEN a.status = 'Late' THEN 1 ELSE 0 END) AS late_count,
                SUM(CASE WHEN a.status = 'Excused' THEN 1 ELSE 0 END) AS excused_count
             {$baseFrom}
             {$whereSql}"
        );
        $summaryStmt->execute($params);
        $summary = $summaryStmt->fetch(PDO::FETCH_ASSOC) ?: [];

        $todayWhere = $whereSql;
        if ($todayWhere === '') {
            $todayWhere = 'WHERE a.date = CURDATE()';
        } else {
            $todayWhere .= ' AND a.date = CURDATE()';
        }

        $todayStmt = $this->conn->prepare(
            "SELECT
                COUNT(*) AS total_records,
                SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) AS present_count,
                SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) AS absent_count,
                SUM(CASE WHEN a.status = 'Late' THEN 1 ELSE 0 END) AS late_count,
                SUM(CASE WHEN a.status = 'Excused' THEN 1 ELSE 0 END) AS excused_count
             {$baseFrom}
             {$todayWhere}"
        );
        $todayStmt->execute($params);
        $todaySummary = $todayStmt->fetch(PDO::FETCH_ASSOC) ?: [];

        $recentSessionsStmt = $this->conn->prepare(
            "SELECT
                a.date,
                a.batch_id,
                b.name AS batch_name,
                COUNT(*) AS total_records,
                SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) AS present_count,
                SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) AS absent_count,
                SUM(CASE WHEN a.status = 'Late' THEN 1 ELSE 0 END) AS late_count
             {$baseFrom}
             {$whereSql}
             GROUP BY a.date, a.batch_id, b.name
             ORDER BY a.date DESC, b.name ASC
             LIMIT 8"
        );
        $recentSessionsStmt->execute($params);
        $recentSessions = $recentSessionsStmt->fetchAll(PDO::FETCH_ASSOC);

        $lowAttendanceStmt = $this->conn->prepare(
            "SELECT
                a.student_id,
                CONCAT_WS(' ', s.first_name, s.last_name) AS full_name,
                s.admission_no,
                b.name AS batch_name,
                COUNT(*) AS total_sessions,
                SUM(CASE WHEN a.status IN ('Present', 'Late') THEN 1 ELSE 0 END) AS attended_sessions
             {$baseFrom}
             {$whereSql}
             GROUP BY a.student_id, s.first_name, s.last_name, s.admission_no, b.name
             HAVING total_sessions > 0
                AND ((SUM(CASE WHEN a.status IN ('Present', 'Late') THEN 1 ELSE 0 END) / COUNT(*)) * 100) < 75
             ORDER BY ((SUM(CASE WHEN a.status IN ('Present', 'Late') THEN 1 ELSE 0 END) / COUNT(*)) * 100) ASC, total_sessions DESC
             LIMIT 6"
        );
        $lowAttendanceStmt->execute($params);
        $lowAttendance = array_map(
            static function (array $row): array {
                $totalSessions = (int) $row['total_sessions'];
                $attendedSessions = (int) $row['attended_sessions'];

                return [
                    'student_id' => (int) $row['student_id'],
                    'student_code' => $row['admission_no'],
                    'student_name' => $row['full_name'],
                    'batch_name' => $row['batch_name'],
                    'total_sessions' => $totalSessions,
                    'attended_sessions' => $attendedSessions,
                    'attendance_percentage' => $totalSessions > 0
                        ? round(($attendedSessions / $totalSessions) * 100, 1)
                        : 0,
                ];
            },
            $lowAttendanceStmt->fetchAll(PDO::FETCH_ASSOC)
        );

        return [
            'summary' => $this->summaryPayload($summary),
            'today' => $this->summaryPayload($todaySummary),
            'recent_sessions' => array_map(
                fn (array $row) => $this->transformSessionSummary($row),
                $recentSessions
            ),
            'low_attendance_students' => $lowAttendance,
        ];
    }

    private function buildFilters(array $filters): array
    {
        $where = [];
        $params = [];

        $search = trim((string) ($filters['search'] ?? ''));
        if ($search !== '') {
            $where[] = "(CONCAT_WS(' ', s.first_name, s.last_name) LIKE :search
                OR s.admission_no LIKE :search
                OR b.name LIKE :search
                OR c.name LIKE :search)";
            $params['search'] = '%' . $search . '%';
        }

        if (!empty($filters['batch_id'])) {
            $where[] = 'a.batch_id = :batch_id';
            $params['batch_id'] = (int) $filters['batch_id'];
        }

        $status = trim((string) ($filters['status'] ?? ''));
        if ($status !== '') {
            $where[] = 'a.status = :status';
            $params['status'] = $status;
        }

        $dateFrom = trim((string) ($filters['date_from'] ?? ''));
        if ($dateFrom !== '') {
            $where[] = 'a.date >= :date_from';
            $params['date_from'] = $dateFrom;
        }

        $dateTo = trim((string) ($filters['date_to'] ?? ''));
        if ($dateTo !== '') {
            $where[] = 'a.date <= :date_to';
            $params['date_to'] = $dateTo;
        }

        return [$where ? 'WHERE ' . implode(' AND ', $where) : '', $params];
    }

    private function getBatchSheetContext(int $batchId): ?array
    {
        $stmt = $this->conn->prepare(
            "SELECT
                b.id,
                b.batch_code,
                b.name,
                b.schedule_days,
                b.start_time,
                b.end_time,
                c.name AS course_name,
                COALESCE(stats.student_count, 0) AS student_count
             FROM batches b
             LEFT JOIN courses c ON c.id = b.course_id
             LEFT JOIN (
                SELECT batch_id, COUNT(DISTINCT student_id) AS student_count
                FROM student_course
                WHERE batch_id IS NOT NULL
                GROUP BY batch_id
             ) stats ON stats.batch_id = b.id
             WHERE b.id = :batch_id
             LIMIT 1"
        );
        $stmt->execute(['batch_id' => $batchId]);
        $batch = $stmt->fetch(PDO::FETCH_ASSOC);

        return $batch ? $this->transformBatchOption($batch) : null;
    }

    private function transformBatchOption(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'batch_id' => $row['batch_code'] ?? null,
            'batch_name' => $row['name'],
            'course_name' => $row['course_name'] ?? '',
            'student_count' => (int) ($row['student_count'] ?? 0),
            'status' => $row['status'] ?? 'Planned',
            'days_of_week' => $this->daysToArray($row['schedule_days'] ?? ''),
            'timing' => $this->formatTiming($row['start_time'] ?? null, $row['end_time'] ?? null),
        ];
    }

    private function transformHistoryRow(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'date' => $row['date'],
            'status' => $row['status'],
            'remarks' => $row['remarks'] ?? '',
            'student_id' => (int) $row['student_id'],
            'student_code' => $row['admission_no'],
            'student_name' => $row['full_name'],
            'phone' => $row['phone'],
            'batch_id' => (int) $row['batch_id'],
            'batch_code' => $row['batch_code'] ?? null,
            'batch_name' => $row['batch_name'],
            'course_name' => $row['course_name'] ?? '',
        ];
    }

    private function transformSessionSummary(array $row): array
    {
        $summary = $this->summaryPayload($row);

        return [
            'date' => $row['date'],
            'batch_id' => (int) $row['batch_id'],
            'batch_name' => $row['batch_name'],
            'total_records' => $summary['total_records'],
            'present_count' => $summary['present_count'],
            'absent_count' => $summary['absent_count'],
            'late_count' => $summary['late_count'],
            'attendance_percentage' => $summary['attendance_percentage'],
        ];
    }

    private function summariesFromRows(array $rows): array
    {
        $summary = [
            'total_records' => count($rows),
            'present_count' => 0,
            'absent_count' => 0,
            'late_count' => 0,
            'excused_count' => 0,
            'sessions_marked' => count($rows) > 0 ? 1 : 0,
            'students_marked' => count($rows),
        ];

        foreach ($rows as $row) {
            $status = $row['status'] ?? '';
            if ($status === 'Present') {
                $summary['present_count']++;
            } elseif ($status === 'Absent') {
                $summary['absent_count']++;
            } elseif ($status === 'Late') {
                $summary['late_count']++;
            } elseif ($status === 'Excused') {
                $summary['excused_count']++;
            }
        }

        return $summary;
    }

    private function summaryPayload(array $summary, ?int $totalStudents = null): array
    {
        $totalRecords = (int) ($summary['total_records'] ?? 0);
        $presentCount = (int) ($summary['present_count'] ?? 0);
        $lateCount = (int) ($summary['late_count'] ?? 0);
        $denominator = $totalStudents ?? $totalRecords;

        return [
            'total_records' => $totalRecords,
            'sessions_marked' => (int) ($summary['sessions_marked'] ?? 0),
            'students_marked' => (int) ($summary['students_marked'] ?? 0),
            'present_count' => $presentCount,
            'absent_count' => (int) ($summary['absent_count'] ?? 0),
            'late_count' => $lateCount,
            'excused_count' => (int) ($summary['excused_count'] ?? 0),
            'attendance_percentage' => $denominator > 0
                ? round((($presentCount + $lateCount) / $denominator) * 100, 1)
                : 0,
        ];
    }

    private function daysToArray(string $value): array
    {
        if (trim($value) === '') {
            return [];
        }

        return array_values(array_filter(array_map('trim', explode(',', $value))));
    }

    private function formatTiming(?string $startTime, ?string $endTime): ?string
    {
        if (!$startTime && !$endTime) {
            return null;
        }

        if ($startTime && $endTime) {
            return date('g:i A', strtotime($startTime)) . ' - ' . date('g:i A', strtotime($endTime));
        }

        return $startTime ?: $endTime;
    }
}
