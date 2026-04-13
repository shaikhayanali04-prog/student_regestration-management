<?php

require_once __DIR__ . '/../helpers/faculty_schema.php';

class FacultyModel
{
    private PDO $conn;

    private array $statuses = ['Active', 'Inactive'];

    public function __construct(PDO $conn)
    {
        $this->conn = $conn;
        ensureFacultySchema($conn);
    }

    public function getMeta(): array
    {
        $batches = $this->conn->query(
            "SELECT
                b.id,
                b.batch_code,
                b.name AS batch_name,
                b.status,
                c.name AS course_name,
                COALESCE(assigned.full_name, b.faculty_name) AS assigned_faculty_name,
                b.faculty_id,
                COALESCE(stats.student_count, 0) AS student_count,
                b.start_time,
                b.end_time
             FROM batches b
             LEFT JOIN courses c ON c.id = b.course_id
             LEFT JOIN faculty assigned ON assigned.id = b.faculty_id
             LEFT JOIN (
                SELECT
                    batch_id,
                    COUNT(DISTINCT student_id) AS student_count
                FROM student_course
                WHERE batch_id IS NOT NULL
                GROUP BY batch_id
             ) stats ON stats.batch_id = b.id
             ORDER BY COALESCE(b.start_date, DATE(b.created_at)) DESC, b.id DESC"
        )->fetchAll(PDO::FETCH_ASSOC);

        return [
            'statuses' => $this->statuses,
            'batches' => array_map(
                fn (array $batch): array => [
                    'id' => (int) $batch['id'],
                    'batch_id' => $batch['batch_code'],
                    'batch_name' => $batch['batch_name'],
                    'course_name' => $batch['course_name'] ?? 'Unassigned',
                    'status' => $batch['status'] ?? 'Planned',
                    'faculty_id' => $batch['faculty_id'] ? (int) $batch['faculty_id'] : null,
                    'assigned_faculty_name' => $batch['assigned_faculty_name'] ?? null,
                    'student_count' => (int) ($batch['student_count'] ?? 0),
                    'timing' => $this->formatTiming($batch['start_time'] ?? null, $batch['end_time'] ?? null),
                ],
                $batches
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
             FROM faculty f
             {$whereSql}"
        );
        $countStmt->execute($params);
        $total = (int) ($countStmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);

        $summaryStmt = $this->conn->prepare(
            "SELECT
                COUNT(*) AS total_faculty,
                SUM(CASE WHEN f.status = 'Active' THEN 1 ELSE 0 END) AS active_faculty,
                SUM(CASE WHEN f.status = 'Inactive' THEN 1 ELSE 0 END) AS inactive_faculty,
                COALESCE(SUM(stats.batch_count), 0) AS assigned_batches,
                COALESCE(SUM(stats.student_count), 0) AS student_coverage
             FROM faculty f
             {$statsJoin}
             {$whereSql}"
        );
        $summaryStmt->execute($params);
        $summary = $summaryStmt->fetch(PDO::FETCH_ASSOC) ?: [];

        $itemsStmt = $this->conn->prepare(
            "SELECT
                f.id,
                f.faculty_code,
                f.full_name,
                f.email,
                f.phone,
                f.subject_specialization,
                f.joining_date,
                f.status,
                f.notes,
                f.created_at,
                COALESCE(stats.batch_count, 0) AS batch_count,
                COALESCE(stats.active_batch_count, 0) AS active_batch_count,
                COALESCE(stats.student_count, 0) AS student_count
             FROM faculty f
             {$statsJoin}
             {$whereSql}
             ORDER BY COALESCE(f.joining_date, DATE(f.created_at)) DESC, f.id DESC
             LIMIT :limit OFFSET :offset"
        );

        foreach ($params as $key => $value) {
            $itemsStmt->bindValue(':' . $key, $value);
        }
        $itemsStmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $itemsStmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $itemsStmt->execute();

        $items = array_map(
            fn (array $row): array => $this->transformFaculty($row),
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
                    'total_faculty' => (int) ($summary['total_faculty'] ?? 0),
                    'active_faculty' => (int) ($summary['active_faculty'] ?? 0),
                    'inactive_faculty' => (int) ($summary['inactive_faculty'] ?? 0),
                    'assigned_batches' => (int) ($summary['assigned_batches'] ?? 0),
                    'student_coverage' => (int) ($summary['student_coverage'] ?? 0),
                ],
            ],
        ];
    }

    public function find(int $facultyId): ?array
    {
        $stmt = $this->conn->prepare(
            "SELECT
                f.id,
                f.faculty_code,
                f.full_name,
                f.email,
                f.phone,
                f.subject_specialization,
                f.joining_date,
                f.status,
                f.notes,
                f.created_at,
                COALESCE(stats.batch_count, 0) AS batch_count,
                COALESCE(stats.active_batch_count, 0) AS active_batch_count,
                COALESCE(stats.student_count, 0) AS student_count
             FROM faculty f
             {$this->statsJoinSql()}
             WHERE f.id = :faculty_id
             LIMIT 1"
        );
        $stmt->execute(['faculty_id' => $facultyId]);
        $faculty = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$faculty) {
            return null;
        }

        $batchesStmt = $this->conn->prepare(
            "SELECT
                b.id,
                b.batch_code,
                b.name AS batch_name,
                b.status,
                b.schedule_days,
                b.start_time,
                b.end_time,
                b.start_date,
                b.end_date,
                b.room,
                c.name AS course_name,
                COUNT(DISTINCT sc.student_id) AS student_count
             FROM batches b
             LEFT JOIN courses c ON c.id = b.course_id
             LEFT JOIN student_course sc ON sc.batch_id = b.id
             WHERE b.faculty_id = :faculty_id
             GROUP BY b.id
             ORDER BY COALESCE(b.start_date, DATE(b.created_at)) DESC, b.id DESC"
        );
        $batchesStmt->execute(['faculty_id' => $facultyId]);
        $batches = $batchesStmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'faculty' => $this->transformFaculty($faculty),
            'batches' => array_map(
                fn (array $batch): array => [
                    'id' => (int) $batch['id'],
                    'batch_id' => $batch['batch_code'],
                    'batch_name' => $batch['batch_name'],
                    'course_name' => $batch['course_name'] ?? 'Unassigned',
                    'status' => $batch['status'] ?? 'Planned',
                    'days_of_week' => $this->subjectsToArray($batch['schedule_days'] ?? ''),
                    'timing' => $this->formatTiming($batch['start_time'] ?? null, $batch['end_time'] ?? null),
                    'start_date' => $batch['start_date'] ?? null,
                    'end_date' => $batch['end_date'] ?? null,
                    'room' => $batch['room'] ?? null,
                    'student_count' => (int) ($batch['student_count'] ?? 0),
                ],
                $batches
            ),
        ];
    }

    public function create(array $payload): array
    {
        $facultyCode = $payload['faculty_id'] ?: $this->generateFacultyCode();

        $this->conn->beginTransaction();

        try {
            $stmt = $this->conn->prepare(
                "INSERT INTO faculty (
                    faculty_code,
                    full_name,
                    email,
                    phone,
                    subject_specialization,
                    joining_date,
                    status,
                    notes
                 ) VALUES (
                    :faculty_code,
                    :full_name,
                    :email,
                    :phone,
                    :subject_specialization,
                    :joining_date,
                    :status,
                    :notes
                 )"
            );

            $stmt->execute([
                'faculty_code' => $facultyCode,
                'full_name' => $payload['full_name'],
                'email' => $payload['email'],
                'phone' => $payload['phone'],
                'subject_specialization' => $this->subjectsToString($payload['subject_specialization']),
                'joining_date' => $payload['joining_date'],
                'status' => $payload['status'],
                'notes' => $payload['notes'],
            ]);

            $facultyId = (int) $this->conn->lastInsertId();
            $this->syncAssignments($facultyId, $payload['full_name'], $payload['assigned_batch_ids']);

            $this->conn->commit();

            return $this->find($facultyId);
        } catch (Throwable $exception) {
            $this->conn->rollBack();
            throw $exception;
        }
    }

    public function update(int $facultyId, array $payload): array
    {
        if (!$this->find($facultyId)) {
            throw new RuntimeException('Faculty member not found.');
        }

        $this->conn->beginTransaction();

        try {
            $stmt = $this->conn->prepare(
                "UPDATE faculty
                 SET
                    faculty_code = :faculty_code,
                    full_name = :full_name,
                    email = :email,
                    phone = :phone,
                    subject_specialization = :subject_specialization,
                    joining_date = :joining_date,
                    status = :status,
                    notes = :notes
                 WHERE id = :faculty_id"
            );

            $stmt->execute([
                'faculty_code' => $payload['faculty_id'],
                'full_name' => $payload['full_name'],
                'email' => $payload['email'],
                'phone' => $payload['phone'],
                'subject_specialization' => $this->subjectsToString($payload['subject_specialization']),
                'joining_date' => $payload['joining_date'],
                'status' => $payload['status'],
                'notes' => $payload['notes'],
                'faculty_id' => $facultyId,
            ]);

            $this->syncAssignments($facultyId, $payload['full_name'], $payload['assigned_batch_ids']);

            $this->conn->commit();

            return $this->find($facultyId);
        } catch (Throwable $exception) {
            $this->conn->rollBack();
            throw $exception;
        }
    }

    public function delete(int $facultyId): void
    {
        if (!$this->find($facultyId)) {
            throw new RuntimeException('Faculty member not found.');
        }

        $this->conn->beginTransaction();

        try {
            $clearStmt = $this->conn->prepare(
                "UPDATE batches
                 SET faculty_id = NULL, faculty_name = NULL
                 WHERE faculty_id = :faculty_id"
            );
            $clearStmt->execute(['faculty_id' => $facultyId]);

            $deleteStmt = $this->conn->prepare(
                "DELETE FROM faculty
                 WHERE id = :faculty_id"
            );
            $deleteStmt->execute(['faculty_id' => $facultyId]);

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
            $where[] = "(f.full_name LIKE :search OR f.faculty_code LIKE :search OR f.email LIKE :search OR f.phone LIKE :search OR f.subject_specialization LIKE :search)";
            $params['search'] = '%' . $search . '%';
        }

        $status = trim((string) ($filters['status'] ?? ''));
        if ($status !== '') {
            $where[] = "f.status = :status";
            $params['status'] = $status;
        }

        return [$where ? 'WHERE ' . implode(' AND ', $where) : '', $params];
    }

    private function statsJoinSql(): string
    {
        return "
            LEFT JOIN (
                SELECT
                    b.faculty_id,
                    COUNT(DISTINCT b.id) AS batch_count,
                    COUNT(DISTINCT CASE WHEN b.status = 'Active' THEN b.id END) AS active_batch_count,
                    COUNT(DISTINCT sc.student_id) AS student_count
                FROM batches b
                LEFT JOIN student_course sc ON sc.batch_id = b.id
                WHERE b.faculty_id IS NOT NULL
                GROUP BY b.faculty_id
            ) stats ON stats.faculty_id = f.id
        ";
    }

    private function transformFaculty(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'faculty_id' => $row['faculty_code'],
            'full_name' => $row['full_name'],
            'email' => $row['email'] ?? '',
            'phone' => $row['phone'] ?? '',
            'subject_specialization' => $this->subjectsToArray($row['subject_specialization'] ?? ''),
            'joining_date' => $row['joining_date'] ?? null,
            'status' => $row['status'] ?? 'Active',
            'notes' => $row['notes'] ?? '',
            'assigned_batches_count' => (int) ($row['batch_count'] ?? 0),
            'active_batches_count' => (int) ($row['active_batch_count'] ?? 0),
            'student_coverage' => (int) ($row['student_count'] ?? 0),
            'created_at' => $row['created_at'] ?? null,
        ];
    }

    private function generateFacultyCode(): string
    {
        $year = date('Y');
        $prefix = 'FAC-' . $year . '-';
        $stmt = $this->conn->prepare(
            "SELECT faculty_code
             FROM faculty
             WHERE faculty_code LIKE :prefix
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

    private function syncAssignments(int $facultyId, string $fullName, array $batchIds): void
    {
        $batchIds = array_values(array_unique(array_map('intval', $batchIds)));

        $clearStmt = $this->conn->prepare(
            "UPDATE batches
             SET faculty_id = NULL, faculty_name = NULL
             WHERE faculty_id = :faculty_id"
        );
        $clearStmt->execute(['faculty_id' => $facultyId]);

        if (!$batchIds) {
            return;
        }

        $placeholders = [];
        $params = [
            'faculty_id' => $facultyId,
            'faculty_name' => $fullName,
        ];

        foreach ($batchIds as $index => $batchId) {
            $key = 'batch_' . $index;
            $placeholders[] = ':' . $key;
            $params[$key] = $batchId;
        }

        $sql = "UPDATE batches
                SET faculty_id = :faculty_id, faculty_name = :faculty_name
                WHERE id IN (" . implode(', ', $placeholders) . ")";

        $assignStmt = $this->conn->prepare($sql);
        $assignStmt->execute($params);
    }

    private function subjectsToArray(string $subjects): array
    {
        $items = array_map('trim', explode(',', $subjects));
        return array_values(array_filter($items, static fn (string $subject): bool => $subject !== ''));
    }

    private function subjectsToString(array $subjects): string
    {
        $items = array_map(
            static fn (string $subject): string => trim($subject),
            $subjects
        );
        $items = array_values(array_filter($items, static fn (string $subject): bool => $subject !== ''));

        return implode(', ', $items);
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
