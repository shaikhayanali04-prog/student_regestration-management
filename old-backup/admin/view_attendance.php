<?php
require __DIR__ . '/../config/bootstrap.php';
redirect_to(url('attendance/report'));

session_start();
require "../db.php";

if(!isset($_SESSION['admin'])){
header("Location: ../index.php");
exit();
}

$query = "
SELECT attendance.*, students.name 
FROM attendance
JOIN students ON attendance.student_id = students.id
ORDER BY attendance.date DESC
";

$result = mysqli_query($conn,$query);
?>

<!DOCTYPE html>
<html>
<head>

<title>Attendance Records</title>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

</head>

<body>

<div class="container mt-5">

<h3 class="mb-4">Attendance Records</h3>

<table class="table table-bordered table-striped">

<tr>
<th>ID</th>
<th>Student</th>
<th>Date</th>
<th>Status</th>
</tr>

<?php while($row = mysqli_fetch_assoc($result)){ ?>

<tr>

<td><?php echo $row['id']; ?></td>

<td><?php echo $row['name']; ?></td>

<td><?php echo $row['date']; ?></td>

<td>

<?php if($row['status']=="Present"){ ?>

<span class="badge bg-success">Present</span>

<?php } else { ?>

<span class="badge bg-danger">Absent</span>

<?php } ?>

</td>

</tr>

<?php } ?>

</table>

</div>

</body>
</html>
