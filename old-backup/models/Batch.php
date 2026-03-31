<?php

declare(strict_types=1);

class Batch extends BaseModel
{
    public function all(): array
    {
        return $this->db->select(
            'SELECT b.*,
                    c.course_name,
                    COUNT(s.id) AS student_count
             FROM batches b
             LEFT JOIN courses c ON c.id = b.course_id
             LEFT JOIN students s ON s.batch_id = b.id
             GROUP BY b.id
             ORDER BY b.start_date DESC, b.id DESC'
        );
    }

    public function options(): array
    {
        return $this->db->select(
            'SELECT id, name
             FROM batches
             WHERE status = "active"
             ORDER BY name ASC'
        );
    }

    public function create(array $data): int
    {
        return $this->db->insert(
            'INSERT INTO batches (name, course_id, start_date, end_date, room_name, capacity, schedule_summary, status)
             VALUES (:name, :course_id, :start_date, :end_date, :room_name, :capacity, :schedule_summary, :status)',
            [
                'name' => $data['name'],
                'course_id' => $data['course_id'] ?: null,
                'start_date' => $data['start_date'] ?: null,
                'end_date' => $data['end_date'] ?: null,
                'room_name' => $data['room_name'] ?: null,
                'capacity' => $data['capacity'],
                'schedule_summary' => $data['schedule_summary'] ?: null,
                'status' => $data['status'],
            ]
        );
    }

    public function delete(int $id): void
    {
        $this->db->execute('DELETE FROM batches WHERE id = :id', ['id' => $id]);
    }
}
