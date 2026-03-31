<?php

declare(strict_types=1);

class AttendanceController extends BaseController
{
    public function markForm(): void
    {
        $date = (string) input('date', date('Y-m-d'));
        $attendanceModel = new Attendance();

        $this->render('attendance/index', [
            'title' => 'Attendance',
            'date' => $date,
            'students' => $attendanceModel->studentsForMarking(),
            'existingStatuses' => $attendanceModel->markedStatuses($date),
        ]);
    }

    public function save(): void
    {
        verify_csrf();

        $input = $this->validate($_POST, [
            'date' => 'required|date',
        ]);

        $statuses = $_POST['status'] ?? [];

        if (!$statuses) {
            flash('global', 'Please mark attendance for at least one student.', 'danger');
            $this->redirect('attendance');
        }

        (new Attendance())->markDaily($input['date'], $statuses);

        flash('global', 'Attendance saved successfully.', 'success');
        $this->redirect('attendance/report');
    }

    public function report(): void
    {
        $filters = [
            'date_from' => input('date_from', ''),
            'date_to' => input('date_to', ''),
            'status' => input('status', ''),
            'search' => trim((string) input('search', '')),
        ];

        $attendanceModel = new Attendance();

        $this->render('attendance/report', [
            'title' => 'Attendance Report',
            'filters' => $filters,
            'rows' => $attendanceModel->report($filters),
            'lowAttendance' => $attendanceModel->lowAttendanceStudents(),
        ]);
    }
}
