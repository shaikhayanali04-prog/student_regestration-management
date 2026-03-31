<?php

declare(strict_types=1);

class AuthController extends BaseController
{
    public function home(): void
    {
        if (is_logged_in()) {
            $this->redirect('dashboard');
        }

        $this->showLogin();
    }

    public function showLogin(): void
    {
        if (is_logged_in()) {
            $this->redirect('dashboard');
        }

        $this->render('auth/login', [
            'title' => 'Login',
        ], 'guest');
    }

    public function login(): void
    {
        verify_csrf();

        $input = $this->validate($_POST, [
            'username' => 'required|max:50',
            'password' => 'required|max:100',
        ]);

        $userModel = new User();
        $user = $userModel->findByUsername($input['username']);

        if (!$user || !(bool) $user['is_active']) {
            flash('global', 'Invalid username or password.', 'danger');
            remember_old($_POST);
            $this->redirect('login');
        }

        $storedPassword = (string) $user['password'];
        $isHashed = !empty(password_get_info($storedPassword)['algo']);
        $valid = $isHashed
            ? password_verify($input['password'], $storedPassword)
            : hash_equals($storedPassword, $input['password']);

        if (!$valid) {
            flash('global', 'Invalid username or password.', 'danger');
            remember_old($_POST);
            $this->redirect('login');
        }

        if (!$isHashed) {
            $userModel->updatePassword((int) $user['id'], password_hash($input['password'], PASSWORD_DEFAULT));
        }

        session_regenerate_id(false);

        store_user_session([
            'id' => (int) $user['id'],
            'name' => $user['name'],
            'username' => $user['username'],
            'role' => $user['role'],
        ]);

        $userModel->touchLogin((int) $user['id']);

        flash('global', 'Welcome back, ' . $user['name'] . '.', 'success');
        $this->redirect('dashboard');
    }

    public function logout(): void
    {
        logout_user();
        flash('global', 'You have been logged out.', 'success');
        $this->redirect('login');
    }
}
