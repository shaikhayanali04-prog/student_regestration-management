<?php
session_start();
include "../db.php";

if(!isset($_SESSION['admin'])){
    header("Location: ../index.php");
}

$search = "";
if(isset($_GET['search'])){
    $search = $_GET['search'];
}

$query = "
SELECT fees.*, students.name 
FROM fees
JOIN students ON fees.student_id = students.id
WHERE students.name LIKE '%$search%'
";

$result = mysqli_query($conn,$query);
?>

<!DOCTYPE html>
<html>
<head>
<title>Fees List</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>

<body>
<div class="container mt-5">

<h2>Fees Records</h2>

<form method="GET" class="mb-3">
<input type="text" name="search" placeholder="Search student..." class="form-control">
</form>

<table class="table table-bordered">
<tr>
<th>ID</th>
<th>Student</th>
<th>Total</th>
<th>Paid</th>
<th>Remaining</th>
<th>Status</th>
</tr>

<?php while($row = mysqli_fetch_assoc($result)) { ?>

<tr>
<td><?php echo $row['id']; ?></td>
<td><?php echo $row['name']; ?></td>
<td>₹ <?php echo $row['total_fees']; ?></td>
<td>₹ <?php echo $row['paid']; ?></td>
<td>₹ <?php echo $row['remaining']; ?></td>
<td>
<?php if(isset($row['status']) && $row['status'] == "Paid") { ?>
    <span class="badge bg-success">Paid</span>
<?php } else { ?>
    <span class="badge bg-danger">Pending</span>
<?php } ?>
</td>
</tr>

<?php } ?>

</table>

</div>
</body>
</html>