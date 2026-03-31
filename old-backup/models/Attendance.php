<?php

declare(strict_types=1);

class Attendance extends BaseModel
{
    public function studentsForMarking(): array
    {
        return $this->db->select(
            'SELECT s.id, s.name, COALESCE(c.course_name, s.course) AS course_name, b.name AS batch_name
             FROM students s
             LEFT JOIN courses c ON c.id = s.course_id
             LEFT JOIN batches b ON b.id = s.batch_id
             WHERE s.status = "active"
             ORDER BY s.name ASC'
        );
    }

    public function markedStatuses(string $date): array
    {
        $rows = $this->db->select(
            'SELECT student_id, status
             FROM attendance
             WHERE date = :date',
            ['date' => $date]
        );

        $indexed = [];

        foreach ($rows as $row) {
            $indexed[$row['student_id']] = $row['status'];
        }

        return $indexed;
    }

    public function markDaily(string $date, array $statuses): int
    {
        return $this->db->transaction(function (Database $db) use ($date, $statuses): int {
            $count = 0;

            foreach ($statuses as $studentId => $status) {
                $db->execute(
                    'INSERT INTO attendance (student_id, date, status)
                     VALUES (:student_id, :date, :status)
                     ON DUPLICATE KEY UPDATE status = VALUES(status)',
                    [
                        'student_id' => $studentId,
                        'date' => $date,
                        'status' => $status,
                    ]
                );

                $count++;
            }

            return $count;
        });
    }

    public function report(array $filters = []): array
    {
        $sql = 'SELECT a.*,
                       s.name AS student_name,
                       COALESCE(c.course_name, s.course) AS course_name,
                       b.name AS batch_name
                FROM attendance a
                INNER JOIN students s ON s.id = a.student_id
                LEFT JOIN courses c ON c.id = s.course_id
                LEFT JOIN batches b ON b.id = s.batch_id
                WHERE 1 = 1';

        $params = [];

        if (!empty($filters['date_from'])) {
            $sql .= ' AND a.date >= :date_from';
            $params['date_from'] = $filters['date_from'];
        }

        if (!empty($filters['date_to'])) {
            $sql .= ' AND a.date <= :date_to';
            $params['date_to'] = $filters['date_to'];
        }

        if (!empty($filters['status'])) {
            $sql .= ' AND a.status = :status';
            $params['status'] = $filters['status'];
        }

        if (!empty($filters['search'])) {
            $sql .= ' AND s.name LIKE :search';
            $params['search'] = '%' . $filters['search'] . '%';
        }

        $sql .= ' ORDER BY a.date DESC, s.name ASC';

        return $this->db->select($sql, $params);
    }

    public function distribution(): array
    {
        $row = $this->db->selectOne(
            'SELECT SUM(CASE WHEN status = "Present" THEN 1 ELSE 0 END) AS present_count,
                    SUM(CASE WHEN status = "Absent" THEN 1 ELSE 0 END) AS absent_count
             FROM attendance'
        ) ?? ['present_count' => 0, 'absent_count' => 0];

        return [
            'present' => (int) $row['present_count'],
            'absent' => (int) $row['absent_count'],
        ];
    }

    public function lowAttendanceStudents(int $threshold = 75, int $limit = 10): array
    {
        return $this->db->select(
            'SELECT s.id,
                    s.name,
                    ROUND(COALESCE(SUM(CASE WHEN a.status = "Present" THEN 1 ELSE 0 END) / NULLIF(COUNT(a.id), 0) * 100, 0), 0) AS attendance_percent,
                    COUNT(a.id) AS attendance_days
             FROM students s
             LEFT JOIN attendance a ON a.student_id = s.id
             GROUP BY s.id
             HAVING attendance_percent < :threshold AND attendance_days > 0
             ORDER BY attendance_percent ASC
             LIMIT ' . (int) $limit,
            ['threshold' => $threshold]
        );
    }
}
