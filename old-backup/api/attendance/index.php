<?php

declare(strict_types=1);

require dirname(__DIR__) . '/_bootstrap.php';

ApiAuth::requireUser(['admin', 'staff']);

$date = (string) ApiRequest::input('date', date('Y-m-d'));
$attendanceModel = new Attendance();

$students = array_map(static function (array $row): array {
    return [
        'id' => (int) $row['id'],
        'name' => $row['name'],
        'course_name' => $row['course_name'],
        'batch_name' => $row['batch_name'],
    ];
}, $attendanceModel->studentsForMarking());

ApiResponse::success('Attendance data fetched successfully.', [
    'date' => $date,
    'students' => $students,
    'marked_statuses' => $attendanceModel->markedStatuses($date),
]);
