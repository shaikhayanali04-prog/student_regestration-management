<?php
require __DIR__ . '/../config/bootstrap.php';
redirect_to(url('students/' . ((string) ($_GET['id'] ?? ''))));

session_start();
require "../db.php";

if(!isset($_SESSION['admin'])){
header("Location: ../index.php");
exit();
}

$id = $_GET['id'];

/* Student Info */

$student = mysqli_fetch_assoc(mysqli_query($conn,"
SELECT * FROM students WHERE id='$id'
"));

/* Fees Records */

$fees = mysqli_query($conn,"
SELECT * FROM fees WHERE student_id='$id'
");

/* Attendance Records */

$attendance = mysqli_query($conn,"
SELECT * FROM attendance WHERE student_id='$id'
");

/* Attendance Stats */

$present = mysqli_fetch_assoc(mysqli_query($conn,"
SELECT COUNT(*) as total FROM attendance
WHERE student_id='$id' AND status='Present'
"));

$total = mysqli_fetch_assoc(mysqli_query($conn,"
SELECT COUNT(*) as total FROM attendance
WHERE student_id='$id'
"));

$percent = 0;

if($total['total'] > 0){
$percent = round(($present['total'] / $total['total']) * 100);
}

?>

<!DOCTYPE html>
<html>
<head>

<title>Student Profile</title>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

</head>

<body>

<div class="container mt-5">

<h3 class="mb-4">Student Profile</h3>

<div class="row">

<div class="col-md-4">

<div class="card p-4 text-center">

<img src="../uploads/<?php echo $student['photo']; ?>" 
width="150"
class="rounded-circle mb-3">

<h4><?php echo $student['name']; ?></h4>

<p>Email: <?php echo $student['email']; ?></p>

<p>Phone: <?php echo $student['phone']; ?></p>

<p>Course: <?php echo $student['course']; ?></p>

</div>

</div>

<div class="col-md-8">

<div class="card p-4 mb-4">

<h5>Attendance Percentage</h5>

<div class="progress">

<div class="progress-bar bg-success" 
style="width:<?php echo $percent; ?>%">

<?php echo $percent; ?>%

</div>

</div>

</div>

<!-- Fees History -->

<div class="card p-4 mb-4">

<h5>Fees History</h5>

<table class="table table-bordered">

<tr>
<th>Total Fees</th>
<th>Paid</th>
<th>Remaining</th>
</tr>

<?php while($f = mysqli_fetch_assoc($fees)){ ?>

<tr>

<td>₹ <?php echo $f['total_fees']; ?></td>

<td>₹ <?php echo $f['paid']; ?></td>

<td>₹ <?php echo $f['remaining']; ?></td>

</tr>

<?php } ?>

</table>

</div>

<!-- Attendance History -->

<div class="card p-4">

<h5>Attendance History</h5>

<table class="table table-bordered">

<tr>
<th>Date</th>
<th>Status</th>
</tr>

<?php while($a = mysqli_fetch_assoc($attendance)){ ?>

<tr>

<td><?php echo $a['date']; ?></td>

<td>

<?php if($a['status']=="Present"){ ?>

<span class="badge bg-success">Present</span>

<?php } else { ?>

<span class="badge bg-danger">Absent</span>

<?php } ?>

</td>

</tr>

<?php } ?>

</table>

</div>

</div>

</div>

</div>

</body>
</html>
