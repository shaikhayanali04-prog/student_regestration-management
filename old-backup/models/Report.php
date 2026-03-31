<?php

declare(strict_types=1);

class Report extends BaseModel
{
    public function fees(): array
    {
        $feeModel = new Fee();

        return [
            'summary' => [
                'total_collected' => $feeModel->totalCollected(),
                'total_pending' => $feeModel->totalPending(),
                'records' => count($feeModel->all()),
            ],
            'rows' => array_map(static function (array $row): array {
                return [
                    'student_name' => $row['student_name'],
                    'course_name' => $row['course_name'],
                    'total_fees' => (float) $row['total_fees'],
                    'paid' => (float) $row['paid'],
                    'remaining' => (float) max((float) $row['remaining'], 0),
                    'status' => $row['status'],
                    'installment_amount' => (float) $row['installment_amount'],
                    'last_payment_date' => $row['last_payment_date'],
                ];
            }, $feeModel->paymentRowsForExport()),
        ];
    }

    public function attendance(array $filters = []): array
    {
        $attendanceModel = new Attendance();
        $rows = $attendanceModel->report($filters);
        $distribution = $attendanceModel->distribution();
        $lowAttendance = $attendanceModel->lowAttendanceStudents();

        return [
            'summary' => [
                'present' => $distribution['present'],
                'absent' => $distribution['absent'],
                'records' => count($rows),
            ],
            'rows' => array_map([ApiTransformer::class, 'attendance'], $rows),
            'low_attendance' => array_map(static function (array $row): array {
                return [
                    'student_id' => (int) $row['id'],
                    'student_name' => $row['name'],
                    'attendance_percent' => (float) $row['attendance_percent'],
                    'attendance_days' => (int) $row['attendance_days'],
                ];
            }, $lowAttendance),
        ];
    }

    public function students(array $filters = []): array
    {
        $studentModel = new Student();
        $rows = $studentModel->all($filters);

        return [
            'summary' => [
                'records' => count($rows),
                'active' => count(array_filter($rows, static fn (array $row): bool => ($row['status'] ?? '') === 'active')),
                'inactive' => count(array_filter($rows, static fn (array $row): bool => ($row['status'] ?? '') === 'inactive')),
            ],
            'rows' => array_map([ApiTransformer::class, 'student'], $rows),
        ];
    }
}
