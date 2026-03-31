<?php

declare(strict_types=1);

class ApiTransformer
{
    public static function student(array $student): array
    {
        return [
            'id' => (int) $student['id'],
            'name' => $student['name'],
            'email' => $student['email'],
            'phone' => $student['phone'],
            'guardian_name' => $student['guardian_name'] ?? null,
            'address' => $student['address'] ?? null,
            'course' => $student['course_name'] ?? $student['course'] ?? null,
            'course_id' => isset($student['course_id']) ? (int) $student['course_id'] : null,
            'batch' => $student['batch_name'] ?? null,
            'batch_id' => isset($student['batch_id']) ? (int) $student['batch_id'] : null,
            'join_date' => $student['join_date'] ?? null,
            'status' => $student['status'] ?? 'active',
            'attendance_percent' => isset($student['attendance_percent']) ? (float) $student['attendance_percent'] : null,
            'paid_amount' => isset($student['paid_amount']) ? (float) $student['paid_amount'] : null,
            'remaining_amount' => isset($student['remaining_amount']) ? (float) $student['remaining_amount'] : null,
            'photo' => $student['photo'] ?: null,
            'photo_url' => !empty($student['photo']) ? asset('uploads/students/' . $student['photo']) : null,
            'created_at' => $student['created_at'] ?? null,
        ];
    }

    public static function fee(array $fee, array $installments = []): array
    {
        return [
            'id' => (int) $fee['id'],
            'student_id' => (int) $fee['student_id'],
            'student_name' => $fee['student_name'] ?? null,
            'course_name' => $fee['course_name'] ?? null,
            'phone' => $fee['phone'] ?? null,
            'email' => $fee['email'] ?? null,
            'total_fees' => (float) $fee['total_fees'],
            'paid' => (float) $fee['paid'],
            'remaining' => (float) max((float) $fee['remaining'], 0),
            'status' => $fee['status'] ?? $fee['STATUS'] ?? null,
            'installment_amount' => isset($fee['installment_amount']) ? (float) $fee['installment_amount'] : null,
            'last_payment_date' => $fee['last_payment_date'] ?? null,
            'created_at' => $fee['created_at'] ?? null,
            'installments' => array_map([self::class, 'installment'], $installments),
        ];
    }

    public static function installment(array $installment): array
    {
        return [
            'id' => (int) $installment['id'],
            'fee_id' => (int) $installment['fee_id'],
            'student_id' => (int) $installment['student_id'],
            'amount' => (float) $installment['amount'],
            'payment_date' => $installment['payment_date'],
            'payment_mode' => $installment['payment_mode'],
            'note' => $installment['note'],
            'created_at' => $installment['created_at'] ?? null,
        ];
    }

    public static function attendance(array $row): array
    {
        return [
            'id' => isset($row['id']) ? (int) $row['id'] : null,
            'student_id' => isset($row['student_id']) ? (int) $row['student_id'] : null,
            'student_name' => $row['student_name'] ?? null,
            'course_name' => $row['course_name'] ?? null,
            'batch_name' => $row['batch_name'] ?? null,
            'date' => $row['date'],
            'status' => $row['status'],
        ];
    }
}
