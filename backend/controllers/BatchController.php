<?php

require_once __DIR__ . '/../models/BatchModel.php';

class BatchController
{
    private BatchModel $batches;

    private array $allowedStatuses = ['Planned', 'Active', 'Completed'];

    public function __construct(PDO $conn)
    {
        $this->batches = new BatchModel($conn);
    }

    public function index(): void
    {
        $filters = [
            'search' => $_GET['search'] ?? '',
            'status' => $_GET['status'] ?? '',
            'course_id' => $_GET['course_id'] ?? null,
            'page' => $_GET['page'] ?? 1,
            'limit' => $_GET['limit'] ?? 8,
        ];

        jsonResponse(true, 'Batches fetched successfully', $this->batches->paginate($filters));
    }

    public function meta(): void
    {
        jsonResponse(true, 'Batch metadata fetched successfully', $this->batches->getMeta());
    }

    public function show(): void
    {
        $batchId = (int) ($_GET['id'] ?? 0);
        if ($batchId <= 0) {
            jsonResponse(false, 'A valid batch id is required.', null, 422);
        }

        $batch = $this->batches->find($batchId);
        if (!$batch) {
            jsonResponse(false, 'Batch not found.', null, 404);
        }

        jsonResponse(true, 'Batch fetched successfully', $batch);
    }

    public function store(): void
    {
        $payload = $this->validatePayload($this->requestData(), false);

        try {
            $batch = $this->batches->create($payload);
            jsonResponse(true, 'Batch created successfully', $batch, 201);
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function update(): void
    {
        $batchId = (int) ($_GET['id'] ?? 0);
        if ($batchId <= 0) {
            jsonResponse(false, 'A valid batch id is required.', null, 422);
        }

        $payload = $this->validatePayload($this->requestData(), true);

        try {
            $batch = $this->batches->update($batchId, $payload);
            jsonResponse(true, 'Batch updated successfully', $batch);
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function destroy(): void
    {
        $batchId = (int) ($_GET['id'] ?? 0);
        if ($batchId <= 0) {
            jsonResponse(false, 'A valid batch id is required.', null, 422);
        }

        try {
            $this->batches->delete($batchId);
            jsonResponse(true, 'Batch deleted successfully');
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
        $batchName = trim((string) ($input['batch_name'] ?? ''));
        if ($batchName === '' || strlen($batchName) < 2) {
            throw new InvalidArgumentException('Batch name must be at least 2 characters long.');
        }

        $batchCode = trim((string) ($input['batch_id'] ?? ''));
        if ($isUpdate && $batchCode === '') {
            throw new InvalidArgumentException('Batch ID is required for updates.');
        }

        $courseId = (int) ($input['course_id'] ?? 0);
        if ($courseId <= 0) {
            throw new InvalidArgumentException('Please select a course for this batch.');
        }

        $status = trim((string) ($input['status'] ?? 'Planned'));
        if (!in_array($status, $this->allowedStatuses, true)) {
            throw new InvalidArgumentException('Please choose a valid batch status.');
        }

        $startDate = $this->normalizeDate($input['start_date'] ?? null);
        $endDate = $this->normalizeDate($input['end_date'] ?? null);

        if ($startDate && $endDate && $endDate < $startDate) {
            throw new InvalidArgumentException('End date cannot be earlier than start date.');
        }

        $capacity = null;
        if (($input['capacity'] ?? '') !== '') {
            $capacity = (int) $input['capacity'];
            if ($capacity < 0) {
                throw new InvalidArgumentException('Capacity cannot be negative.');
            }
        }

        $facultyId = null;
        if (($input['faculty_id'] ?? '') !== '') {
            $facultyId = (int) $input['faculty_id'];
            if ($facultyId <= 0) {
                throw new InvalidArgumentException('Please choose a valid faculty member.');
            }
        }

        return [
            'batch_id' => $batchCode,
            'batch_name' => $batchName,
            'course_id' => $courseId,
            'faculty_id' => $facultyId,
            'faculty_name' => trim((string) ($input['faculty_name'] ?? '')) ?: null,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'days_of_week' => $this->normalizeDays($input['days_of_week'] ?? []),
            'start_time' => $this->normalizeTime($input['start_time'] ?? null),
            'end_time' => $this->normalizeTime($input['end_time'] ?? null),
            'room' => trim((string) ($input['room'] ?? '')) ?: null,
            'capacity' => $capacity,
            'status' => $status,
            'assigned_student_ids' => $this->normalizeStudentIds($input['assigned_student_ids'] ?? []),
        ];
    }

    private function normalizeDate(?string $value): ?string
    {
        if ($value === null || trim($value) === '') {
            return null;
        }

        $date = DateTime::createFromFormat('Y-m-d', trim($value));
        if (!$date || $date->format('Y-m-d') !== trim($value)) {
            throw new InvalidArgumentException('Please provide a valid batch date.');
        }

        return $date->format('Y-m-d');
    }

    private function normalizeTime(?string $value): ?string
    {
        if ($value === null || trim($value) === '') {
            return null;
        }

        if (!preg_match('/^\d{2}:\d{2}$/', trim($value))) {
            throw new InvalidArgumentException('Please provide a valid batch time.');
        }

        return trim($value) . ':00';
    }

    private function normalizeDays(mixed $days): array
    {
        if (is_string($days)) {
            $days = preg_split('/[\n,]+/', $days) ?: [];
        }

        if (!is_array($days)) {
            return [];
        }

        $items = array_map(static fn ($day) => trim((string) $day), $days);
        return array_values(array_filter($items, static fn (string $day) => $day !== ''));
    }

    private function normalizeStudentIds(mixed $studentIds): array
    {
        if (!is_array($studentIds)) {
            return [];
        }

        $items = array_map('intval', $studentIds);
        $items = array_values(array_filter($items, static fn (int $id) => $id > 0));

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
            jsonResponse(false, 'A batch with the same code already exists.', null, 422);
        }

        jsonResponse(false, 'Unable to save the batch right now. Please try again.', null, 500);
    }
}
