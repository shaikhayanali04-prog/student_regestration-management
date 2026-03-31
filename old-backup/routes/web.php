<?php

return [
    ['method' => 'GET', 'path' => '', 'action' => [AuthController::class, 'home']],
    ['method' => 'GET', 'path' => 'login', 'action' => [AuthController::class, 'showLogin']],
    ['method' => 'POST', 'path' => 'auth/login', 'action' => [AuthController::class, 'login']],
    ['method' => 'GET', 'path' => 'logout', 'action' => [AuthController::class, 'logout'], 'options' => ['auth' => true]],

    ['method' => 'GET', 'path' => 'dashboard', 'action' => [DashboardController::class, 'index'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],

    ['method' => 'GET', 'path' => 'students', 'action' => [StudentController::class, 'index'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],
    ['method' => 'GET', 'path' => 'students/create', 'action' => [StudentController::class, 'create'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],
    ['method' => 'POST', 'path' => 'students/store', 'action' => [StudentController::class, 'store'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],
    ['method' => 'GET', 'path' => 'students/{id}/edit', 'action' => [StudentController::class, 'edit'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],
    ['method' => 'POST', 'path' => 'students/{id}/update', 'action' => [StudentController::class, 'update'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],
    ['method' => 'POST', 'path' => 'students/{id}/delete', 'action' => [StudentController::class, 'delete'], 'options' => ['auth' => true, 'roles' => ['admin']]],
    ['method' => 'GET', 'path' => 'students/{id}', 'action' => [StudentController::class, 'show'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],

    ['method' => 'GET', 'path' => 'fees', 'action' => [FeeController::class, 'index'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],
    ['method' => 'GET', 'path' => 'fees/create', 'action' => [FeeController::class, 'create'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],
    ['method' => 'POST', 'path' => 'fees/store', 'action' => [FeeController::class, 'store'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],
    ['method' => 'GET', 'path' => 'fees/export', 'action' => [FeeController::class, 'export'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],
    ['method' => 'GET', 'path' => 'fees/{id}/receipt', 'action' => [FeeController::class, 'receipt'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],
    ['method' => 'GET', 'path' => 'fees/{id}/pay', 'action' => [FeeController::class, 'payForm'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],
    ['method' => 'POST', 'path' => 'fees/{id}/pay', 'action' => [FeeController::class, 'pay'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],

    ['method' => 'GET', 'path' => 'attendance', 'action' => [AttendanceController::class, 'markForm'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],
    ['method' => 'POST', 'path' => 'attendance', 'action' => [AttendanceController::class, 'save'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],
    ['method' => 'GET', 'path' => 'attendance/report', 'action' => [AttendanceController::class, 'report'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],

    ['method' => 'GET', 'path' => 'courses', 'action' => [CourseController::class, 'index'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],
    ['method' => 'POST', 'path' => 'courses/store', 'action' => [CourseController::class, 'store'], 'options' => ['auth' => true, 'roles' => ['admin']]],
    ['method' => 'POST', 'path' => 'courses/{id}/delete', 'action' => [CourseController::class, 'delete'], 'options' => ['auth' => true, 'roles' => ['admin']]],

    ['method' => 'GET', 'path' => 'batches', 'action' => [BatchController::class, 'index'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],
    ['method' => 'POST', 'path' => 'batches/store', 'action' => [BatchController::class, 'store'], 'options' => ['auth' => true, 'roles' => ['admin']]],
    ['method' => 'POST', 'path' => 'batches/{id}/delete', 'action' => [BatchController::class, 'delete'], 'options' => ['auth' => true, 'roles' => ['admin']]],

    ['method' => 'GET', 'path' => 'timetables', 'action' => [TimetableController::class, 'index'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],
    ['method' => 'POST', 'path' => 'timetables/store', 'action' => [TimetableController::class, 'store'], 'options' => ['auth' => true, 'roles' => ['admin']]],
    ['method' => 'POST', 'path' => 'timetables/{id}/delete', 'action' => [TimetableController::class, 'delete'], 'options' => ['auth' => true, 'roles' => ['admin']]],

    ['method' => 'GET', 'path' => 'expenses', 'action' => [ExpenseController::class, 'index'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],
    ['method' => 'POST', 'path' => 'expenses/store', 'action' => [ExpenseController::class, 'store'], 'options' => ['auth' => true, 'roles' => ['admin']]],
    ['method' => 'POST', 'path' => 'expenses/{id}/delete', 'action' => [ExpenseController::class, 'delete'], 'options' => ['auth' => true, 'roles' => ['admin']]],
];
