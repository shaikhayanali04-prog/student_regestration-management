<?php
require __DIR__ . '/../config/bootstrap.php';
redirect_to(url('fees/export'));

include "../db.php";

header("Content-Type: application/vnd.ms-excel");
header("Content-Disposition: attachment; filename=fees_report.xls");

$query="
SELECT students.name,total_fees,paid,remaining,status
FROM fees
JOIN students ON fees.student_id = students.id
";

$result=mysqli_query($conn,$query);

echo "Student\tTotal\tPaid\tRemaining\tStatus\n";

while($row=mysqli_fetch_assoc($result)){

echo $row['name']."\t".
$row['total_fees']."\t".
$row['paid']."\t".
$row['remaining']."\t".
$row['status']."\n";

}
?>
