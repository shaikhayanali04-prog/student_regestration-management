<?php
session_start();
include "db.php";

$username = $_POST['username'];
$password = $_POST['password'];

$sql = "SELECT * FROM admins WHERE username='$username' AND password='$password'";
$result = mysqli_query($conn, $sql);

if(mysqli_num_rows($result) == 1){
    $_SESSION['admin'] = $username;
    header("Location: dashboard.php");
}else{
    echo "Invalid Username or Password";
}
?>