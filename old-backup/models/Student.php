<?php

declare(strict_types=1);

class Student extends BaseModel
{
    public function all(array $filters = []): array
    {
        $sql = 'SELECT s.*,
                       COALESCE(c.course_name, s.course) AS course_name,
                       b.name AS batch_name,
                       COALESCE(f.total_fees, 0) AS total_fees,
                       COALESCE(f.paid, 0) AS paid_amount,
                       COALESCE(f.remaining, 0) AS remaining_amount,
                       ROUND(COALESCE(att.present_count / NULLIF(att.total_count, 0) * 100, 0), 0) AS attendance_percent
                FROM students s
                LEFT JOIN courses c ON c.id = s.course_id
                LEFT JOIN batches b ON b.id = s.batch_id
                LEFT JOIN (
                    SELECT f1.*
                    FROM fees f1
                    INNER JOIN (
                        SELECT student_id, MAX(id) AS latest_id
                        FROM fees
                        GROUP BY student_id
                    ) latest_fee ON latest_fee.latest_id = f1.id
                ) f ON f.student_id = s.id
                LEFT JOIN (
                    SELECT student_id,
                           SUM(CASE WHEN status = "Present" THEN 1 ELSE 0 END) AS present_count,
                           COUNT(*) AS total_count
                    FROM attendance
                    GROUP BY student_id
                ) att ON att.student_id = s.id
                WHERE 1 = 1';

        $params = [];

        if (!empty($filters['search'])) {
            $sql .= ' AND (s.name LIKE :search OR s.email LIKE :search OR s.phone LIKE :search)';
            $params['search'] = '%' . $filters['search'] . '%';
        }

        if (!empty($filters['course_id'])) {
            $sql .= ' AND s.course_id = :course_id';
            $params['course_id'] = $filters['course_id'];
        }

        if (!empty($filters['batch_id'])) {
            $sql .= ' AND s.batch_id = :batch_id';
            $params['batch_id'] = $filters['batch_id'];
        }

        if (!empty($filters['status'])) {
            $sql .= ' AND s.status = :status';
            $params['status'] = $filters['status'];
        }

        $sql .= ' ORDER BY s.id DESC';

        return $this->db->select($sql, $params);
    }

    public function options(): array
    {
        return $this->db->select(
            'SELECT id, name
             FROM students
             ORDER BY name ASC'
        );
    }

    public function find(int $id): ?array
    {
        return $this->db->selectOne(
            'SELECT s.*, COALESCE(c.course_name, s.course) AS course_name, b.name AS batch_name
             FROM students s
             LEFT JOIN courses c ON c.id = s.course_id
             LEFT JOIN batches b ON b.id = s.batch_id
             WHERE s.id = :id
             LIMIT 1',
            ['id' => $id]
        );
    }

    public function create(array $data): int
    {
        return $this->db->insert(
            'INSERT INTO students (
                name, email, phone, guardian_name, address, course, course_id, batch_id, join_date, status, photo
             ) VALUES (
                :name, :email, :phone, :guardian_name, :address, :course, :course_id, :batch_id, :join_date, :status, :photo
             )',
            [
                'name' => $data['name'],
                'email' => $data['email'] ?: null,
                'phone' => $data['phone'] ?: null,
                'guardian_name' => $data['guardian_name'] ?: null,
                'address' => $data['address'] ?: null,
                'course' => $data['course'] ?: null,
                'course_id' => $data['course_id'] ?: null,
                'batch_id' => $data['batch_id'] ?: null,
                'join_date' => $data['join_date'] ?: null,
                'status' => $data['status'],
                'photo' => $data['photo'] ?: null,
            ]
        );
    }

    public function update(int $id, array $data): void
    {
        $this->db->execute(
            'UPDATE students
             SET name = :name,
                 email = :email,
                 phone = :phone,
                 guardian_name = :guardian_name,
                 address = :address,
                 course = :course,
                 course_id = :course_id,
                 batch_id = :batch_id,
                 join_date = :join_date,
                 status = :status,
                 photo = :photo
             WHERE id = :id',
            [
                'id' => $id,
                'name' => $data['name'],
                'email' => $data['email'] ?: null,
                'phone' => $data['phone'] ?: null,
                'guardian_name' => $data['guardian_name'] ?: null,
                'address' => $data['address'] ?: null,
                'course' => $data['course'] ?: null,
                'course_id' => $data['course_id'] ?: null,
                'batch_id' => $data['batch_id'] ?: null,
                'join_date' => $data['join_date'] ?: null,
                'status' => $data['status'],
                'photo' => $data['photo'] ?: null,
            ]
        );
    }

    public function delete(int $id): void
    {
        $student = $this->find($id);

        $this->db->transaction(function (Database $db) use ($id, $student): void {
            $db->execute('DELETE FROM fee_installments WHERE student_id = :student_id', ['student_id' => $id]);
            $db->execute('DELETE FROM fees WHERE student_id = :student_id', ['student_id' => $id]);
            $db->execute('DELETE FROM attendance WHERE student_id = :student_id', ['student_id' => $id]);
            $db->execute('DELETE FROM students WHERE id = :id', ['id' => $id]);
        });

        if (!empty($student['photo'])) {
            $photoPath = app_config('upload_dir') . DIRECTORY_SEPARATOR . $student['photo'];

            if (is_file($photoPath)) {
                @unlink($photoPath);
            }
        }
    }

    public function profile(int $id): array
    {
        $student = $this->find($id);
        $fees = $this->db->select(
            'SELECT f.*,
                    (SELECT COUNT(*) FROM fee_installments fi WHERE fi.fee_id = f.id) AS installment_count
             FROM fees f
             WHERE f.student_id = :student_id
             ORDER BY f.id DESC',
            ['student_id' => $id]
        );

        $installments = $this->db->select(
            'SELECT fi.*
             FROM fee_installments fi
             WHERE fi.student_id = :student_id
             ORDER BY fi.payment_date DESC, fi.id DESC',
            ['student_id' => $id]
        );

        $attendance = $this->db->select(
            'SELECT date, status
             FROM attendance
             WHERE student_id = :student_id
             ORDER BY date DESC
             LIMIT 20',
            ['student_id' => $id]
        );

        $summary = $this->db->selectOne(
            'SELECT SUM(CASE WHEN status = "Present" THEN 1 ELSE 0 END) AS present_count,
                    COUNT(*) AS total_count
             FROM attendance
             WHERE student_id = :student_id',
            ['student_id' => $id]
        ) ?? ['present_count' => 0, 'total_count' => 0];

        $attendancePercent = (int) round(
            ((int) $summary['present_count']) / max((int) $summary['total_count'], 1) * 100
        );

        return [
            'student' => $student,
            'fees' => $fees,
            'installments' => $installments,
            'attendance' => $attendance,
            'attendance_percent' => $summary['total_count'] ? $attendancePercent : 0,
        ];
    }
}
