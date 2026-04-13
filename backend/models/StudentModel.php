<?php

require_once __DIR__ . '/../helpers/student_schema.php';

class StudentModel
{
    private PDO $conn;

    private array $statuses = ['Active', 'Inactive', 'Dropped', 'Completed'];

    public function __construct(PDO $conn)
    {
        $this->conn = $conn;
        ensureStudentSchema($conn);
    }

    public function getMeta(): array
    {
        $courses = $this->conn
            ->query("SELECT id, name, status FROM courses ORDER BY name ASC")
            ->fetchAll(PDO::FETCH_ASSOC);

        $batches = $this->conn
            ->query(
                "SELECT b.id, b.name, b.course_id, b.status, c.name AS course_name
                 FROM batches b
                 LEFT JOIN courses c ON c.id = b.course_id
                 ORDER BY b.name ASC"
            )
            ->fetchAll(PDO::FETCH_ASSOC);

        return [
            'statuses' => $this->statuses,
            'courses' => $courses,
            'batches' => $batches,
        ];
    }

    public function paginate(array $filters): array
    {
        $page = max(1, (int) ($filters['page'] ?? 1));
        $limit = max(1, min(25, (int) ($filters['limit'] ?? 8)));
        $offset = ($page - 1) * $limit;

        [$whereSql, $params] = $this->buildFilters($filters);
        $joins = $this->latestEnrollmentJoin();

        $countStmt = $this->conn->prepare(
            "SELECT COUNT(*) AS total
             FROM students s
             {$joins}
             {$whereSql}"
        );
        $countStmt->execute($params);
        $total = (int) ($countStmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);

        $summaryStmt = $this->conn->prepare(
            "SELECT
                COUNT(*) AS total_students,
                SUM(CASE WHEN s.status = 'Active' THEN 1 ELSE 0 END) AS active_students,
                SUM(CASE WHEN s.status = 'Inactive' THEN 1 ELSE 0 END) AS inactive_students,
                SUM(CASE WHEN s.status = 'Dropped' THEN 1 ELSE 0 END) AS dropped_students,
                SUM(CASE WHEN s.status = 'Completed' THEN 1 ELSE 0 END) AS completed_students
             FROM students s
             {$joins}
             {$whereSql}"
        );
        $summaryStmt->execute($params);
        $summary = $summaryStmt->fetch(PDO::FETCH_ASSOC) ?: [];

        $studentStmt = $this->conn->prepare(
            "SELECT
                s.id,
                s.admission_no,
                s.first_name,
                s.last_name,
                s.email,
                s.phone,
                s.parent_name,
                s.parent_phone,
                s.address,
                s.admission_date,
                s.dob,
                s.gender,
                s.status,
                s.photo_url,
                s.notes,
                s.created_at,
                c.id AS course_id,
                c.name AS course_name,
                b.id AS batch_id,
                b.name AS batch_name,
                sc.total_fee,
                sc.discount
             FROM students s
             {$joins}
             {$whereSql}
             ORDER BY COALESCE(s.admission_date, DATE(s.created_at)) DESC, s.id DESC
             LIMIT :limit OFFSET :offset"
        );

        foreach ($params as $key => $value) {
            $studentStmt->bindValue(':' . $key, $value);
        }
        $studentStmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $studentStmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $studentStmt->execute();

        $items = array_map(
            fn (array $row) => $this->transformStudentRow($row),
            $studentStmt->fetchAll(PDO::FETCH_ASSOC)
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
                    'total_students' => (int) ($summary['total_students'] ?? 0),
                    'active_students' => (int) ($summary['active_students'] ?? 0),
                    'inactive_students' => (int) ($summary['inactive_students'] ?? 0),
                    'dropped_students' => (int) ($summary['dropped_students'] ?? 0),
                    'completed_students' => (int) ($summary['completed_students'] ?? 0),
                ],
                'filters' => [
                    'search' => trim((string) ($filters['search'] ?? '')),
                    'status' => $filters['status'] ?? '',
                    'course_id' => isset($filters['course_id']) ? (int) $filters['course_id'] : null,
                    'batch_id' => isset($filters['batch_id']) ? (int) $filters['batch_id'] : null,
                ],
            ],
        ];
    }

    public function find(int $studentId): ?array
    {
        $stmt = $this->conn->prepare(
            "SELECT
                s.id,
                s.admission_no,
                s.first_name,
                s.last_name,
                s.email,
                s.phone,
                s.parent_name,
                s.parent_phone,
                s.address,
                s.admission_date,
                s.dob,
                s.gender,
                s.status,
                s.photo_url,
                s.notes,
                s.created_at,
                sc.id AS student_course_id,
                sc.joined_date,
                sc.total_fee,
                sc.discount,
                c.id AS course_id,
                c.name AS course_name,
                b.id AS batch_id,
                b.name AS batch_name
             FROM students s
             {$this->latestEnrollmentJoin()}
             WHERE s.id = :student_id
             LIMIT 1"
        );
        $stmt->execute(['student_id' => $studentId]);
        $student = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$student) {
            return null;
        }

        $studentCourseId = isset($student['student_course_id']) ? (int) $student['student_course_id'] : null;
        $feeSummary = [
            'total_fee' => 0.0,
            'discount' => 0.0,
            'amount_paid' => 0.0,
            'due_amount' => 0.0,
        ];
        $payments = [];

        if ($studentCourseId) {
            $paymentSummaryStmt = $this->conn->prepare(
                "SELECT
                    COALESCE(sc.total_fee, 0) AS total_fee,
                    COALESCE(sc.discount, 0) AS discount,
                    COALESCE(SUM(f.amount_paid), 0) AS amount_paid
                 FROM student_course sc
                 LEFT JOIN fees f ON f.student_course_id = sc.id
                 WHERE sc.id = :student_course_id
                 GROUP BY sc.id"
            );
            $paymentSummaryStmt->execute(['student_course_id' => $studentCourseId]);
            $summaryRow = $paymentSummaryStmt->fetch(PDO::FETCH_ASSOC) ?: $feeSummary;

            $feeSummary = [
                'total_fee' => (float) ($summaryRow['total_fee'] ?? 0),
                'discount' => (float) ($summaryRow['discount'] ?? 0),
                'amount_paid' => (float) ($summaryRow['amount_paid'] ?? 0),
                'due_amount' => max(
                    ((float) ($summaryRow['total_fee'] ?? 0) - (float) ($summaryRow['discount'] ?? 0))
                        - (float) ($summaryRow['amount_paid'] ?? 0),
                    0
                ),
            ];

            $paymentsStmt = $this->conn->prepare(
                "SELECT id, amount_paid, payment_date, payment_method, remarks, created_at
                 FROM fees
                 WHERE student_course_id = :student_course_id
                 ORDER BY payment_date DESC, id DESC"
            );
            $paymentsStmt->execute(['student_course_id' => $studentCourseId]);
            $payments = $paymentsStmt->fetchAll(PDO::FETCH_ASSOC);
        }

        $attendanceSummaryStmt = $this->conn->prepare(
            "SELECT
                COUNT(*) AS total_sessions,
                SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS present_count,
                SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) AS absent_count,
                SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) AS late_count,
                SUM(CASE WHEN status = 'Excused' THEN 1 ELSE 0 END) AS excused_count
             FROM attendance
             WHERE student_id = :student_id"
        );
        $attendanceSummaryStmt->execute(['student_id' => $studentId]);
        $attendanceSummary = $attendanceSummaryStmt->fetch(PDO::FETCH_ASSOC) ?: [];

        $attendanceHistoryStmt = $this->conn->prepare(
            "SELECT
                a.id,
                a.date,
                a.status,
                a.remarks,
                b.id AS batch_id,
                b.name AS batch_name
             FROM attendance a
             LEFT JOIN batches b ON b.id = a.batch_id
             WHERE a.student_id = :student_id
             ORDER BY a.date DESC, a.id DESC
             LIMIT 15"
        );
        $attendanceHistoryStmt->execute(['student_id' => $studentId]);
        $attendanceHistory = $attendanceHistoryStmt->fetchAll(PDO::FETCH_ASSOC);

        $totalSessions = (int) ($attendanceSummary['total_sessions'] ?? 0);
        $presentCount = (int) ($attendanceSummary['present_count'] ?? 0);
        $lateCount = (int) ($attendanceSummary['late_count'] ?? 0);

        return [
            'student' => $this->transformStudentRow($student),
            'fees' => [
                'summary' => $feeSummary,
                'history' => $payments,
            ],
            'attendance' => [
                'summary' => [
                    'total_sessions' => $totalSessions,
                    'present_count' => $presentCount,
                    'absent_count' => (int) ($attendanceSummary['absent_count'] ?? 0),
                    'late_count' => $lateCount,
                    'excused_count' => (int) ($attendanceSummary['excused_count'] ?? 0),
                    'attendance_percentage' => $totalSessions > 0
                        ? round((($presentCount + $lateCount) / $totalSessions) * 100, 1)
                        : 0,
                ],
                'history' => $attendanceHistory,
            ],
            'performance' => ['items' => []],
            'documents' => ['items' => []],
        ];
    }

    public function create(array $payload, ?array $photo): array
    {
        $this->conn->beginTransaction();

        try {
            [$firstName, $lastName] = $this->splitName($payload['full_name']);
            $studentCode = $payload['student_id'] ?: $this->generateStudentCode();
            $photoUrl = $this->storePhoto($photo, null, false);

            $stmt = $this->conn->prepare(
                "INSERT INTO students (
                    admission_no,
                    first_name,
                    last_name,
                    email,
                    phone,
                    parent_name,
                    parent_phone,
                    admission_date,
                    dob,
                    gender,
                    address,
                    photo_url,
                    status,
                    notes
                 ) VALUES (
                    :admission_no,
                    :first_name,
                    :last_name,
                    :email,
                    :phone,
                    :parent_name,
                    :parent_phone,
                    :admission_date,
                    :dob,
                    :gender,
                    :address,
                    :photo_url,
                    :status,
                    :notes
                 )"
            );

            $stmt->execute([
                'admission_no' => $studentCode,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $payload['email'],
                'phone' => $payload['phone'],
                'parent_name' => $payload['parent_name'],
                'parent_phone' => $payload['parent_phone'],
                'admission_date' => $payload['admission_date'],
                'dob' => $payload['date_of_birth'],
                'gender' => $payload['gender'],
                'address' => $payload['address'],
                'photo_url' => $photoUrl,
                'status' => $payload['status'],
                'notes' => $payload['notes'],
            ]);

            $studentId = (int) $this->conn->lastInsertId();
            $this->syncEnrollment($studentId, $payload['course_id'], $payload['batch_id'], $payload['admission_date']);

            $this->conn->commit();

            return $this->find($studentId);
        } catch (Throwable $exception) {
            $this->conn->rollBack();
            throw $exception;
        }
    }

    public function update(int $studentId, array $payload, ?array $photo): array
    {
        $existing = $this->find($studentId);
        if (!$existing) {
            throw new RuntimeException('Student not found.');
        }

        $this->conn->beginTransaction();

        try {
            [$firstName, $lastName] = $this->splitName($payload['full_name']);
            $currentPhoto = $existing['student']['student_photo'] ?? null;
            $photoUrl = $this->storePhoto($photo, $currentPhoto, (bool) $payload['remove_photo']);

            $stmt = $this->conn->prepare(
                "UPDATE students
                 SET
                    first_name = :first_name,
                    last_name = :last_name,
                    email = :email,
                    phone = :phone,
                    parent_name = :parent_name,
                    parent_phone = :parent_phone,
                    admission_date = :admission_date,
                    dob = :dob,
                    gender = :gender,
                    address = :address,
                    photo_url = :photo_url,
                    status = :status,
                    notes = :notes
                 WHERE id = :student_id"
            );

            $stmt->execute([
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $payload['email'],
                'phone' => $payload['phone'],
                'parent_name' => $payload['parent_name'],
                'parent_phone' => $payload['parent_phone'],
                'admission_date' => $payload['admission_date'],
                'dob' => $payload['date_of_birth'],
                'gender' => $payload['gender'],
                'address' => $payload['address'],
                'photo_url' => $photoUrl,
                'status' => $payload['status'],
                'notes' => $payload['notes'],
                'student_id' => $studentId,
            ]);

            $this->syncEnrollment($studentId, $payload['course_id'], $payload['batch_id'], $payload['admission_date']);

            $this->conn->commit();

            return $this->find($studentId);
        } catch (Throwable $exception) {
            $this->conn->rollBack();
            throw $exception;
        }
    }

    public function delete(int $studentId): void
    {
        $student = $this->find($studentId);
        if (!$student) {
            throw new RuntimeException('Student not found.');
        }

        $stmt = $this->conn->prepare("DELETE FROM students WHERE id = :student_id");
        $stmt->execute(['student_id' => $studentId]);

        $this->deletePhotoIfLocal($student['student']['student_photo'] ?? null);
    }

    private function buildFilters(array $filters): array
    {
        $where = [];
        $params = [];

        $search = trim((string) ($filters['search'] ?? ''));
        if ($search !== '') {
            $where[] = "(CONCAT_WS(' ', s.first_name, s.last_name) LIKE :search
                OR s.admission_no LIKE :search
                OR s.email LIKE :search
                OR s.phone LIKE :search
                OR s.parent_name LIKE :search)";
            $params['search'] = '%' . $search . '%';
        }

        $status = trim((string) ($filters['status'] ?? ''));
        if ($status !== '') {
            $where[] = 's.status = :status';
            $params['status'] = $status;
        }

        if (!empty($filters['course_id'])) {
            $where[] = 'c.id = :course_id';
            $params['course_id'] = (int) $filters['course_id'];
        }

        if (!empty($filters['batch_id'])) {
            $where[] = 'b.id = :batch_id';
            $params['batch_id'] = (int) $filters['batch_id'];
        }

        return [$where ? 'WHERE ' . implode(' AND ', $where) : '', $params];
    }

    private function latestEnrollmentJoin(): string
    {
        return "
            LEFT JOIN (
                SELECT sc1.*
                FROM student_course sc1
                INNER JOIN (
                    SELECT student_id, MAX(id) AS latest_id
                    FROM student_course
                    GROUP BY student_id
                ) latest_sc ON latest_sc.latest_id = sc1.id
            ) sc ON sc.student_id = s.id
            LEFT JOIN courses c ON c.id = sc.course_id
            LEFT JOIN batches b ON b.id = sc.batch_id
        ";
    }

    private function transformStudentRow(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'student_id' => $row['admission_no'],
            'full_name' => trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? '')),
            'email' => $row['email'] ?? '',
            'phone' => $row['phone'] ?? '',
            'parent_name' => $row['parent_name'] ?? '',
            'parent_phone' => $row['parent_phone'] ?? '',
            'address' => $row['address'] ?? '',
            'admission_date' => $row['admission_date'] ?? null,
            'date_of_birth' => $row['dob'] ?? null,
            'gender' => $row['gender'] ?? '',
            'status' => $row['status'] ?? 'Active',
            'student_photo' => $row['photo_url'] ?? null,
            'notes' => $row['notes'] ?? '',
            'created_at' => $row['created_at'] ?? null,
            'course_id' => isset($row['course_id']) ? (int) $row['course_id'] : null,
            'course_name' => $row['course_name'] ?? null,
            'batch_id' => isset($row['batch_id']) ? (int) $row['batch_id'] : null,
            'batch_name' => $row['batch_name'] ?? null,
            'total_fee' => isset($row['total_fee']) ? (float) $row['total_fee'] : 0.0,
            'discount' => isset($row['discount']) ? (float) $row['discount'] : 0.0,
        ];
    }

    private function splitName(string $fullName): array
    {
        $parts = preg_split('/\s+/', trim($fullName)) ?: [];
        $firstName = array_shift($parts) ?: '';
        $lastName = implode(' ', $parts);

        return [$firstName, $lastName];
    }

    private function generateStudentCode(): string
    {
        $year = date('Y');
        $prefix = 'STU-' . $year . '-';

        $stmt = $this->conn->prepare(
            "SELECT admission_no
             FROM students
             WHERE admission_no LIKE :prefix
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

    private function syncEnrollment(int $studentId, ?int $courseId, ?int $batchId, string $admissionDate): void
    {
        if ($batchId) {
            $batchStmt = $this->conn->prepare("SELECT id, course_id FROM batches WHERE id = :batch_id LIMIT 1");
            $batchStmt->execute(['batch_id' => $batchId]);
            $batch = $batchStmt->fetch(PDO::FETCH_ASSOC);

            if (!$batch) {
                throw new InvalidArgumentException('Selected batch does not exist.');
            }

            if ($courseId && (int) $batch['course_id'] !== $courseId) {
                throw new InvalidArgumentException('Selected batch does not belong to the chosen course.');
            }

            $courseId = (int) $batch['course_id'];
        }

        if (!$courseId) {
            return;
        }

        $courseStmt = $this->conn->prepare("SELECT id, default_fee FROM courses WHERE id = :course_id LIMIT 1");
        $courseStmt->execute(['course_id' => $courseId]);
        $course = $courseStmt->fetch(PDO::FETCH_ASSOC);

        if (!$course) {
            throw new InvalidArgumentException('Selected course does not exist.');
        }

        $existingStmt = $this->conn->prepare(
            "SELECT id, total_fee, discount
             FROM student_course
             WHERE student_id = :student_id
             ORDER BY id DESC
             LIMIT 1"
        );
        $existingStmt->execute(['student_id' => $studentId]);
        $existing = $existingStmt->fetch(PDO::FETCH_ASSOC);

        $totalFee = $existing ? (float) $existing['total_fee'] : (float) $course['default_fee'];
        $discount = $existing ? (float) $existing['discount'] : 0.0;

        if ($existing) {
            $updateStmt = $this->conn->prepare(
                "UPDATE student_course
                 SET course_id = :course_id,
                     batch_id = :batch_id,
                     total_fee = :total_fee,
                     discount = :discount,
                     joined_date = :joined_date
                 WHERE id = :student_course_id"
            );
            $updateStmt->execute([
                'course_id' => $courseId,
                'batch_id' => $batchId,
                'total_fee' => $totalFee,
                'discount' => $discount,
                'joined_date' => $admissionDate,
                'student_course_id' => $existing['id'],
            ]);

            return;
        }

        $insertStmt = $this->conn->prepare(
            "INSERT INTO student_course (
                student_id,
                course_id,
                batch_id,
                total_fee,
                discount,
                joined_date
             ) VALUES (
                :student_id,
                :course_id,
                :batch_id,
                :total_fee,
                :discount,
                :joined_date
             )"
        );
        $insertStmt->execute([
            'student_id' => $studentId,
            'course_id' => $courseId,
            'batch_id' => $batchId,
            'total_fee' => (float) $course['default_fee'],
            'discount' => 0.0,
            'joined_date' => $admissionDate,
        ]);
    }

    private function storePhoto(?array $photo, ?string $currentPhoto, bool $removePhoto): ?string
    {
        if ($removePhoto && $currentPhoto) {
            $this->deletePhotoIfLocal($currentPhoto);
            $currentPhoto = null;
        }

        if (!$photo || (($photo['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE)) {
            return $currentPhoto;
        }

        if (($photo['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
            throw new RuntimeException('Photo upload failed. Please try again.');
        }

        if (($photo['size'] ?? 0) > 2 * 1024 * 1024) {
            throw new RuntimeException('Photo size must be under 2 MB.');
        }

        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($photo['tmp_name']);
        $allowedTypes = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
        ];

        if (!isset($allowedTypes[$mimeType])) {
            throw new RuntimeException('Only JPG, PNG, and WEBP images are allowed.');
        }

        $uploadDir = __DIR__ . '/../uploads/students';
        if (!is_dir($uploadDir) && !mkdir($uploadDir, 0777, true) && !is_dir($uploadDir)) {
            throw new RuntimeException('Unable to prepare the upload directory.');
        }

        $filename = sprintf(
            'student-%s-%s.%s',
            date('YmdHis'),
            bin2hex(random_bytes(4)),
            $allowedTypes[$mimeType]
        );

        $destination = $uploadDir . DIRECTORY_SEPARATOR . $filename;
        if (!move_uploaded_file($photo['tmp_name'], $destination)) {
            throw new RuntimeException('Unable to save the uploaded photo.');
        }

        if ($currentPhoto) {
            $this->deletePhotoIfLocal($currentPhoto);
        }

        return '/coaching-project/backend/uploads/students/' . $filename;
    }

    private function deletePhotoIfLocal(?string $photoUrl): void
    {
        if (!$photoUrl || !str_starts_with($photoUrl, '/coaching-project/backend/uploads/')) {
            return;
        }

        $relativePath = substr($photoUrl, strlen('/coaching-project/backend/'));
        $basePath = realpath(__DIR__ . '/..');
        $uploadsRoot = realpath(__DIR__ . '/../uploads');

        if (!$basePath || !$uploadsRoot) {
            return;
        }

        $fullPath = $basePath . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relativePath);
        if (!str_starts_with($fullPath, $uploadsRoot)) {
            return;
        }

        if (is_file($fullPath)) {
            @unlink($fullPath);
        }
    }
}
