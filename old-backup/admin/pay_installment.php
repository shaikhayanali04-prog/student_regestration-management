<?php
require __DIR__ . '/../config/bootstrap.php';
redirect_to(url('fees/' . ((string) ($_GET['id'] ?? '')) . '/pay'));

session_start();
include "../db.php";

if(!isset($_SESSION['admin'])){
header("Location: ../index.php");
exit();
}

$id = $_GET['id'];

$fee = mysqli_fetch_assoc(mysqli_query($conn,"
SELECT fees.*, students.name
FROM fees
JOIN students ON fees.student_id = students.id
WHERE fees.id='$id'
"));

if(isset($_POST['pay'])){

$amount = $_POST['amount'];

$newPaid = $fee['paid'] + $amount;
$newRemaining = $fee['total_fees'] - $newPaid;

mysqli_query($conn,"
UPDATE fees 
SET paid='$newPaid', remaining='$newRemaining'
WHERE id='$id'
");

header("Location: view_fees.php");
}
?>

<!DOCTYPE html>
<html>
<head>

<title>Pay Installment</title>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

</head>

<body>

<div class="container mt-5">

<h3>Pay Installment</h3>

<div class="card p-4">

<p><b>Student:</b> <?php echo $fee['name']; ?></p>
<p><b>Total Fees:</b> ₹<?php echo $fee['total_fees']; ?></p>
<p><b>Paid:</b> ₹<?php echo $fee['paid']; ?></p>
<p><b>Remaining:</b> ₹<?php echo $fee['remaining']; ?></p>

<form method="POST">

<div class="mb-3">

<label>Installment Amount</label>

<input type="number" name="amount" class="form-control" required>

</div>

<button class="btn btn-success" name="pay">

Pay Installment

</button>

</form>

</div>

</div>

</body>
</html>
