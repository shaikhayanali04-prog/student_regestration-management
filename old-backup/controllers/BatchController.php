<?php

declare(strict_types=1);

class BatchController extends BaseController
{
    public function index(): void
    {
        $this->render('batches/index', [
            'title' => 'Batches',
            'batches' => (new Batch())->all(),
            'courses' => (new Course())->options(),
        ]);
    }

    public function store(): void
    {
        verify_csrf();

        $input = $this->validate($_POST, [
            'name' => 'required|max:100',
            'start_date' => 'date',
            'end_date' => 'date',
            'capacity' => 'required|integer|min:0',
            'status' => 'required|in:active,inactive',
        ]);

        (new Batch())->create([
            'name' => $input['name'],
            'course_id' => $_POST['course_id'] ?? null,
            'start_date' => $input['start_date'] ?? null,
            'end_date' => $input['end_date'] ?? null,
            'room_name' => $_POST['room_name'] ?? null,
            'capacity' => (int) $input['capacity'],
            'schedule_summary' => $_POST['schedule_summary'] ?? null,
            'status' => $input['status'],
        ]);

        flash('global', 'Batch created successfully.', 'success');
        $this->redirect('batches');
    }

    public function delete(string $id): void
    {
        verify_csrf();
        (new Batch())->delete((int) $id);
        flash('global', 'Batch deleted successfully.', 'success');
        $this->redirect('batches');
    }
}
