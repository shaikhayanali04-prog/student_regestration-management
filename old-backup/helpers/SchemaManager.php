<?php

declare(strict_types=1);

class SchemaManager
{
    private static bool $bootstrapped = false;

    public static function ensure(): void
    {
        if (self::$bootstrapped) {
            return;
        }

        $db = db();

        $db->execute(
            'CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) NOT NULL DEFAULT "admin",
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                last_login_at DATETIME NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
        );

        $db->execute(
            'CREATE TABLE IF NOT EXISTS batches (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                course_id INT NULL,
                start_date DATE NULL,
                end_date DATE NULL,
                room_name VARCHAR(100) NULL,
                capacity INT NOT NULL DEFAULT 0,
                schedule_summary VARCHAR(150) NULL,
                status VARCHAR(20) NOT NULL DEFAULT "active",
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
        );

        $db->execute(
            'CREATE TABLE IF NOT EXISTS fee_installments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                fee_id INT NOT NULL,
                student_id INT NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                payment_date DATE NOT NULL,
                payment_mode VARCHAR(30) NOT NULL DEFAULT "Cash",
                note VARCHAR(255) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_fee_installments_fee_id (fee_id),
                INDEX idx_fee_installments_student_id (student_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
        );

        $db->execute(
            'CREATE TABLE IF NOT EXISTS timetables (
                id INT AUTO_INCREMENT PRIMARY KEY,
                batch_id INT NOT NULL,
                day_name VARCHAR(20) NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                subject_name VARCHAR(100) NOT NULL,
                faculty_name VARCHAR(100) NULL,
                room_name VARCHAR(100) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_timetables_batch_id (batch_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
        );

        $db->execute(
            'CREATE TABLE IF NOT EXISTS expenses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(150) NOT NULL,
                category VARCHAR(60) NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                expense_date DATE NOT NULL,
                note TEXT NULL,
                created_by INT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
        );

        self::addColumnIfMissing('students', 'course_id', 'INT NULL AFTER course');
        self::addColumnIfMissing('students', 'batch_id', 'INT NULL AFTER course_id');
        self::addColumnIfMissing('students', 'guardian_name', 'VARCHAR(100) NULL AFTER phone');
        self::addColumnIfMissing('students', 'address', 'TEXT NULL AFTER guardian_name');
        self::addColumnIfMissing('students', 'join_date', 'DATE NULL AFTER batch_id');
        self::addColumnIfMissing('students', 'status', 'VARCHAR(20) NOT NULL DEFAULT "active" AFTER join_date');

        self::addColumnIfMissing('courses', 'code', 'VARCHAR(30) NULL AFTER course_name');
        self::addColumnIfMissing('courses', 'description', 'TEXT NULL AFTER fees');
        self::addColumnIfMissing('courses', 'duration_months', 'INT NOT NULL DEFAULT 0 AFTER description');
        self::addColumnIfMissing('courses', 'status', 'VARCHAR(20) NOT NULL DEFAULT "active" AFTER duration_months');
        self::addColumnIfMissing('courses', 'created_at', 'TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP AFTER status');

        self::deduplicateAttendance();
        self::addIndexIfMissing('attendance', 'uniq_student_date', 'ALTER TABLE attendance ADD UNIQUE INDEX uniq_student_date (student_id, date)');

        self::normalizeFeeBalances();
        self::syncLegacyAdmins();
        self::syncLegacyCourses();
        self::backfillInstallments();

        self::$bootstrapped = true;
    }

    private static function addColumnIfMissing(string $table, string $column, string $definition): void
    {
        $exists = db()->scalar("SHOW COLUMNS FROM `{$table}` LIKE '{$column}'");

        if ($exists === null) {
            try {
                db()->execute("ALTER TABLE `{$table}` ADD COLUMN `{$column}` {$definition}");
            } catch (PDOException $exception) {
                if ((int) $exception->errorInfo[1] !== 1060) {
                    throw $exception;
                }
            }
        }
    }

    private static function addIndexIfMissing(string $table, string $indexName, string $sql): void
    {
        $exists = db()->selectOne("SHOW INDEX FROM `{$table}` WHERE Key_name = :index_name", [
            'index_name' => $indexName,
        ]);

        if ($exists === null) {
            try {
                db()->execute($sql);
            } catch (PDOException $exception) {
                if ((int) $exception->errorInfo[1] !== 1061) {
                    throw $exception;
                }
            }
        }
    }

    private static function deduplicateAttendance(): void
    {
        db()->execute(
            'DELETE a1 FROM attendance a1
             INNER JOIN attendance a2
                ON a1.student_id = a2.student_id
               AND a1.date = a2.date
               AND a1.id > a2.id'
        );
    }

    private static function syncLegacyAdmins(): void
    {
        $admins = db()->select('SELECT id, username, password FROM admins');

        foreach ($admins as $admin) {
            $existing = db()->selectOne('SELECT id FROM users WHERE username = :username', [
                'username' => $admin['username'],
            ]);

            if ($existing) {
                continue;
            }

            $password = self::isPasswordHash((string) $admin['password'])
                ? $admin['password']
                : password_hash((string) $admin['password'], PASSWORD_DEFAULT);

            db()->insert(
                'INSERT INTO users (name, username, password, role) VALUES (:name, :username, :password, :role)',
                [
                    'name' => ucfirst((string) $admin['username']),
                    'username' => $admin['username'],
                    'password' => $password,
                    'role' => 'admin',
                ]
            );
        }
    }

    private static function normalizeFeeBalances(): void
    {
        db()->execute(
            'UPDATE fees
             SET remaining = GREATEST(total_fees - paid, 0),
                 `STATUS` = CASE WHEN GREATEST(total_fees - paid, 0) <= 0 THEN "Paid" ELSE "Pending" END'
        );
    }

    private static function syncLegacyCourses(): void
    {
        $legacyCourses = db()->select(
            'SELECT DISTINCT TRIM(course) AS course_name FROM students WHERE course IS NOT NULL AND TRIM(course) != ""'
        );

        foreach ($legacyCourses as $course) {
            $existing = db()->selectOne('SELECT id FROM courses WHERE course_name = :course_name', [
                'course_name' => $course['course_name'],
            ]);

            if ($existing) {
                continue;
            }

            db()->insert(
                'INSERT INTO courses (course_name, fees, description, duration_months, status)
                 VALUES (:course_name, :fees, :description, :duration_months, :status)',
                [
                    'course_name' => $course['course_name'],
                    'fees' => 0,
                    'description' => null,
                    'duration_months' => 0,
                    'status' => 'active',
                ]
            );
        }

        $students = db()->select('SELECT id, course, course_id FROM students');

        foreach ($students as $student) {
            if (!empty($student['course_id']) || empty($student['course'])) {
                continue;
            }

            $course = db()->selectOne('SELECT id FROM courses WHERE course_name = :course_name', [
                'course_name' => $student['course'],
            ]);

            if ($course) {
                db()->execute('UPDATE students SET course_id = :course_id WHERE id = :id', [
                    'course_id' => $course['id'],
                    'id' => $student['id'],
                ]);
            }
        }
    }

    private static function backfillInstallments(): void
    {
        $fees = db()->select(
            'SELECT id, student_id, paid, created_at, last_payment_date
             FROM fees
             WHERE paid > 0'
        );

        foreach ($fees as $fee) {
            $existing = (int) db()->scalar(
                'SELECT COUNT(*) FROM fee_installments WHERE fee_id = :fee_id',
                ['fee_id' => $fee['id']]
            );

            if ($existing > 0) {
                continue;
            }

            db()->insert(
                'INSERT INTO fee_installments (fee_id, student_id, amount, payment_date, payment_mode, note)
                 VALUES (:fee_id, :student_id, :amount, :payment_date, :payment_mode, :note)',
                [
                    'fee_id' => $fee['id'],
                    'student_id' => $fee['student_id'],
                    'amount' => $fee['paid'],
                    'payment_date' => $fee['last_payment_date'] ?: date('Y-m-d', strtotime((string) $fee['created_at'])),
                    'payment_mode' => 'Legacy',
                    'note' => 'Backfilled from legacy fees data',
                ]
            );
        }
    }

    private static function isPasswordHash(string $value): bool
    {
        return !empty(password_get_info($value)['algo']);
    }
}
