<?php

declare(strict_types=1);

require __DIR__ . '/config/bootstrap.php';

Dispatcher::web('dashboard');
exit;

session_start();
require "db.php";

if(!isset($_SESSION['admin'])){
header("Location: index.php");
exit();
}

include "layout/header.php";
include "layout/sidebar.php";

/* Dashboard Summary */

$students = mysqli_fetch_assoc(mysqli_query($conn,"SELECT COUNT(*) as total FROM students"));
$fees = mysqli_fetch_assoc(mysqli_query($conn,"SELECT IFNULL(SUM(paid),0) as total FROM fees"));
$pending = mysqli_fetch_assoc(mysqli_query($conn,"SELECT IFNULL(SUM(remaining),0) as total FROM fees"));

$present = mysqli_fetch_assoc(mysqli_query($conn,"
SELECT COUNT(*) as total 
FROM attendance 
WHERE status='Present'
"));

$absent = mysqli_fetch_assoc(mysqli_query($conn,"
SELECT COUNT(*) as total 
FROM attendance 
WHERE status='Absent'
")); 

/* Recent Payments */

$recent = mysqli_query($conn,"
SELECT students.name,fees.paid,fees.remaining
FROM fees
JOIN students ON fees.student_id = students.id
ORDER BY fees.id DESC LIMIT 5
");

/* Monthly Revenue */

$monthly = mysqli_query($conn,"
SELECT MONTH(created_at) as month, SUM(paid) as total
FROM fees
GROUP BY MONTH(created_at)
ORDER BY month
");

$months = [];
$totals = [];

while($m = mysqli_fetch_assoc($monthly)){
$months[] = date("M", mktime(0,0,0,$m['month'],1));
$totals[] = $m['total'];
}

/* Student Growth */

$studentGrowth = mysqli_query($conn,"
SELECT MONTH(created_at) as month, COUNT(*) as total
FROM students
GROUP BY MONTH(created_at)
ORDER BY month
");

$sMonths = [];
$sTotals = [];

while($s = mysqli_fetch_assoc($studentGrowth)){
$sMonths[] = date("M", mktime(0,0,0,$s['month'],1));
$sTotals[] = $s['total'];
}
?>

<div class="container-fluid">

<div class="d-flex justify-content-between align-items-center mb-4">
<h3>Dashboard</h3>
<span class="text-muted">Welcome <?php echo $_SESSION['admin']; ?></span>
</div>

<!-- Cards -->

<div class="row g-4">

<div class="col-md-4">
<div class="card dashboard-card blue p-4 text-center">
<i class="fa fa-users fa-2x mb-3"></i>
<h5>Total Students</h5>
<h2><?php echo $students['total'] ?? 0; ?></h2>
</div>
</div>

<div class="col-md-4">
<div class="card dashboard-card green p-4 text-center">
<i class="fa fa-money-bill fa-2x mb-3"></i>
<h5>Fees Collected</h5>
<h2>₹ <?php echo $fees['total'] ?? 0; ?></h2>
</div>
</div>

<div class="col-md-4">
<div class="card dashboard-card red p-4 text-center">
<i class="fa fa-exclamation-circle fa-2x mb-3"></i>
<h5>Pending Fees</h5>
<h2>₹ <?php echo $pending['total'] ?? 0; ?></h2>
</div>
</div>

</div>

<div class="card mt-4 p-4">

<h5>Attendance Analytics</h5>

<div style="width:400px;margin:auto;">
<canvas id="attendanceChart"></canvas>
</div>

</div>


<!-- Charts -->

<div class="row mt-5">

<div class="col-md-4">

<div class="card p-4 shadow-sm">

<h5 class="mb-3">Fees Analytics</h5>

<div style="height:300px">
<canvas id="feesChart"></canvas>
</div>

</div>

</div>

<div class="col-md-4">

<div class="card p-4 shadow-sm">

<h5 class="mb-3">Monthly Revenue</h5>

<div style="height:300px">
<canvas id="revenueChart"></canvas>
</div>

</div>

</div>

<div class="col-md-4">

<div class="card p-4 shadow-sm">

<h5 class="mb-3">Student Growth</h5>

<div style="height:300px">
<canvas id="studentChart"></canvas>
</div>

</div>

</div>

</div>
<script>

new Chart(document.getElementById("attendanceChart"),{

type:"doughnut",

data:{

labels:["Present","Absent"],

datasets:[{

data:[
<?php echo $present['total'] ?? 0 ?>,
<?php echo $absent['total'] ?? 0 ?>
],

backgroundColor:[
"#22c55e",
"#ef4444"
]

}]

}

});

</script>

<!-- Recent Payments -->

<div class="card p-4 shadow-sm mt-5">

<h5 class="mb-3">Recent Payments</h5>

<table class="table table-striped table-hover">

<thead class="table-dark">
<tr>
<th>Student</th>
<th>Paid</th>
<th>Remaining</th>
</tr>
</thead>

<tbody>

<?php if(mysqli_num_rows($recent) > 0){ ?>

<?php while($r = mysqli_fetch_assoc($recent)) { ?>

<tr>
<td><?php echo $r['name']; ?></td>
<td>₹ <?php echo $r['paid']; ?></td>
<td>₹ <?php echo $r['remaining']; ?></td>
</tr>

<?php } ?>

<?php } else { ?>

<tr>
<td colspan="3" class="text-center">No payments yet</td>
</tr>

<?php } ?>

</tbody>

</table>

</div>

</div>

<script>

/* Fees Pie Chart */

new Chart(document.getElementById("feesChart"),{

type:"pie",

data:{
labels:["Collected","Pending"],
datasets:[{
data:[
<?php echo $fees['total'] ?? 0 ?>,
<?php echo $pending['total'] ?? 0 ?>
],
backgroundColor:["#22c55e","#ef4444"]
}]
},

options:{
responsive:true,
maintainAspectRatio:false
}

});

/* Monthly Revenue */

new Chart(document.getElementById("revenueChart"),{

type:"bar",

data:{
labels: <?php echo json_encode($months); ?>,
datasets:[{
label:"Monthly Revenue",
data: <?php echo json_encode($totals); ?>,
backgroundColor:"#6366f1"
}]
},

options:{
responsive:true,
maintainAspectRatio:false
}

});

/* Student Growth */

new Chart(document.getElementById("studentChart"),{

type:"line",

data:{
labels: <?php echo json_encode($sMonths); ?>,
datasets:[{
label:"New Students",
data: <?php echo json_encode($sTotals); ?>,
borderColor:"#22c55e",
backgroundColor:"rgba(34,197,94,0.2)",
fill:true
}]
},

options:{
responsive:true,
maintainAspectRatio:false
}

});

</script>

<?php include "layout/footer.php"; ?>
