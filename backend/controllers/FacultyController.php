<?php

require_once __DIR__ . '/../models/FacultyModel.php';

class FacultyController
{
    private FacultyModel $faculty;

    private array $allowedStatuses = ['Active', 'Inactive'];

    public function __construct(PDO $conn)
    {
        $this->faculty = new FacultyModel($conn);
    }

    public function index(): void
    {
        $filters = [
            'search' => $_GET['search'] ?? '',
            'status' => $_GET['status'] ?? '',
            'page' => $_GET['page'] ?? 1,
            'limit' => $_GET['limit'] ?? 8,
        ];

        jsonResponse(true, 'Faculty fetched successfully', $this->faculty->paginate($filters));
    }

    public function meta(): void
    {
        jsonResponse(true, 'Faculty metadata fetched successfully', $this->faculty->getMeta());
    }

    public function show(): void
    {
        $facultyId = (int) ($_GET['id'] ?? 0);
        if ($facultyId <= 0) {
            jsonResponse(false, 'A valid faculty id is required.', null, 422);
        }

        $faculty = $this->faculty->find($facultyId);
        if (!$faculty) {
            jsonResponse(false, 'Faculty member not found.', null, 404);
        }

        jsonResponse(true, 'Faculty fetched successfully', $faculty);
    }

    public function store(): void
    {
        $payload = $this->validatePayload($this->requestData(), false);

        try {
            $faculty = $this->faculty->create($payload);
            jsonResponse(true, 'Faculty created successfully', $faculty, 201);
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function update(): void
    {
        $facultyId = (int) ($_GET['id'] ?? 0);
        if ($facultyId <= 0) {
            jsonResponse(false, 'A valid faculty id is required.', null, 422);
        }

        $payload = $this->validatePayload($this->requestData(), true);

        try {
            $faculty = $this->faculty->update($facultyId, $payload);
            jsonResponse(true, 'Faculty updated successfully', $faculty);
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function destroy(): void
    {
        $facultyId = (int) ($_GET['id'] ?? 0);
        if ($facultyId <= 0) {
            jsonResponse(false, 'A valid faculty id is required.', null, 422);
        }

        try {
            $this->faculty->delete($facultyId);
            jsonResponse(true, 'Faculty deleted successfully');
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

    private function validatePayload(array $input, bool $isUpdate): array
    {
        $fullName = trim((string) ($input['full_name'] ?? ''));
        if ($fullName === '' || strlen($fullName) < 2) {
            throw new InvalidArgumentException('Full name must be at least 2 characters long.');
        }

        $facultyCode = trim((string) ($input['faculty_id'] ?? ''));
        if ($isUpdate && $facultyCode === '') {
            throw new InvalidArgumentException('Faculty ID is required for updates.');
        }

        $email = trim((string) ($input['email'] ?? ''));
        if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException('Please provide a valid email address.');
        }

        $phone = trim((string) ($input['phone'] ?? ''));
        if ($phone !== '' && !preg_match('/^[0-9+\-\s]{7,20}$/', $phone)) {
            throw new InvalidArgumentException('Please provide a valid phone number.');
        }

        $status = trim((string) ($input['status'] ?? 'Active'));
        if (!in_array($status, $this->allowedStatuses, true)) {
            throw new InvalidArgumentException('Please choose a valid faculty status.');
        }

        return [
            'faculty_id' => $facultyCode,
            'full_name' => $fullName,
            'email' => $email !== '' ? $email : null,
            'phone' => $phone !== '' ? $phone : null,
            'subject_specialization' => $this->normalizeSubjects($input['subject_specialization'] ?? []),
            'joining_date' => $this->normalizeDate($input['joining_date'] ?? null),
            'status' => $status,
            'notes' => trim((string) ($input['notes'] ?? '')) ?: null,
            'assigned_batch_ids' => $this->normalizeBatchIds($input['assigned_batch_ids'] ?? []),
        ];
    }

    private function normalizeSubjects(mixed $subjects): array
    {
        if (is_string($subjects)) {
            $subjects = preg_split('/[\n,]+/', $subjects) ?: [];
        }

        if (!is_array($subjects)) {
            return [];
        }

        $items = array_map(
            static fn ($subject): string => trim((string) $subject),
            $subjects
        );

        return array_values(array_filter($items, static fn (string $subject): bool => $subject !== ''));
    }

    private function normalizeDate(?string $value): ?string
    {
        if ($value === null || trim($value) === '') {
            return null;
        }

        $date = DateTime::createFromFormat('Y-m-d', trim($value));
        if (!$date || $date->format('Y-m-d') !== trim($value)) {
            throw new InvalidArgumentException('Please provide a valid joining date.');
        }

        return $date->format('Y-m-d');
    }

    private function normalizeBatchIds(mixed $batchIds): array
    {
        if (!is_array($batchIds)) {
            return [];
        }

        $items = array_map('intval', $batchIds);
        $items = array_values(array_filter($items, static fn (int $id): bool => $id > 0));

        return array_values(array_unique($items));
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
            jsonResponse(false, 'A faculty record with the same email or ID already exists.', null, 422);
        }

        jsonResponse(false, 'Unable to save the faculty record right now. Please try again.', null, 500);
    }
}
