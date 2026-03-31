<?php

declare(strict_types=1);

class FeeController extends BaseController
{
    public function index(): void
    {
        $filters = [
            'search' => trim((string) input('search', '')),
            'status' => input('status', ''),
        ];

        $this->render('fees/index', [
            'title' => 'Fees',
            'fees' => (new Fee())->all($filters),
            'filters' => $filters,
            'reminders' => (new Fee())->pendingReminders(),
        ]);
    }

    public function create(): void
    {
        $this->render('fees/form', [
            'title' => 'Create Fee Plan',
            'students' => (new Student())->options(),
            'action' => url('fees/store'),
        ]);
    }

    public function store(): void
    {
        verify_csrf();

        $input = $this->validate($_POST, [
            'student_id' => 'required|integer',
            'total_fees' => 'required|numeric|min:0',
            'paid' => 'required|numeric|min:0',
            'installment_amount' => 'required|numeric|min:0',
            'payment_date' => 'date',
        ]);

        (new Fee())->createPlan([
            'student_id' => (int) $input['student_id'],
            'total_fees' => (float) $input['total_fees'],
            'paid' => (float) $input['paid'],
            'installment_amount' => (float) $input['installment_amount'],
            'payment_date' => $input['payment_date'] ?? date('Y-m-d'),
            'payment_mode' => $_POST['payment_mode'] ?? 'Cash',
            'note' => $_POST['note'] ?? null,
        ]);

        flash('global', 'Fee plan saved successfully.', 'success');
        $this->redirect('fees');
    }

    public function payForm(string $id): void
    {
        $feeModel = new Fee();
        $fee = $feeModel->find((int) $id);

        if (!$fee) {
            Response::abort(404, 'Fee record not found.');
        }

        $this->render('fees/pay', [
            'title' => 'Pay Installment',
            'fee' => $fee,
            'installments' => $feeModel->installments((int) $id),
            'action' => url('fees/' . $id . '/pay'),
        ]);
    }

    public function pay(string $id): void
    {
        verify_csrf();

        $input = $this->validate($_POST, [
            'amount' => 'required|numeric|min:1',
            'payment_date' => 'required|date',
        ]);

        try {
            (new Fee())->addInstallment(
                (int) $id,
                (float) $input['amount'],
                $input['payment_date'],
                $_POST['payment_mode'] ?? 'Cash',
                $_POST['note'] ?? null
            );
        } catch (RuntimeException $exception) {
            flash('global', $exception->getMessage(), 'danger');
            $this->redirect('fees/' . $id . '/pay');
        }

        flash('global', 'Installment added successfully.', 'success');
        $this->redirect('fees');
    }

    public function export(): void
    {
        $rows = (new Fee())->paymentRowsForExport();

        header('Content-Type: application/vnd.ms-excel');
        header('Content-Disposition: attachment; filename=fees_report_' . date('Ymd_His') . '.xls');

        echo "Student\tCourse\tTotal Fees\tPaid\tRemaining\tStatus\tInstallment\tLast Payment\n";

        foreach ($rows as $row) {
            echo implode("\t", [
                $row['student_name'],
                $row['course_name'],
                $row['total_fees'],
                $row['paid'],
                $row['remaining'],
                $row['status'],
                $row['installment_amount'],
                $row['last_payment_date'],
            ]) . "\n";
        }

        exit;
    }

    public function receipt(string $id): void
    {
        $fee = (new Fee())->find((int) $id);

        if (!$fee) {
            Response::abort(404, 'Fee record not found.');
        }

        $tcpdfPath = app_config('base_path') . '/tcpdf/tcpdf.php';

        if (!is_file($tcpdfPath)) {
            Response::abort(500, 'TCPDF library was not found.');
        }

        require_once $tcpdfPath;

        $pdf = new TCPDF();
        $pdf->SetCreator('Coaching ERP Pro');
        $pdf->SetTitle('Fee Receipt');
        $pdf->AddPage();

        $html = '
            <h2 style="text-align:center;">' . e(app_config('app_name')) . '</h2>
            <p><strong>Receipt Date:</strong> ' . date('d M Y') . '</p>
            <hr>
            <p><strong>Student:</strong> ' . e($fee['student_name']) . '</p>
            <p><strong>Course:</strong> ' . e($fee['course_name']) . '</p>
            <p><strong>Total Fees:</strong> ' . e(currency($fee['total_fees'])) . '</p>
            <p><strong>Paid:</strong> ' . e(currency($fee['paid'])) . '</p>
            <p><strong>Remaining:</strong> ' . e(currency($fee['remaining'])) . '</p>
            <p><strong>Status:</strong> ' . e($fee['status']) . '</p>
            <p><strong>Last Payment Date:</strong> ' . e((string) $fee['last_payment_date']) . '</p>
            <hr>
            <p style="color:#0f766e;">This receipt is generated by the ERP system.</p>
        ';

        $pdf->writeHTML($html);
        $pdf->Output('fee_receipt_' . $fee['id'] . '.pdf', 'I');
        exit;
    }
}
