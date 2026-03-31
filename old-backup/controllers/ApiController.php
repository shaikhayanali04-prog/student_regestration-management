<?php

declare(strict_types=1);

class ApiController extends BaseController
{
    public function dashboard(): void
    {
        $dashboard = new Dashboard();
        $insightEngine = new InsightEngine();

        $this->json([
            'status' => 'success',
            'data' => [
                'overview' => $dashboard->overview(),
                'financials' => $dashboard->monthlyFinancials(),
                'student_growth' => $dashboard->studentGrowth(),
                'smart_insights' => $insightEngine->smartDashboardInsights(),
                'fee_predictions' => $insightEngine->feeDefaultPredictions(),
                'attendance_alerts' => $insightEngine->attendanceRiskAlerts(),
            ],
        ]);
    }

    public function students(): void
    {
        $this->json([
            'status' => 'success',
            'data' => (new Student())->all([
                'search' => trim((string) input('search', '')),
            ]),
        ]);
    }

    public function studentShow(string $id): void
    {
        $profile = (new Student())->profile((int) $id);

        if (empty($profile['student'])) {
            $this->json(['status' => 'error', 'message' => 'Student not found.'], 404);
        }

        $this->json([
            'status' => 'success',
            'data' => $profile,
        ]);
    }

    public function studentStore(): void
    {
        $payload = $this->validate($this->requestPayload(), [
            'name' => 'required|max:100',
            'email' => 'max:100',
            'phone' => 'max:20',
            'status' => 'required|in:active,inactive',
        ]);

        $courseName = null;

        if (!empty($payload['course_id'])) {
            $courseName = (new Course())->find((int) $payload['course_id'])['course_name'] ?? null;
        }

        $id = (new Student())->create([
            'name' => $payload['name'],
            'email' => $payload['email'] ?? null,
            'phone' => $payload['phone'] ?? null,
            'guardian_name' => $payload['guardian_name'] ?? null,
            'address' => $payload['address'] ?? null,
            'course' => $courseName,
            'course_id' => $payload['course_id'] ?? null,
            'batch_id' => $payload['batch_id'] ?? null,
            'join_date' => $payload['join_date'] ?? null,
            'status' => $payload['status'],
            'photo' => null,
        ]);

        $this->json([
            'status' => 'success',
            'message' => 'Student created successfully.',
            'data' => (new Student())->find($id),
        ], 201);
    }

    public function studentUpdate(string $id): void
    {
        $payload = $this->validate($this->requestPayload(), [
            'name' => 'required|max:100',
            'email' => 'max:100',
            'phone' => 'max:20',
            'status' => 'required|in:active,inactive',
        ]);

        $courseName = null;

        if (!empty($payload['course_id'])) {
            $courseName = (new Course())->find((int) $payload['course_id'])['course_name'] ?? null;
        }

        (new Student())->update((int) $id, [
            'name' => $payload['name'],
            'email' => $payload['email'] ?? null,
            'phone' => $payload['phone'] ?? null,
            'guardian_name' => $payload['guardian_name'] ?? null,
            'address' => $payload['address'] ?? null,
            'course' => $courseName,
            'course_id' => $payload['course_id'] ?? null,
            'batch_id' => $payload['batch_id'] ?? null,
            'join_date' => $payload['join_date'] ?? null,
            'status' => $payload['status'],
            'photo' => $payload['photo'] ?? null,
        ]);

        $this->json([
            'status' => 'success',
            'message' => 'Student updated successfully.',
            'data' => (new Student())->find((int) $id),
        ]);
    }

    public function studentDelete(string $id): void
    {
        (new Student())->delete((int) $id);

        $this->json([
            'status' => 'success',
            'message' => 'Student deleted successfully.',
        ]);
    }

    public function courses(): void
    {
        $this->json([
            'status' => 'success',
            'data' => (new Course())->all(),
        ]);
    }

    public function courseStore(): void
    {
        $payload = $this->validate($this->requestPayload(), [
            'course_name' => 'required|max:100',
            'fees' => 'required|numeric|min:0',
            'duration_months' => 'required|integer|min:0',
            'status' => 'required|in:active,inactive',
        ]);

        $id = (new Course())->create([
            'course_name' => $payload['course_name'],
            'code' => $payload['code'] ?? null,
            'fees' => $payload['fees'],
            'description' => $payload['description'] ?? null,
            'duration_months' => $payload['duration_months'],
            'status' => $payload['status'],
        ]);

        $this->json([
            'status' => 'success',
            'message' => 'Course created successfully.',
            'data' => (new Course())->find($id),
        ], 201);
    }

    public function batches(): void
    {
        $this->json([
            'status' => 'success',
            'data' => (new Batch())->all(),
        ]);
    }

