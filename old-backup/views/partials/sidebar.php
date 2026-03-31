<aside class="sidebar-shell">
    <div class="brand-block">
        <span class="sidebar-meta"><i class="fa-solid fa-sparkles"></i> Production ERP Suite</span>
        <h1><?= e(app_config('app_name')) ?></h1>
        <p>Admissions, fees, attendance, and institute operations.</p>
    </div>

    <nav class="nav-stack">
        <a href="<?= e(url('dashboard')) ?>" class="<?= route_is('dashboard') ? 'active' : '' ?>">
            <i class="fa-solid fa-chart-line"></i> Dashboard
        </a>
        <a href="<?= e(url('students')) ?>" class="<?= route_is('students') ? 'active' : '' ?>">
            <i class="fa-solid fa-user-graduate"></i> Students
        </a>
        <a href="<?= e(url('fees')) ?>" class="<?= route_is('fees') ? 'active' : '' ?>">
            <i class="fa-solid fa-money-bill-wave"></i> Fees
        </a>
        <a href="<?= e(url('attendance')) ?>" class="<?= route_is('attendance') ? 'active' : '' ?>">
            <i class="fa-solid fa-calendar-check"></i> Attendance
        </a>
        <a href="<?= e(url('courses')) ?>" class="<?= route_is('courses') ? 'active' : '' ?>">
            <i class="fa-solid fa-book-open"></i> Courses
        </a>
        <a href="<?= e(url('batches')) ?>" class="<?= route_is('batches') ? 'active' : '' ?>">
            <i class="fa-solid fa-layer-group"></i> Batches
        </a>
        <a href="<?= e(url('timetables')) ?>" class="<?= route_is('timetables') ? 'active' : '' ?>">
            <i class="fa-solid fa-clock"></i> Timetable
        </a>
        <a href="<?= e(url('expenses')) ?>" class="<?= route_is('expenses') ? 'active' : '' ?>">
            <i class="fa-solid fa-wallet"></i> Expenses
        </a>
        <a href="<?= e(url('logout')) ?>">
            <i class="fa-solid fa-right-from-bracket"></i> Logout
        </a>
    </nav>
</aside>
