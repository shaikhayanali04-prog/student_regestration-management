<?php
session_start();
include "../db.php";

$id = $_GET['id'];

$result = mysqli_query($conn,"SELECT * FROM students WHERE id=$id");
$row = mysqli_fetch_assoc($result);

if(isset($_POST['update'])){

    $name   = $_POST['name'];
    $email  = $_POST['email'];
    $phone  = $_POST['phone'];
    $course = $_POST['course'];

    mysqli_query($conn,"UPDATE students SET 
        name='$name',
        email='$email',
        phone='$phone',
        course='$course'
        WHERE id=$id");

    header("Location: view_students.php");
}
?>

<!DOCTYPE html>
<html>
<head>
<title>Edit Student</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>

<body>

<div class="container mt-5">

<h2>Edit Student</h2>

<form method="POST">

<input type="text" name="name" value="<?php echo $row['name']; ?>" class="form-control mb-2" required>

<input type="email" name="email" value="<?php echo $row['email']; ?>" class="form-control mb-2">

<input type="text" name="phone" value="<?php echo $row['phone']; ?>" class="form-control mb-2">

<input type="text" name="course" value="<?php echo $row['course']; ?>" class="form-control mb-2">

<button name="update" class="btn btn-success">Update</button>

</form>

</div>

</body>
</html>