<?php

declare(strict_types=1);

class Timetable extends BaseModel
{
    public function all(): array
    {
        return $this->db->select(
            'SELECT t.*,
                    b.name AS batch_name,
                    c.course_name
             FROM timetables t
             INNER JOIN batches b ON b.id = t.batch_id
             LEFT JOIN courses c ON c.id = b.course_id
             ORDER BY FIELD(t.day_name, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"),
                      t.start_time ASC'
        );
    }

    public function upcomingForDay(string $dayName): array
    {
        return $this->db->select(
            'SELECT t.*, b.name AS batch_name, c.course_name
             FROM timetables t
             INNER JOIN batches b ON b.id = t.batch_id
             LEFT JOIN courses c ON c.id = b.course_id
             WHERE t.day_name = :day_name
             ORDER BY t.start_time ASC
             LIMIT 5',
            ['day_name' => $dayName]
        );
    }

    public function create(array $data): int
    {
        return $this->db->insert(
            'INSERT INTO timetables (batch_id, day_name, start_time, end_time, subject_name, faculty_name, room_name)
             VALUES (:batch_id, :day_name, :start_time, :end_time, :subject_name, :faculty_name, :room_name)',
            [
                'batch_id' => $data['batch_id'],
                'day_name' => $data['day_name'],
                'start_time' => $data['start_time'],
                'end_time' => $data['end_time'],
                'subject_name' => $data['subject_name'],
                'faculty_name' => $data['faculty_name'] ?: null,
                'room_name' => $data['room_name'] ?: null,
            ]
        );
    }

    public function delete(int $id): void
    {
        $this->db->execute('DELETE FROM timetables WHERE id = :id', ['id' => $id]);
    }
}
