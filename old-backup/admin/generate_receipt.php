<?php
require __DIR__ . '/../config/bootstrap.php';
redirect_to(url('fees/' . ((string) ($_GET['id'] ?? '')) . '/receipt'));


require_once('../tcpdf/tcpdf.php');
include "../db.php";

$id = $_GET['id'];

$query = "
SELECT fees.*, students.name, students.course
FROM fees
JOIN students ON fees.student_id = students.id
WHERE fees.id='$id'
";

$data = mysqli_fetch_assoc(mysqli_query($conn,$query));

$pdf = new TCPDF();

$pdf->AddPage();

$html = "

<h2 style='text-align:center;'>Coaching ERP</h2>

<hr>

<p><b>Student:</b> {$data['name']}</p>
<p><b>Course:</b> {$data['course']}</p>
<p><b>Total Fees:</b> ₹{$data['total_fees']}</p>
<p><b>Paid:</b> ₹{$data['paid']}</p>
<p><b>Remaining:</b> ₹{$data['remaining']}</p>

<br>

<p>Date: ".date('d-m-Y')."</p>

<hr>

<h3 style='color:green;'>Payment Received</h3>

";

$pdf->writeHTML($html);

$pdf->Output("receipt.pdf","I");
