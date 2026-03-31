<?php

declare(strict_types=1);

class ApiAuth
{
    public static function user(): ?array
    {
        return current_user();
    }

    public static function requireUser($roles = ['admin', 'staff']): array
    {
        $user = self::user();

        if (!$user) {
            ApiResponse::error('Unauthenticated.', 401);
        }

        $roles = is_array($roles) ? $roles : [$roles];

        if (!in_array($user['role'], $roles, true)) {
            ApiResponse::error('You do not have permission to perform this action.', 403);
        }

        return $user;
    }
}
