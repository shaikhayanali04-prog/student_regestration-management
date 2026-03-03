<?php
include "../db.php";

$students = mysqli_query($conn,"SELECT id,name FROM students");

if(isset($_POST['submit'])){

$student_id = $_POST['student_id'];
$total = $_POST['total'];
$paid = $_POST['paid'];

$remaining = $total - $paid;

$status = ($remaining == 0) ? "Paid" : "Pending";

mysqli_query($conn,"INSERT INTO fees (student_id,total_fees,paid,remaining,status)
VALUES ('$student_id','$total','$paid','$remaining','$status')");

echo "Fees Added";
}
?>

<form method="POST">

<select name="student_id">
<?php while($s = mysqli_fetch_assoc($students)) { ?>
<option value="<?php echo $s['id']; ?>">
<?php echo $s['name']; ?>
</option>
<?php } ?>
</select>

<input type="number" name="total" placeholder="Total Fees">

<input type="number" name="paid" placeholder="Paid Amount">

<button name="submit">Submit</button>

</form>