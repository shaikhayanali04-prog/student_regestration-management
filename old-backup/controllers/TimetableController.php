<?php

declare(strict_types=1);

class TimetableController extends BaseController
{
    public function index(): void
    {
        $this->render('timetables/index', [
            'title' => 'Timetable',
            'rows' => (new Timetable())->all(),
            'batches' => (new Batch())->options(),
        ]);
    }

    public function store(): void
    {
        verify_csrf();

        $input = $this->validate($_POST, [
            'batch_id' => 'required|integer',
            'day_name' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required',
            'end_time' => 'required',
            'subject_name' => 'required|max:100',
            'faculty_name' => 'max:100',
        ]);

        (new Timetable())->create([
            'batch_id' => (int) $input['batch_id'],
            'day_name' => $input['day_name'],
            'start_time' => $_POST['start_time'],
            'end_time' => $_POST['end_time'],
            'subject_name' => $input['subject_name'],
            'faculty_name' => $input['faculty_name'] ?? null,
            'room_name' => $_POST['room_name'] ?? null,
        ]);

        flash('global', 'Timetable entry added successfully.', 'success');
        $this->redirect('timetables');
    }

    public function delete(string $id): void
    {
        verify_csrf();
        (new Timetable())->delete((int) $id);
        flash('global', 'Timetable entry deleted successfully.', 'success');
        $this->redirect('timetables');
    }
}
