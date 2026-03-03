<?php
session_start();
include "db.php";

if(!isset($_SESSION['admin'])){
    header("Location: index.php");
    exit();
}

// TOTAL STUDENTS
$student_query = mysqli_query($conn,"SELECT COUNT(*) as total FROM students");
$student_data = mysqli_fetch_assoc($student_query);

// TOTAL COURSES
$course_query = mysqli_query($conn,"SELECT COUNT(*) as total FROM courses");
$course_data = mysqli_fetch_assoc($course_query);

// TOTAL FEES COLLECTED
$collected_query = mysqli_query($conn,"SELECT SUM(paid) as total FROM fees");
$collected_data = mysqli_fetch_assoc($collected_query);

// TOTAL PENDING
$pending_query = mysqli_query($conn,"SELECT SUM(remaining) as total FROM fees");
$pending_data = mysqli_fetch_assoc($pending_query);
?>

<!DOCTYPE html>
<html>
<head>
    <title>Admin Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>

<body>

<div class="d-flex">

    <!-- SIDEBAR -->
    <div class="bg-dark text-white p-3" style="width: 250px; min-height: 100vh;">
        <h4>Admin Panel</h4>
        <hr>

        <a href="dashboard.php" class="text-white d-block mb-2">🏠 Dashboard</a>
        <a href="admin/add_student.php" class="text-white d-block mb-2">➕ Add Student</a>
        <a href="admin/view_students.php" class="text-white d-block mb-2">📋 View Students</a>
        <a href="admin/add_fees.php" class="text-white d-block mb-2">💰 Add Fees</a>
        <a href="admin/view_fees.php" class="text-white d-block mb-2">📊 View Fees</a>
        <a href="logout.php" class="text-danger d-block mt-4">🚪 Logout</a>
    </div>

    <!-- MAIN CONTENT -->
    <div class="flex-grow-1 p-4">

        <h2>Welcome, <?php echo $_SESSION['admin']; ?> 👋</h2>
        <hr>

        <div class="row g-4 mt-2">

            <!-- Students -->
            <div class="col-md-3">
                <div class="card shadow">
                    <div class="card-body text-center">
                        <h5>Total Students</h5>
                        <h3><?php echo $student_data['total']; ?></h3>
                    </div>
                </div>
            </div>

            <!-- Courses -->
            <div class="col-md-3">
                <div class="card shadow">
                    <div class="card-body text-center">
                        <h5>Total Courses</h5>
                        <h3><?php echo $course_data['total']; ?></h3>
                    </div>
                </div>
            </div>

            <!-- Fees Collected -->
            <div class="col-md-3">
                <div class="card shadow">
                    <div class="card-body text-center">
                        <h5>Fees Collected</h5>
                        <h3>₹ <?php echo $collected_data['total'] ?? 0; ?></h3>
                    </div>
                </div>
            </div>

            <!-- Pending -->
            <div class="col-md-3">
                <div class="card shadow">
                    <div class="card-body text-center">
                        <h5>Total Pending</h5>
                        <h3>₹ <?php echo $pending_data['total'] ?? 0; ?></h3>
                    </div>
                </div>
            </div>

        </div>

    </div>

</div>

</body>
</html>