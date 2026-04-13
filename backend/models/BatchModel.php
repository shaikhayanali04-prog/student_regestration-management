<?php

require_once __DIR__ . '/../helpers/batch_schema.php';
require_once __DIR__ . '/../helpers/faculty_schema.php';

class BatchModel
{
    private PDO $conn;

    private array $statuses = ['Planned', 'Active', 'Completed'];

    public function __construct(PDO $conn)
    {
        $this->conn = $conn;
        ensureBatchSchema($conn);
        ensureFacultySchema($conn);
    }

    public function getMeta(): array
    {
        $courses = $this->conn
            ->query("SELECT id, course_code, name, mode, status FROM courses ORDER BY name ASC")
            ->fetchAll(PDO::FETCH_ASSOC);

        $faculty = $this->conn
            ->query(
                "SELECT
                    id,
                    faculty_code,
                    full_name,
                    status,
                    subject_specialization
                 FROM faculty
                 ORDER BY full_name ASC"
            )
            ->fetchAll(PDO::FETCH_ASSOC);

        $students = $this->conn
            ->query(
                "SELECT
                    s.id,
                    s.admission_no,
                    CONCAT_WS(' ', s.first_name, s.last_name) AS full_name,
                    s.phone,
                    s.status,
                    sc.course_id,
                    c.name AS course_name,
                    sc.batch_id,
                    b.name AS batch_name
                 FROM student_course sc
                 INNER JOIN (
                    SELECT student_id, MAX(id) AS latest_id
                    FROM student_course
                    GROUP BY student_id
                 ) latest_sc ON latest_sc.latest_id = sc.id
                 INNER JOIN students s ON s.id = sc.student_id
                 LEFT JOIN courses c ON c.id = sc.course_id
                 LEFT JOIN batches b ON b.id = sc.batch_id
                 ORDER BY s.first_name ASC, s.last_name ASC"
            )
            ->fetchAll(PDO::FETCH_ASSOC);

        return [
            'statuses' => $this->statuses,
            'courses' => array_map(
                static fn (array $course) => [
                    'id' => (int) $course['id'],
                    'course_id' => $course['course_code'] ?? null,
                    'course_name' => $course['name'],
                    'mode' => $course['mode'] ?? 'Offline',
                    'status' => $course['status'] ?? 'Active',
                ],
                $courses
            ),
            'faculty' => array_map(
                static fn (array $member) => [
                    'id' => (int) $member['id'],
                    'faculty_id' => $member['faculty_code'],
                    'full_name' => $member['full_name'],
                    'status' => $member['status'] ?? 'Active',
                    'subject_specialization' => array_values(
                        array_filter(
                            array_map('trim', explode(',', (string) ($member['subject_specialization'] ?? ''))),
                            static fn (string $subject): bool => $subject !== ''
                        )
                    ),
                ],
                $faculty
            ),
            'students' => array_map(
                static fn (array $student) => [
                    'id' => (int) $student['id'],
                    'student_id' => $student['admission_no'],
                    'full_name' => $student['full_name'],
                    'phone' => $student['phone'],
                    'status' => $student['status'],
                    'course_id' => $student['course_id'] ? (int) $student['course_id'] : null,
                    'course_name' => $student['course_name'],
                    'batch_id' => $student['batch_id'] ? (int) $student['batch_id'] : null,
                    'batch_name' => $student['batch_name'],
                ],
                $students
            ),
        ];
    }

