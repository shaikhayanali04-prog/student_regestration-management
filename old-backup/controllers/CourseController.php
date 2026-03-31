<?php

declare(strict_types=1);

class CourseController extends BaseController
{
    public function index(): void
    {
        $this->render('courses/index', [
            'title' => 'Courses',
            'courses' => (new Course())->all(),
        ]);
    }

    public function store(): void
    {
        verify_csrf();

        $input = $this->validate($_POST, [
            'course_name' => 'required|max:100',
            'fees' => 'required|numeric|min:0',
            'duration_months' => 'required|integer|min:0',
            'status' => 'required|in:active,inactive',
        ]);

        (new Course())->create([
            'course_name' => $input['course_name'],
            'code' => $_POST['code'] ?? null,
            'fees' => (float) $input['fees'],
            'description' => $_POST['description'] ?? null,
            'duration_months' => (int) $input['duration_months'],
            'status' => $input['status'],
        ]);

        flash('global', 'Course added successfully.', 'success');
        $this->redirect('courses');
    }

    public function delete(string $id): void
    {
        verify_csrf();
        (new Course())->delete((int) $id);
        flash('global', 'Course deleted successfully.', 'success');
        $this->redirect('courses');
    }
}
