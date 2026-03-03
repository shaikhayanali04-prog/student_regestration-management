<?php
session_start();
include "../db.php";

if(!isset($_SESSION['admin'])){
    header("Location: ../index.php");
}

$result = mysqli_query($conn,"SELECT * FROM students");
?>

<!DOCTYPE html>
<html>
<head>
    <title>View Students</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>

<body>

<div class="container mt-5">

<h2>All Students</h2>

<table class="table table-bordered">
<tr>
    <th>ID</th>
    <th>Name</th>
    <th>Email</th>
    <th>Phone</th>
    <th>Course</th>
    <th>Photo</th>
    <td>
    <a href="edit_student.php?id=<?php echo $row['id']; ?>" class="btn btn-warning btn-sm">Edit</a>
    <a href="delete_student.php?id=<?php echo $row['id']; ?>" class="btn btn-danger btn-sm">Delete</a>
</td>
</tr>

<?php while($row = mysqli_fetch_assoc($result)) { ?>

<tr>
    <td><?php echo $row['id']; ?></td>
    <td><?php echo $row['NAME']; ?></td>
    <td><?php echo $row['email']; ?></td>
    <td><?php echo $row['phone']; ?></td>
    <td><?php echo $row['course']; ?></td>
    <td><img src="../uploads/<?php echo $row['photo']; ?>" width="60" height="60"></td>
    <td>
        <a href="delete_student.php?id=<?php echo $row['id']; ?>" class="btn btn-danger btn-sm">Delete</a>
    </td>
</tr>

<?php } ?>

</table>

</div>

</body>
</html>