    public function paginate(array $filters): array
    {
        $page = max(1, (int) ($filters['page'] ?? 1));
        $limit = max(1, min(25, (int) ($filters['limit'] ?? 8)));
        $offset = ($page - 1) * $limit;

        [$whereSql, $params] = $this->buildFilters($filters);
        $statsJoin = $this->statsJoinSql();

        $countStmt = $this->conn->prepare(
            "SELECT COUNT(*) AS total
             FROM batches b
             LEFT JOIN courses c ON c.id = b.course_id
             LEFT JOIN faculty f ON f.id = b.faculty_id
             {$whereSql}"
        );
        $countStmt->execute($params);
        $total = (int) ($countStmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);

        $summaryStmt = $this->conn->prepare(
            "SELECT
                COUNT(*) AS total_batches,
                SUM(CASE WHEN b.status = 'Active' THEN 1 ELSE 0 END) AS active_batches,
                SUM(CASE WHEN b.status = 'Planned' THEN 1 ELSE 0 END) AS planned_batches,
                COALESCE(SUM(stats.student_count), 0) AS assigned_students
             FROM batches b
             LEFT JOIN courses c ON c.id = b.course_id
             LEFT JOIN faculty f ON f.id = b.faculty_id
             {$statsJoin}
             {$whereSql}"
        );
        $summaryStmt->execute($params);
        $summary = $summaryStmt->fetch(PDO::FETCH_ASSOC) ?: [];

        $itemsStmt = $this->conn->prepare(
            "SELECT
                b.id,
                b.batch_code,
                b.course_id,
                b.faculty_id,
                b.name,
                COALESCE(f.full_name, b.faculty_name) AS faculty_name,
                b.start_date,
                b.end_date,
                b.schedule_days,
                b.start_time,
                b.end_time,
                b.room,
                b.capacity,
                b.status,
                b.created_at,
                c.name AS course_name,
                COALESCE(stats.student_count, 0) AS student_count
             FROM batches b
             LEFT JOIN courses c ON c.id = b.course_id
             LEFT JOIN faculty f ON f.id = b.faculty_id
             {$statsJoin}
             {$whereSql}
             ORDER BY COALESCE(b.start_date, DATE(b.created_at)) DESC, b.id DESC
             LIMIT :limit OFFSET :offset"
        );

        foreach ($params as $key => $value) {
            $itemsStmt->bindValue(':' . $key, $value);
        }
        $itemsStmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $itemsStmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $itemsStmt->execute();

        $items = array_map(
            fn (array $row) => $this->transformBatch($row),
            $itemsStmt->fetchAll(PDO::FETCH_ASSOC)
        );

        return [
            'items' => $items,
            'meta' => [
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'total_pages' => max(1, $limit > 0 ? (int) ceil($total / $limit) : 1),
                ],
                'summary' => [
                    'total_batches' => (int) ($summary['total_batches'] ?? 0),
                    'active_batches' => (int) ($summary['active_batches'] ?? 0),
                    'planned_batches' => (int) ($summary['planned_batches'] ?? 0),
                    'assigned_students' => (int) ($summary['assigned_students'] ?? 0),
                ],
            ],
        ];
    }

    public function find(int $batchId): ?array
    {
        $stmt = $this->conn->prepare(
            "SELECT
                b.id,
                b.batch_code,
                b.course_id,
                b.faculty_id,
                b.name,
                COALESCE(f.full_name, b.faculty_name) AS faculty_name,
                b.start_date,
                b.end_date,
                b.schedule_days,
                b.start_time,
                b.end_time,
                b.room,
                b.capacity,
                b.status,
                b.created_at,
                c.name AS course_name,
                COALESCE(stats.student_count, 0) AS student_count
             FROM batches b
             LEFT JOIN courses c ON c.id = b.course_id
             LEFT JOIN faculty f ON f.id = b.faculty_id
             {$this->statsJoinSql()}
             WHERE b.id = :batch_id
             LIMIT 1"
        );
        $stmt->execute(['batch_id' => $batchId]);
        $batch = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$batch) {
            return null;
        }

        $studentsStmt = $this->conn->prepare(
            "SELECT
                s.id,
                s.admission_no,
                CONCAT_WS(' ', s.first_name, s.last_name) AS full_name,
                s.phone,
                s.status,
                sc.joined_date
             FROM student_course sc
             INNER JOIN students s ON s.id = sc.student_id
             WHERE sc.batch_id = :batch_id
             ORDER BY s.first_name ASC, s.last_name ASC"
        );
        $studentsStmt->execute(['batch_id' => $batchId]);
        $students = $studentsStmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'batch' => $this->transformBatch($batch),
            'students' => array_map(
                static fn (array $student) => [
                    'id' => (int) $student['id'],
                    'student_id' => $student['admission_no'],
                    'full_name' => $student['full_name'],
                    'phone' => $student['phone'],
                    'status' => $student['status'],
                    'joined_date' => $student['joined_date'],
                ],
                $students
            ),
        ];
    }

    public function create(array $payload): array
    {
        $batchCode = $payload['batch_id'] ?: $this->generateBatchCode();
        $facultyAssignment = $this->resolveFacultyAssignment(
            $payload['faculty_id'] ?? null,
            $payload['faculty_name'] ?? null
        );

        $this->conn->beginTransaction();

        try {
            $stmt = $this->conn->prepare(
                "INSERT INTO batches (
                    batch_code,
                    course_id,
                    faculty_id,
                    name,
                    faculty_name,
                    start_date,
                    end_date,
                    schedule_days,
                    start_time,
                    end_time,
                    room,
                    capacity,
                    status
                 ) VALUES (
                    :batch_code,
                    :course_id,
                    :faculty_id,
                    :name,
                    :faculty_name,
                    :start_date,
                    :end_date,
                    :schedule_days,
                    :start_time,
                    :end_time,
                    :room,
                    :capacity,
                    :status
                 )"
            );

            $stmt->execute([
                'batch_code' => $batchCode,
                'course_id' => $payload['course_id'],
                'faculty_id' => $facultyAssignment['faculty_id'],
                'name' => $payload['batch_name'],
                'faculty_name' => $facultyAssignment['faculty_name'],
                'start_date' => $payload['start_date'],
                'end_date' => $payload['end_date'],
                'schedule_days' => $this->daysToString($payload['days_of_week']),
                'start_time' => $payload['start_time'],
                'end_time' => $payload['end_time'],
                'room' => $payload['room'],
                'capacity' => $payload['capacity'],
                'status' => $payload['status'],
            ]);

            $batchId = (int) $this->conn->lastInsertId();
            $this->syncAssignments($batchId, $payload['course_id'], $payload['assigned_student_ids']);

            $this->conn->commit();

            return $this->find($batchId);
        } catch (Throwable $exception) {
            $this->conn->rollBack();
            throw $exception;
        }
    }

    public function update(int $batchId, array $payload): array
    {
        if (!$this->find($batchId)) {
            throw new RuntimeException('Batch not found.');
        }

        $facultyAssignment = $this->resolveFacultyAssignment(
            $payload['faculty_id'] ?? null,
            $payload['faculty_name'] ?? null
        );

        $this->conn->beginTransaction();

        try {
            $stmt = $this->conn->prepare(
                "UPDATE batches
                 SET
                    batch_code = :batch_code,
                    course_id = :course_id,
                    faculty_id = :faculty_id,
                    name = :name,
                    faculty_name = :faculty_name,
                    start_date = :start_date,
                    end_date = :end_date,
                    schedule_days = :schedule_days,
                    start_time = :start_time,
                    end_time = :end_time,
                    room = :room,
                    capacity = :capacity,
                    status = :status
                 WHERE id = :batch_id"
            );

            $stmt->execute([
                'batch_code' => $payload['batch_id'],
                'course_id' => $payload['course_id'],
                'faculty_id' => $facultyAssignment['faculty_id'],
                'name' => $payload['batch_name'],
                'faculty_name' => $facultyAssignment['faculty_name'],
                'start_date' => $payload['start_date'],
                'end_date' => $payload['end_date'],
                'schedule_days' => $this->daysToString($payload['days_of_week']),
                'start_time' => $payload['start_time'],
                'end_time' => $payload['end_time'],
                'room' => $payload['room'],
                'capacity' => $payload['capacity'],
                'status' => $payload['status'],
                'batch_id' => $batchId,
            ]);

            $this->syncAssignments($batchId, $payload['course_id'], $payload['assigned_student_ids']);

            $this->conn->commit();

            return $this->find($batchId);
        } catch (Throwable $exception) {
            $this->conn->rollBack();
            throw $exception;
        }
    }

    public function delete(int $batchId): void
    {
        if (!$this->find($batchId)) {
            throw new RuntimeException('Batch not found.');
        }

        $this->conn->beginTransaction();

        try {
            $clearAssignments = $this->conn->prepare(
                "UPDATE student_course SET batch_id = NULL WHERE batch_id = :batch_id"
            );
            $clearAssignments->execute(['batch_id' => $batchId]);

            $stmt = $this->conn->prepare("DELETE FROM batches WHERE id = :batch_id");
            $stmt->execute(['batch_id' => $batchId]);

            $this->conn->commit();
        } catch (Throwable $exception) {
            $this->conn->rollBack();
            throw $exception;
        }
    }

    private function buildFilters(array $filters): array
    {
        $where = [];
        $params = [];

        $search = trim((string) ($filters['search'] ?? ''));
        if ($search !== '') {
            $where[] = "(b.name LIKE :search OR b.batch_code LIKE :search OR COALESCE(f.full_name, b.faculty_name) LIKE :search OR c.name LIKE :search OR b.room LIKE :search)";
            $params['search'] = '%' . $search . '%';
        }

        $status = trim((string) ($filters['status'] ?? ''));
        if ($status !== '') {
            $where[] = "b.status = :status";
            $params['status'] = $status;
        }

        if (!empty($filters['course_id'])) {
            $where[] = "b.course_id = :course_id";
            $params['course_id'] = (int) $filters['course_id'];
        }

        return [$where ? 'WHERE ' . implode(' AND ', $where) : '', $params];
    }

    private function statsJoinSql(): string
    {
        return "
            LEFT JOIN (
                SELECT
                    batch_id,
                    COUNT(DISTINCT student_id) AS student_count
                FROM student_course
                WHERE batch_id IS NOT NULL
                GROUP BY batch_id
            ) stats ON stats.batch_id = b.id
        ";
    }

    private function transformBatch(array $row): array
    {
        $studentCount = (int) ($row['student_count'] ?? 0);
        $capacity = $row['capacity'] !== null ? (int) $row['capacity'] : null;

        return [
            'id' => (int) $row['id'],
            'batch_id' => $row['batch_code'],
            'batch_name' => $row['name'],
            'course_id' => (int) $row['course_id'],
            'course_name' => $row['course_name'] ?? '',
            'faculty_id' => !empty($row['faculty_id']) ? (int) $row['faculty_id'] : null,
            'faculty_name' => $row['faculty_name'] ?? '',
            'start_date' => $row['start_date'] ?? null,
            'end_date' => $row['end_date'] ?? null,
            'days_of_week' => $this->daysToArray($row['schedule_days'] ?? ''),
            'start_time' => $row['start_time'] ?? null,
            'end_time' => $row['end_time'] ?? null,
            'timing' => $this->formatTiming($row['start_time'] ?? null, $row['end_time'] ?? null),
            'room' => $row['room'] ?? '',
            'capacity' => $capacity,
            'student_count' => $studentCount,
            'available_seats' => $capacity !== null ? max($capacity - $studentCount, 0) : null,
            'status' => $row['status'] ?? 'Planned',
            'created_at' => $row['created_at'] ?? null,
        ];
    }

    private function generateBatchCode(): string
    {
        $year = date('Y');
        $prefix = 'BAT-' . $year . '-';
        $stmt = $this->conn->prepare(
            "SELECT batch_code
             FROM batches
             WHERE batch_code LIKE :prefix
             ORDER BY id DESC
             LIMIT 1"
        );
        $stmt->execute(['prefix' => $prefix . '%']);
        $lastCode = $stmt->fetchColumn();

        $nextNumber = 1;
        if ($lastCode && preg_match('/(\d+)$/', (string) $lastCode, $matches)) {
            $nextNumber = ((int) $matches[1]) + 1;
        }

        return $prefix . str_pad((string) $nextNumber, 3, '0', STR_PAD_LEFT);
    }

    private function syncAssignments(int $batchId, int $courseId, array $studentIds): void
    {
        $studentIds = array_values(array_unique(array_map('intval', $studentIds)));

        $clearStmt = $this->conn->prepare(
            "UPDATE student_course
             SET batch_id = NULL
             WHERE batch_id = :batch_id AND course_id = :course_id"
        );
        $clearStmt->execute([
            'batch_id' => $batchId,
            'course_id' => $courseId,
        ]);

        if (!$studentIds) {
            return;
        }

        $placeholders = [];
        $params = [
            'batch_id' => $batchId,
            'course_id' => $courseId,
        ];

        foreach ($studentIds as $index => $studentId) {
            $placeholder = 'student_' . $index;
            $placeholders[] = ':' . $placeholder;
            $params[$placeholder] = $studentId;
        }

        $sql = "UPDATE student_course
                SET batch_id = :batch_id
                WHERE course_id = :course_id
                  AND student_id IN (" . implode(', ', $placeholders) . ")";

        $assignStmt = $this->conn->prepare($sql);
        $assignStmt->execute($params);
    }

    private function resolveFacultyAssignment(?int $facultyId, ?string $facultyName): array
    {
        if ($facultyId && $facultyId > 0) {
            $stmt = $this->conn->prepare(
                "SELECT full_name
                 FROM faculty
                 WHERE id = :faculty_id
                 LIMIT 1"
            );
            $stmt->execute(['faculty_id' => $facultyId]);
            $name = $stmt->fetchColumn();

            if (!$name) {
                throw new RuntimeException('Selected faculty member was not found.');
            }

            return [
                'faculty_id' => $facultyId,
                'faculty_name' => (string) $name,
            ];
        }

        $name = trim((string) ($facultyName ?? ''));

        return [
            'faculty_id' => null,
            'faculty_name' => $name !== '' ? $name : null,
        ];
    }

    private function daysToString(array $days): string
    {
        $days = array_map('trim', $days);
        $days = array_values(array_filter($days, static fn (string $day) => $day !== ''));

        return implode(', ', $days);
    }

    private function daysToArray(string $days): array
    {
        $items = array_map('trim', explode(',', $days));
        return array_values(array_filter($items, static fn (string $day) => $day !== ''));
    }

    private function formatTiming(?string $startTime, ?string $endTime): ?string
    {
        if (!$startTime && !$endTime) {
            return null;
        }

        if ($startTime && $endTime) {
            return substr($startTime, 0, 5) . ' - ' . substr($endTime, 0, 5);
        }

        return $startTime ? substr($startTime, 0, 5) : substr((string) $endTime, 0, 5);
    }
}
