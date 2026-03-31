<?php
require __DIR__ . '/../config/bootstrap.php';
redirect_to(url('fees'));

session_start();
include "../db.php";

if(!isset($_SESSION['admin'])){
header("Location: ../index.php");
exit();
}

$search = $_GET['search'] ?? "";
$status_filter = "";

if(isset($_GET['status']) && $_GET['status'] != ""){
$status = $_GET['status'];
$status_filter = "AND fees.status='$status'";
}

$query = "
SELECT fees.*, students.name
FROM fees
JOIN students ON fees.student_id = students.id
WHERE students.name LIKE '%$search%'
$status_filter
";

$result = mysqli_query($conn,$query);
?>

<!DOCTYPE html>
<html>

<head>

<title>Fees Records</title>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

</head>

<body>

<div class="container mt-5">

<h2>Fees Records</h2>
<hr>

<div class="mb-3">

<a href="export_fees.php" class="btn btn-success">
Export Excel
</a>

<button onclick="window.print()" class="btn btn-dark">
Print Report
</button>

</div>

<form method="GET" class="mb-3">

<div class="row">

<div class="col-md-4">
<input type="text" name="search" placeholder="Search student"
value="<?php echo $search; ?>" class="form-control">
</div>

<div class="col-md-3">

<select name="status" class="form-control">

<option value="">All Status</option>

<option value="Paid">Paid</option>

<option value="Pending">Pending</option>

</select>

</div>

<div class="col-md-2">

<button class="btn btn-primary">
Filter
</button>

</div>

</div>

</form>

<table id="feesTable" class="table table-striped table-bordered">

<tr>

<th>ID</th>
<th>Student</th>
<th>Total</th>
<th>Paid</th>
<th>Remaining</th>
<th>Installment</th>
<th>Status</th>
<th>Actions</th>

</tr>

<?php while($row = mysqli_fetch_assoc($result)) { ?>

<tr>

<td><?php echo $row['id']; ?></td>

<td><?php echo $row['name']; ?></td>

<td>₹ <?php echo $row['total_fees']; ?></td>

<td>₹ <?php echo $row['paid']; ?></td>

<td>₹ <?php echo $row['remaining']; ?></td>

<td>₹ <?php echo $row['installment_amount']; ?></td>

<td>

<?php
$status = ($row['remaining'] <= 0) ? "Paid" : "Pending";
?>

<?php if($status == "Paid"){ ?>

<span class="badge bg-success">Paid</span>

<?php } else { ?>

<span class="badge bg-danger">Pending</span>

<?php } ?>

</td>

<td>

<a href="pay_installment.php?id=<?php echo $row['id']; ?>" class="btn btn-success btn-sm">
Pay Installment
</a>

<a href="generate_receipt.php?id=<?php echo $row['id']; ?>" class="btn btn-primary btn-sm">
Receipt
</a>

<a href="generate_receipt.php?id=<?php echo $row['id']; ?>"
class="btn btn-primary btn-sm">

Download Receipt

</a>

<a href="pay_installment.php?id=<?php echo $row['id']; ?>" 
class="btn btn-success btn-sm">

Pay Installment

</a>

</td>

</tr>

<?php } ?>

</table>

</div>
<script>

$(document).ready(function(){

$('#feesTable').DataTable({
pageLength:5,
lengthMenu:[5,10,25,50],
order:[[0,'asc']]
});

});

</script>

</body>
</html>
