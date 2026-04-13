<?php

require_once __DIR__ . '/../models/AttendanceModel.php';

class AttendanceController
{
    private AttendanceModel $attendance;

    private array $statuses = ['Present', 'Absent', 'Late', 'Excused'];

    public function __construct(PDO $conn)
    {
        $this->attendance = new AttendanceModel($conn);
    }

    public function index(): void
    {
        $filters = [
            'search' => $_GET['search'] ?? '',
            'batch_id' => $_GET['batch_id'] ?? null,
            'status' => $_GET['status'] ?? '',
            'date_from' => $_GET['date_from'] ?? '',
            'date_to' => $_GET['date_to'] ?? '',
            'page' => $_GET['page'] ?? 1,
            'limit' => $_GET['limit'] ?? 10,
        ];

        jsonResponse(true, 'Attendance history fetched successfully', $this->attendance->paginate($filters));
    }

    public function meta(): void
    {
        jsonResponse(true, 'Attendance metadata fetched successfully', $this->attendance->getMeta());
    }

    public function sheet(): void
    {
        $batchId = (int) ($_GET['batch_id'] ?? 0);
        if ($batchId <= 0) {
            jsonResponse(false, 'Please choose a valid batch.', null, 422);
        }

        $date = $this->normalizeDate($_GET['date'] ?? date('Y-m-d'));
        $sheet = $this->attendance->getSheet($batchId, $date);

        if (!$sheet) {
            jsonResponse(false, 'Attendance sheet not found for the selected batch.', null, 404);
        }

        jsonResponse(true, 'Attendance sheet fetched successfully', $sheet);
    }

    public function mark(): void
    {
        $payload = $this->validateMarkPayload($this->requestData());

        try {
            $sheet = $this->attendance->saveSheet(
                $payload['batch_id'],
                $payload['date'],
                $payload['records']
            );
            jsonResponse(true, 'Attendance saved successfully', $sheet);
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function report(): void
    {
        $filters = [
            'search' => $_GET['search'] ?? '',
            'batch_id' => $_GET['batch_id'] ?? null,
            'status' => $_GET['status'] ?? '',
            'date_from' => $_GET['date_from'] ?? '',
            'date_to' => $_GET['date_to'] ?? '',
        ];

        jsonResponse(true, 'Attendance report fetched successfully', $this->attendance->getReport($filters));
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

    private function validateMarkPayload(array $input): array
    {
        $batchId = (int) ($input['batch_id'] ?? 0);
        if ($batchId <= 0) {
            throw new InvalidArgumentException('Please choose a valid batch.');
        }

        $date = $this->normalizeDate($input['date'] ?? date('Y-m-d'));

        $records = $input['records'] ?? [];
        if (!is_array($records) || !$records) {
            throw new InvalidArgumentException('Please provide the attendance records to save.');
        }

        $normalizedRecords = [];
        foreach ($records as $record) {
            if (!is_array($record)) {
                throw new InvalidArgumentException('Attendance records are malformed.');
            }

            $studentId = (int) ($record['student_id'] ?? 0);
            if ($studentId <= 0) {
                throw new InvalidArgumentException('Each attendance row must include a valid student.');
            }

            $status = trim((string) ($record['status'] ?? 'Present'));
            if (!in_array($status, $this->statuses, true)) {
                throw new InvalidArgumentException('Attendance contains an invalid status value.');
            }

            $normalizedRecords[] = [
                'student_id' => $studentId,
                'status' => $status,
                'remarks' => trim((string) ($record['remarks'] ?? '')),
            ];
        }

        return [
            'batch_id' => $batchId,
            'date' => $date,
            'records' => $normalizedRecords,
        ];
    }

    private function normalizeDate(?string $value): string
    {
        $date = DateTime::createFromFormat('Y-m-d', trim((string) $value));
        if (!$date || $date->format('Y-m-d') !== trim((string) $value)) {
            throw new InvalidArgumentException('Please provide a valid date.');
        }

        return $date->format('Y-m-d');
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

        jsonResponse(false, 'Unable to process the attendance request right now. Please try again.', null, 500);
    }
}
