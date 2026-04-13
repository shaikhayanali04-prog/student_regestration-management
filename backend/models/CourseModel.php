<?php

require_once __DIR__ . '/../helpers/course_schema.php';

class CourseModel
{
    private PDO $conn;

    private array $statuses = ['Active', 'Inactive'];

    private array $modes = ['Online', 'Offline', 'Hybrid'];

    public function __construct(PDO $conn)
    {
        $this->conn = $conn;
        ensureCourseSchema($conn);
    }

    public function getMeta(): array
    {
        return [
            'statuses' => $this->statuses,
            'modes' => $this->modes,
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
             FROM courses c
             {$whereSql}"
        );
        $countStmt->execute($params);
        $total = (int) ($countStmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);

        $summaryStmt = $this->conn->prepare(
            "SELECT
                COUNT(*) AS total_courses,
                SUM(CASE WHEN c.status = 'Active' THEN 1 ELSE 0 END) AS active_courses,
                SUM(CASE WHEN c.status = 'Inactive' THEN 1 ELSE 0 END) AS inactive_courses,
                COALESCE(SUM(stats.batch_count), 0) AS total_batches,
                COALESCE(SUM(stats.enrolled_students), 0) AS enrolled_students
             FROM courses c
             {$statsJoin}
             {$whereSql}"
        );
        $summaryStmt->execute($params);
        $summary = $summaryStmt->fetch(PDO::FETCH_ASSOC) ?: [];

        $itemsStmt = $this->conn->prepare(
            "SELECT
                c.id,
                c.course_code,
                c.name,
                c.description,
                c.duration_months,
                c.default_fee,
                c.mode,
                c.subjects,
                c.status,
                c.created_at,
                COALESCE(stats.batch_count, 0) AS batch_count,
                COALESCE(stats.active_batch_count, 0) AS active_batch_count,
                COALESCE(stats.enrolled_students, 0) AS enrolled_students
             FROM courses c
             {$statsJoin}
             {$whereSql}
             ORDER BY c.created_at DESC, c.id DESC
             LIMIT :limit OFFSET :offset"
        );

        foreach ($params as $key => $value) {
            $itemsStmt->bindValue(':' . $key, $value);
        }
        $itemsStmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $itemsStmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $itemsStmt->execute();

        $items = array_map(
            fn (array $row) => $this->transformCourse($row),
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
                    'total_courses' => (int) ($summary['total_courses'] ?? 0),
                    'active_courses' => (int) ($summary['active_courses'] ?? 0),
                    'inactive_courses' => (int) ($summary['inactive_courses'] ?? 0),
                    'total_batches' => (int) ($summary['total_batches'] ?? 0),
                    'enrolled_students' => (int) ($summary['enrolled_students'] ?? 0),
                ],
            ],
        ];
    }

    public function find(int $courseId): ?array
    {
        $stmt = $this->conn->prepare(
            "SELECT
                c.id,
                c.course_code,
                c.name,
                c.description,
                c.duration_months,
                c.default_fee,
                c.mode,
                c.subjects,
                c.status,
                c.created_at,
                COALESCE(stats.batch_count, 0) AS batch_count,
                COALESCE(stats.active_batch_count, 0) AS active_batch_count,
                COALESCE(stats.enrolled_students, 0) AS enrolled_students
             FROM courses c
             {$this->statsJoinSql()}
             WHERE c.id = :course_id
             LIMIT 1"
        );
        $stmt->execute(['course_id' => $courseId]);
        $course = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$course) {
            return null;
        }

        $batchesStmt = $this->conn->prepare(
            "SELECT
                b.id,
                b.name,
                b.status,
                b.schedule_days,
                b.start_time,
                b.end_time,
                COUNT(DISTINCT sc.student_id) AS student_count
             FROM batches b
             LEFT JOIN student_course sc ON sc.batch_id = b.id
             WHERE b.course_id = :course_id
             GROUP BY b.id
             ORDER BY b.created_at DESC, b.id DESC"
        );
        $batchesStmt->execute(['course_id' => $courseId]);
        $batches = $batchesStmt->fetchAll(PDO::FETCH_ASSOC);

        $studentsStmt = $this->conn->prepare(
            "SELECT
                s.id,
                s.admission_no,
                CONCAT_WS(' ', s.first_name, s.last_name) AS full_name,
                s.status
             FROM student_course sc
             INNER JOIN students s ON s.id = sc.student_id
             WHERE sc.course_id = :course_id
             ORDER BY sc.created_at DESC, sc.id DESC
             LIMIT 8"
        );
        $studentsStmt->execute(['course_id' => $courseId]);
        $recentStudents = $studentsStmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'course' => $this->transformCourse($course),
            'batches' => array_map(
                static fn (array $batch) => [
                    'id' => (int) $batch['id'],
                    'batch_name' => $batch['name'],
                    'status' => $batch['status'],
                    'schedule_days' => $batch['schedule_days'],
                    'start_time' => $batch['start_time'],
                    'end_time' => $batch['end_time'],
                    'student_count' => (int) $batch['student_count'],
                ],
                $batches
            ),
            'recent_students' => array_map(
                static fn (array $student) => [
                    'id' => (int) $student['id'],
                    'student_id' => $student['admission_no'],
                    'full_name' => $student['full_name'],
                    'status' => $student['status'],
                ],
                $recentStudents
            ),
        ];
    }

    public function create(array $payload): array
    {
        $courseCode = $payload['course_id'] ?: $this->generateCourseCode();
        $stmt = $this->conn->prepare(
            "INSERT INTO courses (
                course_code,
                name,
                description,
                duration_months,
                default_fee,
                mode,
                subjects,
                status
             ) VALUES (
                :course_code,
                :name,
                :description,
                :duration_months,
                :default_fee,
                :mode,
                :subjects,
                :status
             )"
        );

        $stmt->execute([
            'course_code' => $courseCode,
            'name' => $payload['course_name'],
            'description' => $payload['description'],
            'duration_months' => $payload['duration_months'],
            'default_fee' => $payload['fee_amount'],
            'mode' => $payload['mode'],
            'subjects' => $this->subjectsToString($payload['subjects']),
            'status' => $payload['status'],
        ]);

        return $this->find((int) $this->conn->lastInsertId());
    }

    public function update(int $courseId, array $payload): array
    {
        if (!$this->find($courseId)) {
            throw new RuntimeException('Course not found.');
        }

        $stmt = $this->conn->prepare(
            "UPDATE courses
             SET
                course_code = :course_code,
                name = :name,
                description = :description,
                duration_months = :duration_months,
                default_fee = :default_fee,
                mode = :mode,
                subjects = :subjects,
                status = :status
             WHERE id = :course_id"
        );

        $stmt->execute([
            'course_code' => $payload['course_id'],
            'name' => $payload['course_name'],
            'description' => $payload['description'],
            'duration_months' => $payload['duration_months'],
            'default_fee' => $payload['fee_amount'],
            'mode' => $payload['mode'],
            'subjects' => $this->subjectsToString($payload['subjects']),
            'status' => $payload['status'],
            'course_id' => $courseId,
        ]);

        return $this->find($courseId);
    }

    public function delete(int $courseId): void
    {
        if (!$this->find($courseId)) {
            throw new RuntimeException('Course not found.');
        }

        $stmt = $this->conn->prepare("DELETE FROM courses WHERE id = :course_id");
        $stmt->execute(['course_id' => $courseId]);
    }

    private function buildFilters(array $filters): array
    {
        $where = [];
        $params = [];

        $search = trim((string) ($filters['search'] ?? ''));
        if ($search !== '') {
            $where[] = "(c.name LIKE :search OR c.course_code LIKE :search OR c.description LIKE :search OR c.subjects LIKE :search)";
            $params['search'] = '%' . $search . '%';
        }

        $status = trim((string) ($filters['status'] ?? ''));
        if ($status !== '') {
            $where[] = "c.status = :status";
            $params['status'] = $status;
        }

        $mode = trim((string) ($filters['mode'] ?? ''));
        if ($mode !== '') {
            $where[] = "c.mode = :mode";
            $params['mode'] = $mode;
        }

        return [$where ? 'WHERE ' . implode(' AND ', $where) : '', $params];
    }

    private function statsJoinSql(): string
    {
        return "
            LEFT JOIN (
                SELECT
                    c.id AS course_id,
                    COUNT(DISTINCT b.id) AS batch_count,
                    COUNT(DISTINCT CASE WHEN b.status = 'Active' THEN b.id END) AS active_batch_count,
                    COUNT(DISTINCT sc.student_id) AS enrolled_students
                FROM courses c
                LEFT JOIN batches b ON b.course_id = c.id
                LEFT JOIN student_course sc ON sc.course_id = c.id
                GROUP BY c.id
            ) stats ON stats.course_id = c.id
        ";
    }

    private function transformCourse(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'course_id' => $row['course_code'],
            'course_name' => $row['name'],
            'description' => $row['description'] ?? '',
            'duration_months' => $row['duration_months'] !== null ? (int) $row['duration_months'] : null,
            'fee_amount' => (float) ($row['default_fee'] ?? 0),
            'mode' => $row['mode'] ?? 'Offline',
            'subjects' => $this->subjectsToArray($row['subjects'] ?? ''),
            'status' => $row['status'] ?? 'Active',
            'batch_count' => (int) ($row['batch_count'] ?? 0),
            'active_batch_count' => (int) ($row['active_batch_count'] ?? 0),
            'enrolled_students' => (int) ($row['enrolled_students'] ?? 0),
            'created_at' => $row['created_at'] ?? null,
        ];
    }

    private function generateCourseCode(): string
    {
        $year = date('Y');
        $prefix = 'CRS-' . $year . '-';
        $stmt = $this->conn->prepare(
            "SELECT course_code
             FROM courses
             WHERE course_code LIKE :prefix
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

    private function subjectsToArray(string $subjects): array
    {
        $items = array_map('trim', explode(',', $subjects));
        $items = array_values(array_filter($items, static fn (string $subject) => $subject !== ''));

        return $items;
    }

    private function subjectsToString(array $subjects): string
    {
        $items = array_map(
            static fn (string $subject) => trim($subject),
            $subjects
        );
        $items = array_values(array_filter($items, static fn (string $subject) => $subject !== ''));

        return implode(', ', $items);
    }
}
