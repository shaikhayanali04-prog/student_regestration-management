<?php

return [
    ['method' => 'GET', 'path' => 'dashboard', 'action' => [ApiController::class, 'dashboard'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],

    ['method' => 'GET', 'path' => 'students', 'action' => [ApiController::class, 'students'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],
    ['method' => 'POST', 'path' => 'students', 'action' => [ApiController::class, 'studentStore'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],
    ['method' => 'GET', 'path' => 'students/{id}', 'action' => [ApiController::class, 'studentShow'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],
    ['method' => 'PUT', 'path' => 'students/{id}', 'action' => [ApiController::class, 'studentUpdate'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],
    ['method' => 'DELETE', 'path' => 'students/{id}', 'action' => [ApiController::class, 'studentDelete'], 'options' => ['auth' => true, 'roles' => ['admin']]],

    ['method' => 'GET', 'path' => 'courses', 'action' => [ApiController::class, 'courses'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],
    ['method' => 'POST', 'path' => 'courses', 'action' => [ApiController::class, 'courseStore'], 'options' => ['auth' => true, 'roles' => ['admin']]],

    ['method' => 'GET', 'path' => 'batches', 'action' => [ApiController::class, 'batches'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],
    ['method' => 'POST', 'path' => 'batches', 'action' => [ApiController::class, 'batchStore'], 'options' => ['auth' => true, 'roles' => ['admin']]],

    ['method' => 'GET', 'path' => 'fees', 'action' => [ApiController::class, 'fees'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],
    ['method' => 'POST', 'path' => 'fees', 'action' => [ApiController::class, 'feeStore'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],
    ['method' => 'POST', 'path' => 'fees/{id}/pay', 'action' => [ApiController::class, 'feePay'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],

    ['method' => 'GET', 'path' => 'attendance', 'action' => [ApiController::class, 'attendance'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],
    ['method' => 'POST', 'path' => 'attendance', 'action' => [ApiController::class, 'attendanceStore'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],

    ['method' => 'GET', 'path' => 'timetables', 'action' => [ApiController::class, 'timetables'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],
    ['method' => 'POST', 'path' => 'timetables', 'action' => [ApiController::class, 'timetableStore'], 'options' => ['auth' => true, 'roles' => ['admin']]],

    ['method' => 'GET', 'path' => 'expenses', 'action' => [ApiController::class, 'expenses'], 'options' => ['auth' => true, 'roles' => ['admin', 'staff']]],
    ['method' => 'POST', 'path' => 'expenses', 'action' => [ApiController::class, 'expenseStore'], 'options' => ['auth' => true, 'roles' => ['admin']]],
];
