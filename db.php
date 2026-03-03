<?php
$conn = mysqli_connect("localhost","root","","coaching_db");

if(!$conn){
    die("Connection Failed: " . mysqli_connect_error());
}
?>