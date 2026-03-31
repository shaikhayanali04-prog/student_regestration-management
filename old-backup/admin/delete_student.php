<?php
require __DIR__ . '/../config/bootstrap.php';
redirect_to(url('students'));

include "../db.php";

$id = $_GET['id'];

mysqli_query($conn,"DELETE FROM students WHERE id=$id");

header("Location: view_students.php");
?>
