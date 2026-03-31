<?php
require __DIR__ . '/../config/bootstrap.php';
redirect_to(url('students'));

session_start();
include "../db.php";

/* Protect Page */
if(!isset($_SESSION['admin'])){
header("Location: ../index.php");
exit();
}

/* Fetch Students */
$query = "SELECT * FROM students ORDER BY id DESC";
$result = mysqli_query($conn,$query);

$total_students = mysqli_num_rows($result);
?>

<!DOCTYPE html>
<html>

<head>

<title>All Students</title>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

<style>

.student-photo{
width:60px;
height:60px;
object-fit:cover;
border-radius:50%;
border:2px solid #ddd;
}

</style>

</head>

<body>

<div class="container mt-5">

<div class="d-flex justify-content-between mb-4">

<h2>All Students</h2>

<span class="badge bg-primary p-2">
Total Students: <?php echo $total_students; ?>
</span>

</div>

<table class="table table-bordered table-striped">

<tr>
<th>ID</th>
<th>Name</th>
<th>Email</th>
<th>Phone</th>
<th>Course</th>
<th>Photo</th>
<th width="200">Actions</th>
</tr>

<?php if($total_students > 0){ ?>

<?php while($row = mysqli_fetch_assoc($result)){ ?>

<tr>

<td><?php echo $row['id']; ?></td>

<td>
<?php 
echo isset($row['name']) ? $row['name'] : $row['student_name']; 
?>
</td>

<td><?php echo $row['email']; ?></td>

<td><?php echo $row['phone']; ?></td>

<td><?php echo $row['course']; ?></td>

<td>

<?php if(!empty($row['photo'])){ ?>

<img src="../uploads/students/<?php echo $row['photo']; ?>" class="student-photo">

<?php } else { ?>

<span class="text-muted">No Photo</span>

<?php } ?>

</td>

<td>

<a href="edit_student.php?id=<?php echo $row['id']; ?>" 
class="btn btn-warning btn-sm">
Edit
</a>

<a href="delete_student.php?id=<?php echo $row['id']; ?>" 
class="btn btn-danger btn-sm"
onclick="return confirm('Delete this student?')">
Delete
</a>

<a href="student_profile.php?id=<?php echo $row['id']; ?>" 
class="btn btn-info btn-sm">
Profile
</a>

</td>

</tr>

<?php } ?>

<?php } else { ?>

<tr>
<td colspan="7" class="text-center text-muted">
No students found
</td>
</tr>

<?php } ?>

</table>

</div>

</body>

</html>
