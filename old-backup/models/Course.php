<?php

declare(strict_types=1);

class Course extends BaseModel
{
    public function all(): array
    {
        return $this->db->select(
            'SELECT c.*,
                    COUNT(DISTINCT s.id) AS student_count,
                    COUNT(DISTINCT b.id) AS batch_count
             FROM courses c
             LEFT JOIN students s
                    ON s.course_id = c.id
                    OR (s.course_id IS NULL AND s.course = c.course_name)
             LEFT JOIN batches b ON b.course_id = c.id
             GROUP BY c.id
             ORDER BY c.course_name ASC'
        );
    }

    public function options(): array
    {
        return $this->db->select(
            'SELECT id, course_name, fees
             FROM courses
             WHERE status = "active"
             ORDER BY course_name ASC'
        );
    }

    public function find(int $id): ?array
    {
        return $this->db->selectOne(
            'SELECT * FROM courses WHERE id = :id LIMIT 1',
            ['id' => $id]
        );
    }

    public function create(array $data): int
    {
        return $this->db->insert(
            'INSERT INTO courses (course_name, code, fees, description, duration_months, status)
             VALUES (:course_name, :code, :fees, :description, :duration_months, :status)',
            [
                'course_name' => $data['course_name'],
                'code' => $data['code'] ?: null,
                'fees' => $data['fees'],
                'description' => $data['description'] ?: null,
                'duration_months' => $data['duration_months'],
                'status' => $data['status'],
            ]
        );
    }

    public function delete(int $id): void
    {
        $this->db->execute('DELETE FROM courses WHERE id = :id', ['id' => $id]);
    }
}
