<?php
require __DIR__ . '/../config/bootstrap.php';
redirect_to(url('attendance'));

session_start();
require "../db.php";

if(!isset($_SESSION['admin'])){
    header("Location: ../index.php");
    exit();
}

$msg = "";

/* Get Students */
$students = mysqli_query($conn,"SELECT * FROM students ORDER BY name ASC");

/* Save Attendance */
if(isset($_POST['save']) && isset($_POST['status'])){

    $date = $_POST['date'];

    foreach($_POST['status'] as $id => $status){

        /* Check duplicate attendance */
        $check = mysqli_query($conn,"
        SELECT id FROM attendance 
        WHERE student_id='$id' AND date='$date'
        ");

        if(mysqli_num_rows($check) == 0){

            mysqli_query($conn,"
            INSERT INTO attendance(student_id,date,status)
            VALUES('$id','$date','$status')
            ");

        }
    }

    $msg = "Attendance saved successfully!";
}
?>

<!DOCTYPE html>
<html>
<head>

<title>Mark Attendance</title>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

<style>
.present{
background:#22c55e;
color:white;
}

.absent{
background:#ef4444;
color:white;
}
</style>

</head>

<body>

<div class="container mt-5">

<h3 class="mb-4">Mark Attendance</h3>

<?php if($msg != ""){ ?>

<div class="alert alert-success">
<?php echo $msg; ?>
</div>

<?php } ?>

<form method="POST">

<div class="mb-3">

<label class="form-label">Select Date</label>

<input type="date" 
name="date" 
class="form-control"
value="<?php echo date('Y-m-d'); ?>"
required>

</div>

<table class="table table-bordered table-striped">

<thead>

<tr>
<th width="80">ID</th>
<th>Student Name</th>
<th width="200">Status</th>
</tr>

</thead>

<tbody>

<?php while($s = mysqli_fetch_assoc($students)){ ?>

<tr>

<td><?php echo $s['id']; ?></td>

<td><?php echo $s['name']; ?></td>

<td>

<select name="status[<?php echo $s['id']; ?>]" class="form-select">

<option value="Present">Present</option>

<option value="Absent">Absent</option>

</select>

</td>

</tr>

<?php } ?>

</tbody>

</table>

<button type="submit" name="save" class="btn btn-primary">
Save Attendance
</button>

</form>

</div>

</body>
</html>