    public function batchStore(): void
    {
        $payload = $this->validate($this->requestPayload(), [
            'name' => 'required|max:100',
            'capacity' => 'required|integer|min:0',
            'status' => 'required|in:active,inactive',
        ]);

        $id = (new Batch())->create([
            'name' => $payload['name'],
            'course_id' => $payload['course_id'] ?? null,
            'start_date' => $payload['start_date'] ?? null,
            'end_date' => $payload['end_date'] ?? null,
            'room_name' => $payload['room_name'] ?? null,
            'capacity' => $payload['capacity'],
            'schedule_summary' => $payload['schedule_summary'] ?? null,
            'status' => $payload['status'],
        ]);

        $batch = null;

        foreach ((new Batch())->all() as $row) {
            if ((int) $row['id'] === $id) {
                $batch = $row;
                break;
            }
        }

        $this->json([
            'status' => 'success',
            'message' => 'Batch created successfully.',
            'data' => $batch,
        ], 201);
    }

    public function fees(): void
    {
        $this->json([
            'status' => 'success',
            'data' => (new Fee())->all([
                'search' => trim((string) input('search', '')),
                'status' => input('status', ''),
            ]),
        ]);
    }

    public function feeStore(): void
    {
        $payload = $this->validate($this->requestPayload(), [
            'student_id' => 'required|integer',
            'total_fees' => 'required|numeric|min:0',
            'paid' => 'required|numeric|min:0',
            'installment_amount' => 'required|numeric|min:0',
        ]);

        $id = (new Fee())->createPlan([
            'student_id' => (int) $payload['student_id'],
            'total_fees' => (float) $payload['total_fees'],
            'paid' => (float) $payload['paid'],
            'installment_amount' => (float) $payload['installment_amount'],
            'payment_date' => $payload['payment_date'] ?? date('Y-m-d'),
            'payment_mode' => $payload['payment_mode'] ?? 'Cash',
            'note' => $payload['note'] ?? null,
        ]);

        $this->json([
            'status' => 'success',
            'message' => 'Fee plan created successfully.',
            'data' => (new Fee())->find($id),
        ], 201);
    }

    public function feePay(string $id): void
    {
        $payload = $this->validate($this->requestPayload(), [
            'amount' => 'required|numeric|min:1',
            'payment_date' => 'required|date',
        ]);

        try {
            (new Fee())->addInstallment(
                (int) $id,
                (float) $payload['amount'],
                $payload['payment_date'],
                $payload['payment_mode'] ?? 'Cash',
                $payload['note'] ?? null
            );
        } catch (RuntimeException $exception) {
            $this->json([
                'status' => 'error',
                'message' => $exception->getMessage(),
            ], 422);
        }

        $this->json([
            'status' => 'success',
            'message' => 'Installment added successfully.',
            'data' => (new Fee())->find((int) $id),
        ]);
    }

    public function attendance(): void
    {
        $this->json([
            'status' => 'success',
            'data' => (new Attendance())->report([
                'date_from' => input('date_from', ''),
                'date_to' => input('date_to', ''),
                'status' => input('status', ''),
                'search' => input('search', ''),
            ]),
        ]);
    }

    public function attendanceStore(): void
    {
        $payload = $this->validate($this->requestPayload(), [
            'date' => 'required|date',
        ]);

        $statuses = $payload['status'] ?? [];

        (new Attendance())->markDaily($payload['date'], $statuses);

        $this->json([
            'status' => 'success',
            'message' => 'Attendance saved successfully.',
        ]);
    }

    public function timetables(): void
    {
        $this->json([
            'status' => 'success',
            'data' => (new Timetable())->all(),
        ]);
    }

    public function timetableStore(): void
    {
        $payload = $this->validate($this->requestPayload(), [
            'batch_id' => 'required|integer',
            'day_name' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required',
            'end_time' => 'required',
            'subject_name' => 'required|max:100',
        ]);

        $id = (new Timetable())->create([
            'batch_id' => (int) $payload['batch_id'],
            'day_name' => $payload['day_name'],
            'start_time' => $payload['start_time'],
            'end_time' => $payload['end_time'],
            'subject_name' => $payload['subject_name'],
            'faculty_name' => $payload['faculty_name'] ?? null,
            'room_name' => $payload['room_name'] ?? null,
        ]);

        $row = null;

        foreach ((new Timetable())->all() as $item) {
            if ((int) $item['id'] === $id) {
                $row = $item;
                break;
            }
        }

        $this->json([
            'status' => 'success',
            'message' => 'Timetable created successfully.',
            'data' => $row,
        ], 201);
    }

    public function expenses(): void
    {
        $this->json([
            'status' => 'success',
            'data' => (new Expense())->all(),
        ]);
    }

    public function expenseStore(): void
    {
        $payload = $this->validate($this->requestPayload(), [
            'title' => 'required|max:150',
            'category' => 'required|max:60',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
        ]);

        (new Expense())->create([
            'title' => $payload['title'],
            'category' => $payload['category'],
            'amount' => (float) $payload['amount'],
            'expense_date' => $payload['expense_date'],
            'note' => $payload['note'] ?? null,
        ]);

        $this->json([
            'status' => 'success',
            'message' => 'Expense created successfully.',
        ], 201);
    }
}
