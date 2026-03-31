<div class="auth-card">
    <div class="auth-side">
        <span class="auth-badge">Coaching Institute ERP</span>
        <h1>Operate your institute like a real product.</h1>
        <p class="mb-4">Track students, fee collections, attendance, courses, batches, expenses, and risk alerts from a single admin workspace.</p>

        <div class="quick-grid">
            <div class="card-surface p-3 text-dark">
                <strong>Smart Fee Alerts</strong>
                <p class="soft-note mb-0 mt-2">Predict defaults using payment history and reminder triggers.</p>
            </div>
            <div class="card-surface p-3 text-dark">
                <strong>Attendance Risking</strong>
                <p class="soft-note mb-0 mt-2">Spot low-attendance students before they disengage.</p>
            </div>
        </div>
    </div>

    <div class="auth-form">
        <h3 class="fw-bold mb-2">Admin Login</h3>
        <p class="text-muted mb-4">Use your admin or staff credentials to continue.</p>

        <form method="POST" action="<?= e(url('auth/login')) ?>">
            <?= csrf_field() ?>

            <div class="mb-3">
                <label class="form-label">Username</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="fa-solid fa-user"></i></span>
                    <input type="text" name="username" class="form-control" value="<?= e(old('username')) ?>" required>
                </div>
            </div>

            <div class="mb-4">
                <label class="form-label">Password</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="fa-solid fa-lock"></i></span>
                    <input type="password" name="password" class="form-control" required>
                </div>
            </div>

            <button class="btn btn-dark w-100 py-2">Login to ERP</button>
        </form>
    </div>
</div>
