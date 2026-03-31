<?php
require __DIR__ . '/../config/bootstrap.php';
redirect_to(url('fees/create'));

include "../db.php";

$students = mysqli_query($conn,"SELECT id,name FROM students");

if(isset($_POST['submit'])){

$student_id = $_POST['student_id'];
$total = $_POST['total'];
$paid = $_POST['paid'];
$installment = $_POST['installment'];

$remaining = $total - $paid;

$status = ($remaining <= 0) ? "Paid" : "Pending";

mysqli_query($conn,"
INSERT INTO fees 
(student_id,total_fees,paid,remaining,status,installment_amount,last_payment_date,created_at)
VALUES 
('$student_id','$total','$paid','$remaining','$status','$installment',NOW(),NOW())
");

echo "<div class='alert alert-success'>Fees Added Successfully</div>";
}
?>

<!DOCTYPE html>
<html>
<head>

<title>Add Fees</title>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

</head>

<body>

<div class="container mt-5">

<h3>Add Fees</h3>
<hr>

<form method="POST">

<div class="mb-3">
<label>Select Student</label>

<select name="student_id" class="form-control">

<?php while($s = mysqli_fetch_assoc($students)) { ?>

<option value="<?php echo $s['id']; ?>">
<?php echo $s['name']; ?>
</option>

<?php } ?>

</select>

</div>

<div class="mb-3">
<label>Total Fees</label>
<input type="number" name="total" class="form-control" required>
</div>

<div class="mb-3">
<label>Paid Amount</label>
<input type="number" name="paid" class="form-control" required>
</div>

<div class="mb-3">
<label>Installment Amount</label>
<input type="number" name="installment" class="form-control" required>
</div>

<button name="submit" class="btn btn-primary">
Add Fees
</button>

</form>

</div>

</body>
</html>
