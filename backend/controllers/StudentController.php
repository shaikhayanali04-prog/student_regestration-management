<?php

require_once __DIR__ . '/../models/StudentModel.php';

class StudentController
{
    private StudentModel $students;

    private array $allowedStatuses = ['Active', 'Inactive', 'Dropped', 'Completed'];

    private array $allowedGenders = ['Male', 'Female', 'Other'];

    public function __construct(PDO $conn)
    {
        $this->students = new StudentModel($conn);
    }

    public function index(): void
    {
        $filters = [
            'search' => $_GET['search'] ?? '',
            'status' => $_GET['status'] ?? '',
            'course_id' => $_GET['course_id'] ?? null,
            'batch_id' => $_GET['batch_id'] ?? null,
            'page' => $_GET['page'] ?? 1,
            'limit' => $_GET['limit'] ?? 8,
        ];

        jsonResponse(true, 'Students fetched successfully', $this->students->paginate($filters));
    }

    public function meta(): void
    {
        jsonResponse(true, 'Student metadata fetched successfully', $this->students->getMeta());
    }

    public function show(): void
    {
        $studentId = (int) ($_GET['id'] ?? 0);
        if ($studentId <= 0) {
            jsonResponse(false, 'A valid student id is required.', null, 422);
        }

        $student = $this->students->find($studentId);
        if (!$student) {
            jsonResponse(false, 'Student not found.', null, 404);
        }

        jsonResponse(true, 'Student fetched successfully', $student);
    }

    public function store(): void
    {
        $payload = $this->validatePayload($this->requestData());

        try {
            $student = $this->students->create($payload, $_FILES['student_photo'] ?? null);
            jsonResponse(true, 'Student created successfully', $student, 201);
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function update(): void
    {
        $studentId = (int) ($_GET['id'] ?? 0);
        if ($studentId <= 0) {
            jsonResponse(false, 'A valid student id is required.', null, 422);
        }

        $payload = $this->validatePayload($this->requestData(), true);

        try {
            $student = $this->students->update($studentId, $payload, $_FILES['student_photo'] ?? null);
            jsonResponse(true, 'Student updated successfully', $student);
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function destroy(): void
    {
        $studentId = (int) ($_GET['id'] ?? 0);
        if ($studentId <= 0) {
            jsonResponse(false, 'A valid student id is required.', null, 422);
        }

        try {
            $this->students->delete($studentId);
            jsonResponse(true, 'Student deleted successfully');
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    private function requestData(): array
    {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        if (stripos($contentType, 'application/json') !== false) {
            $decoded = json_decode(file_get_contents('php://input'), true);
            return is_array($decoded) ? $decoded : [];
        }

        return $_POST;
    }

    private function validatePayload(array $input, bool $isUpdate = false): array
    {
        $fullName = trim((string) ($input['full_name'] ?? ''));
        if ($fullName === '' || strlen($fullName) < 2) {
            throw new InvalidArgumentException('Full name must be at least 2 characters long.');
        }

        $email = trim((string) ($input['email'] ?? ''));
        if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException('Please provide a valid email address.');
        }

        $phone = trim((string) ($input['phone'] ?? ''));
        if ($phone === '') {
            throw new InvalidArgumentException('Phone number is required.');
        }

        $admissionDate = $this->normalizeDate($input['admission_date'] ?? date('Y-m-d'));
        if (!$admissionDate) {
            throw new InvalidArgumentException('Admission date must be a valid date.');
        }

        $dateOfBirth = null;
        if (!empty($input['date_of_birth'])) {
            $dateOfBirth = $this->normalizeDate($input['date_of_birth']);
            if (!$dateOfBirth) {
                throw new InvalidArgumentException('Date of birth must be a valid date.');
            }
        }

        $status = trim((string) ($input['status'] ?? 'Active'));
        if (!in_array($status, $this->allowedStatuses, true)) {
            throw new InvalidArgumentException('Please choose a valid status.');
        }

        $gender = trim((string) ($input['gender'] ?? ''));
        if ($gender !== '' && !in_array($gender, $this->allowedGenders, true)) {
            throw new InvalidArgumentException('Please choose a valid gender.');
        }

        $courseId = $this->normalizeId($input['course_id'] ?? null);
        $batchId = $this->normalizeId($input['batch_id'] ?? null);

        return [
            'student_id' => trim((string) ($input['student_id'] ?? '')),
            'full_name' => $fullName,
            'email' => $email !== '' ? $email : null,
            'phone' => $phone,
            'parent_name' => trim((string) ($input['parent_name'] ?? '')) ?: null,
            'parent_phone' => trim((string) ($input['parent_phone'] ?? '')) ?: null,
            'address' => trim((string) ($input['address'] ?? '')) ?: null,
            'admission_date' => $admissionDate,
            'date_of_birth' => $dateOfBirth,
            'gender' => $gender !== '' ? $gender : null,
            'status' => $status,
            'course_id' => $courseId,
            'batch_id' => $batchId,
            'notes' => trim((string) ($input['notes'] ?? '')) ?: null,
            'remove_photo' => $this->toBool($input['remove_photo'] ?? false),
        ];
    }

    private function normalizeDate(?string $value): ?string
    {
        if ($value === null || trim($value) === '') {
            return null;
        }

        $date = DateTime::createFromFormat('Y-m-d', trim($value));
        if (!$date || $date->format('Y-m-d') !== trim($value)) {
            return null;
        }

        return $date->format('Y-m-d');
    }

    private function normalizeId(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        $id = (int) $value;
        return $id > 0 ? $id : null;
    }

    private function toBool(mixed $value): bool
    {
        return in_array($value, [true, 1, '1', 'true', 'on'], true);
    }

    private function handleException(Throwable $exception): void
    {
        if ($exception instanceof InvalidArgumentException) {
            jsonResponse(false, $exception->getMessage(), null, 422);
        }

        if ($exception instanceof RuntimeException) {
            $status = str_contains(strtolower($exception->getMessage()), 'not found') ? 404 : 422;
            jsonResponse(false, $exception->getMessage(), null, $status);
        }

        if ($exception instanceof PDOException && $exception->getCode() === '23000') {
            jsonResponse(false, 'A student with the same email or student ID already exists.', null, 422);
        }

        jsonResponse(false, 'Unable to save the student right now. Please try again.', null, 500);
    }
}
