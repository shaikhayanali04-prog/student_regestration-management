<?php

declare(strict_types=1);

class User extends BaseModel
{
    public function findByUsername(string $username): ?array
    {
        return $this->db->selectOne(
            'SELECT id, name, username, password, role, is_active
             FROM users
             WHERE username = :username
             LIMIT 1',
            ['username' => $username]
        );
    }

    public function updatePassword(int $id, string $passwordHash): void
    {
        $this->db->execute(
            'UPDATE users SET password = :password WHERE id = :id',
            [
                'password' => $passwordHash,
                'id' => $id,
            ]
        );
    }

    public function touchLogin(int $id): void
    {
        $this->db->execute(
            'UPDATE users SET last_login_at = NOW() WHERE id = :id',
            ['id' => $id]
        );
    }
}
