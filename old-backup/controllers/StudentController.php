<?php

declare(strict_types=1);

class StudentController extends BaseController
{
    public function index(): void
    {
        $studentModel = new Student();

        $filters = [
            'search' => trim((string) input('search', '')),
            'course_id' => input('course_id', ''),
            'batch_id' => input('batch_id', ''),
            'status' => input('status', ''),
        ];

        $this->render('students/index', [
            'title' => 'Students',
            'students' => $studentModel->all($filters),
            'filters' => $filters,
            'courses' => (new Course())->options(),
            'batches' => (new Batch())->options(),
        ]);
    }

    public function create(): void
    {
        $this->render('students/form', [
            'title' => 'Add Student',
            'student' => null,
            'courses' => (new Course())->options(),
            'batches' => (new Batch())->options(),
            'action' => url('students/store'),
        ]);
    }

    public function store(): void
    {
        verify_csrf();

        $input = $this->validate($_POST, [
            'name' => 'required|max:100',
            'email' => 'max:100',
            'phone' => 'max:20',
            'guardian_name' => 'max:100',
            'join_date' => 'date',
            'status' => 'required|in:active,inactive',
        ]);

        $course = null;

        if (!empty($input['course_id'])) {
            $courseRecord = (new Course())->find((int) $input['course_id']);
            $course = $courseRecord['course_name'] ?? null;
        }

        try {
            $photo = UploadHelper::storeStudentPhoto($_FILES['photo'] ?? [], null);
        } catch (RuntimeException $exception) {
            remember_old($_POST);
            flash('global', $exception->getMessage(), 'danger');
            $this->redirect('students/create');
        }

        (new Student())->create([
            'name' => $input['name'],
            'email' => $input['email'] ?? null,
            'phone' => $input['phone'] ?? null,
            'guardian_name' => $input['guardian_name'] ?? null,
            'address' => $_POST['address'] ?? null,
            'course' => $course,
            'course_id' => $_POST['course_id'] ?? null,
            'batch_id' => $_POST['batch_id'] ?? null,
            'join_date' => $input['join_date'] ?? null,
            'status' => $input['status'],
            'photo' => $photo,
        ]);

        flash('global', 'Student created successfully.', 'success');
        $this->redirect('students');
    }

    public function show(string $id): void
    {
        $profile = (new Student())->profile((int) $id);

        if (empty($profile['student'])) {
            Response::abort(404, 'Student not found.');
        }

        $this->render('students/show', [
            'title' => 'Student Profile',
            'profile' => $profile,
        ]);
    }

    public function edit(string $id): void
    {
        $student = (new Student())->find((int) $id);

        if (!$student) {
            Response::abort(404, 'Student not found.');
        }

        $this->render('students/form', [
            'title' => 'Edit Student',
            'student' => $student,
            'courses' => (new Course())->options(),
            'batches' => (new Batch())->options(),
            'action' => url('students/' . $id . '/update'),
        ]);
    }

    public function update(string $id): void
    {
        verify_csrf();

        $studentModel = new Student();
        $student = $studentModel->find((int) $id);

        if (!$student) {
            Response::abort(404, 'Student not found.');
        }

        $input = $this->validate($_POST, [
            'name' => 'required|max:100',
            'email' => 'max:100',
            'phone' => 'max:20',
            'guardian_name' => 'max:100',
            'join_date' => 'date',
            'status' => 'required|in:active,inactive',
        ]);

        $course = null;

        if (!empty($_POST['course_id'])) {
            $courseRecord = (new Course())->find((int) $_POST['course_id']);
            $course = $courseRecord['course_name'] ?? null;
        }

        try {
            $photo = UploadHelper::storeStudentPhoto($_FILES['photo'] ?? [], $student['photo'] ?? null);
        } catch (RuntimeException $exception) {
            remember_old($_POST);
            flash('global', $exception->getMessage(), 'danger');
            $this->redirect('students/' . $id . '/edit');
        }

        $studentModel->update((int) $id, [
            'name' => $input['name'],
            'email' => $input['email'] ?? null,
            'phone' => $input['phone'] ?? null,
            'guardian_name' => $input['guardian_name'] ?? null,
            'address' => $_POST['address'] ?? null,
            'course' => $course,
            'course_id' => $_POST['course_id'] ?? null,
            'batch_id' => $_POST['batch_id'] ?? null,
            'join_date' => $input['join_date'] ?? null,
            'status' => $input['status'],
            'photo' => $photo,
        ]);

        flash('global', 'Student updated successfully.', 'success');
        $this->redirect('students');
    }

    public function delete(string $id): void
    {
        verify_csrf();
        (new Student())->delete((int) $id);
        flash('global', 'Student removed successfully.', 'success');
        $this->redirect('students');
    }
}
