<?php
require __DIR__ . '/../config/bootstrap.php';
redirect_to(url('students/create'));

session_start();
include "../db.php";

if(isset($_POST['submit'])){

    $name   = $_POST['name'];
    $email  = $_POST['email'];
    $phone  = $_POST['phone'];
    $course = $_POST['course'];

    /* Photo Upload */

    $photo = $_FILES['photo']['name'];
    $temp  = $_FILES['photo']['tmp_name'];

    if($photo != ""){

        $photo_name = time() . "_" . $photo;  // unique filename
        $path = "../uploads/students/" . $photo_name;

        move_uploaded_file($temp,$path);

    } else {

        $photo_name = "";

    }

    /* Insert Student */

    $sql = "INSERT INTO students (name,email,phone,course,photo)
            VALUES ('$name','$email','$phone','$course','$photo_name')";

    mysqli_query($conn,$sql);

    echo "<script>alert('Student Added Successfully');</script>";
}
?>

<!DOCTYPE html>
<html>
<head>

<title>Add Student</title>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

</head>

<body>

<div class="container mt-5">

<h2>Add Student</h2>

<form method="POST" enctype="multipart/form-data">

<div class="mb-3">
<label>Name</label>
<input type="text" name="name" class="form-control" required>
</div>

<div class="mb-3">
<label>Email</label>
<input type="email" name="email" class="form-control">
</div>

<div class="mb-3">
<label>Phone</label>
<input type="text" name="phone" class="form-control">
</div>

<div class="mb-3">
<label>Course</label>
<input type="text" name="course" class="form-control">
</div>

<div class="mb-3">
<label>Student Photo</label>
<input type="file" name="photo" class="form-control">
</div>

<button type="submit" name="submit" class="btn btn-primary">
Add Student
</button>

</form>

</div>

</body>
</html>
