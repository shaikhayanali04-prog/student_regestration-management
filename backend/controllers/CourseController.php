<?php

require_once __DIR__ . '/../models/CourseModel.php';

class CourseController
{
    private CourseModel $courses;

    private array $allowedStatuses = ['Active', 'Inactive'];

    private array $allowedModes = ['Online', 'Offline', 'Hybrid'];

    public function __construct(PDO $conn)
    {
        $this->courses = new CourseModel($conn);
    }

    public function index(): void
    {
        $filters = [
            'search' => $_GET['search'] ?? '',
            'status' => $_GET['status'] ?? '',
            'mode' => $_GET['mode'] ?? '',
            'page' => $_GET['page'] ?? 1,
            'limit' => $_GET['limit'] ?? 8,
        ];

        jsonResponse(true, 'Courses fetched successfully', $this->courses->paginate($filters));
    }

    public function meta(): void
    {
        jsonResponse(true, 'Course metadata fetched successfully', $this->courses->getMeta());
    }

    public function show(): void
    {
        $courseId = (int) ($_GET['id'] ?? 0);
        if ($courseId <= 0) {
            jsonResponse(false, 'A valid course id is required.', null, 422);
        }

        $course = $this->courses->find($courseId);
        if (!$course) {
            jsonResponse(false, 'Course not found.', null, 404);
        }

        jsonResponse(true, 'Course fetched successfully', $course);
    }

    public function store(): void
    {
        $payload = $this->validatePayload($this->requestData(), false);

        try {
            $course = $this->courses->create($payload);
            jsonResponse(true, 'Course created successfully', $course, 201);
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function update(): void
    {
        $courseId = (int) ($_GET['id'] ?? 0);
        if ($courseId <= 0) {
            jsonResponse(false, 'A valid course id is required.', null, 422);
        }

        $payload = $this->validatePayload($this->requestData(), true);

        try {
            $course = $this->courses->update($courseId, $payload);
            jsonResponse(true, 'Course updated successfully', $course);
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function destroy(): void
    {
        $courseId = (int) ($_GET['id'] ?? 0);
        if ($courseId <= 0) {
            jsonResponse(false, 'A valid course id is required.', null, 422);
        }

        try {
            $this->courses->delete($courseId);
            jsonResponse(true, 'Course deleted successfully');
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
        $courseName = trim((string) ($input['course_name'] ?? ''));
        if ($courseName === '' || strlen($courseName) < 2) {
            throw new InvalidArgumentException('Course name must be at least 2 characters long.');
        }

        $courseCode = trim((string) ($input['course_id'] ?? ''));
        if ($isUpdate && $courseCode === '') {
            throw new InvalidArgumentException('Course ID is required for updates.');
        }

        $durationMonths = null;
        if (($input['duration_months'] ?? '') !== '') {
            $durationMonths = (int) $input['duration_months'];
            if ($durationMonths < 0) {
                throw new InvalidArgumentException('Duration must be zero or a positive number.');
            }
        }

        $feeAmount = (float) ($input['fee_amount'] ?? 0);
        if ($feeAmount < 0) {
            throw new InvalidArgumentException('Fee amount cannot be negative.');
        }

        $status = trim((string) ($input['status'] ?? 'Active'));
        if (!in_array($status, $this->allowedStatuses, true)) {
            throw new InvalidArgumentException('Please choose a valid course status.');
        }

        $mode = trim((string) ($input['mode'] ?? 'Offline'));
        if (!in_array($mode, $this->allowedModes, true)) {
            throw new InvalidArgumentException('Please choose a valid course mode.');
        }

        return [
            'course_id' => $courseCode,
            'course_name' => $courseName,
            'description' => trim((string) ($input['description'] ?? '')) ?: null,
            'duration_months' => $durationMonths,
            'fee_amount' => $feeAmount,
            'mode' => $mode,
            'subjects' => $this->normalizeSubjects($input['subjects'] ?? []),
            'status' => $status,
        ];
    }

    private function normalizeSubjects(mixed $subjects): array
    {
        if (is_string($subjects)) {
            $parts = preg_split('/[\n,]+/', $subjects) ?: [];
            $subjects = $parts;
        }

        if (!is_array($subjects)) {
            return [];
        }

        $items = array_map(
            static fn ($subject) => trim((string) $subject),
            $subjects
        );

        return array_values(array_filter($items, static fn (string $subject) => $subject !== ''));
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
            jsonResponse(false, 'A course with the same code already exists.', null, 422);
        }

        jsonResponse(false, 'Unable to save the course right now. Please try again.', null, 500);
    }
}
