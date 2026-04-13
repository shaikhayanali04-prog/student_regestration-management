<?php

require_once __DIR__ . '/../models/DashboardModel.php';

class DashboardController
{
    private DashboardModel $dashboard;

    public function __construct(PDO $conn)
    {
        $this->dashboard = new DashboardModel($conn);
    }

    public function overview(): void
    {
        jsonResponse(true, 'Dashboard overview fetched successfully', $this->dashboard->overview());
    }
}
