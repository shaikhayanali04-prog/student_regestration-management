<?php

require_once __DIR__ . '/../models/FeeModel.php';

class FeeController
{
    private FeeModel $fees;

    private array $paymentModes = ['Cash', 'Card', 'Bank Transfer', 'UPI', 'Other'];

    public function __construct(PDO $conn)
    {
        $this->fees = new FeeModel($conn);
    }

    public function index(): void
    {
        $filters = [
            'search' => $_GET['search'] ?? '',
            'course_id' => $_GET['course_id'] ?? null,
            'batch_id' => $_GET['batch_id'] ?? null,
            'due_status' => $_GET['due_status'] ?? '',
            'payment_from' => $_GET['payment_from'] ?? '',
            'payment_to' => $_GET['payment_to'] ?? '',
            'page' => $_GET['page'] ?? 1,
            'limit' => $_GET['limit'] ?? 8,
        ];

        jsonResponse(true, 'Fee ledgers fetched successfully', $this->fees->paginate($filters));
    }

    public function meta(): void
    {
        jsonResponse(true, 'Fee metadata fetched successfully', $this->fees->getMeta());
    }

    public function show(): void
    {
        $ledgerId = (int) ($_GET['id'] ?? 0);
        if ($ledgerId <= 0) {
            jsonResponse(false, 'A valid fee ledger id is required.', null, 422);
        }

        $ledger = $this->fees->find($ledgerId);
        if (!$ledger) {
            jsonResponse(false, 'Fee ledger not found.', null, 404);
        }

        jsonResponse(true, 'Fee ledger fetched successfully', $ledger);
    }

    public function configure(): void
    {
        $payload = $this->validatePlanPayload($this->requestData());

        try {
            $ledger = $this->fees->configurePlan($payload);
            jsonResponse(true, 'Fee plan saved successfully', $ledger);
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function pay(): void
    {
        $payload = $this->validatePaymentPayload($this->requestData());

        try {
            $ledger = $this->fees->recordPayment($payload);
            jsonResponse(true, 'Payment recorded successfully', $ledger);
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function receipt(): void
    {
        $paymentId = (int) ($_GET['id'] ?? 0);
        if ($paymentId <= 0) {
            jsonResponse(false, 'A valid payment id is required.', null, 422);
        }

        $receipt = $this->fees->getReceipt($paymentId);
        if (!$receipt) {
            jsonResponse(false, 'Receipt not found.', null, 404);
        }

        jsonResponse(true, 'Receipt fetched successfully', $receipt);
    }

    private function requestData(): array
    {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        if (stripos($contentType, 'application/json') !== false) {
            $decoded = json_decode(file_get_contents('php://input'), true);
            return is_array($decoded) ? $decoded : [];
        }

        return $_POST;
    }

    private function validatePlanPayload(array $input): array
    {
        $studentCourseId = (int) ($input['student_course_id'] ?? 0);
        if ($studentCourseId <= 0) {
            throw new InvalidArgumentException('Please select a student enrollment.');
        }

        $totalFee = (float) ($input['total_fee'] ?? 0);
        if ($totalFee < 0) {
            throw new InvalidArgumentException('Total fee cannot be negative.');
        }

        $discount = (float) ($input['discount'] ?? 0);
        if ($discount < 0) {
            throw new InvalidArgumentException('Discount cannot be negative.');
        }

        if ($discount > $totalFee) {
            throw new InvalidArgumentException('Discount cannot exceed total fee.');
        }

        $installmentCount = null;
        if (($input['installment_count'] ?? '') !== '') {
            $installmentCount = (int) $input['installment_count'];
            if ($installmentCount < 0) {
                throw new InvalidArgumentException('Installment count cannot be negative.');
            }
        }

        return [
            'student_course_id' => $studentCourseId,
            'total_fee' => $totalFee,
            'discount' => $discount,
            'due_date' => $this->normalizeDate($input['due_date'] ?? null),
            'installment_count' => $installmentCount,
            'notes' => trim((string) ($input['notes'] ?? '')) ?: null,
        ];
    }

    private function validatePaymentPayload(array $input): array
    {
        $studentCourseId = (int) ($input['student_course_id'] ?? 0);
        if ($studentCourseId <= 0) {
            throw new InvalidArgumentException('Please select a valid fee ledger.');
        }

        $amountPaid = (float) ($input['amount_paid'] ?? 0);
        $lateFee = (float) ($input['late_fee'] ?? 0);

        if ($amountPaid <= 0 && $lateFee <= 0) {
            throw new InvalidArgumentException('Please enter a valid payment or late fee amount.');
        }

        if ($amountPaid < 0 || $lateFee < 0) {
            throw new InvalidArgumentException('Payment values cannot be negative.');
        }

        $paymentMethod = trim((string) ($input['payment_method'] ?? 'Cash'));
        if (!in_array($paymentMethod, $this->paymentModes, true)) {
            throw new InvalidArgumentException('Please choose a valid payment method.');
        }

        return [
            'student_course_id' => $studentCourseId,
            'amount_paid' => $amountPaid,
            'late_fee' => $lateFee,
            'payment_date' => $this->normalizeDate($input['payment_date'] ?? date('Y-m-d')),
            'payment_method' => $paymentMethod,
            'transaction_id' => trim((string) ($input['transaction_id'] ?? '')) ?: null,
            'remarks' => trim((string) ($input['remarks'] ?? '')) ?: null,
        ];
    }

    private function normalizeDate(?string $value): ?string
    {
        if ($value === null || trim($value) === '') {
            return null;
        }

        $date = DateTime::createFromFormat('Y-m-d', trim($value));
        if (!$date || $date->format('Y-m-d') !== trim($value)) {
            throw new InvalidArgumentException('Please provide a valid date.');
        }

        return $date->format('Y-m-d');
    }

    private function handleException(Throwable $exception): void
    {
        if ($exception instanceof InvalidArgumentException) {
            jsonResponse(false, $exception->getMessage(), null, 422);
        }

        if ($exception instanceof RuntimeException) {
            $status = str_contains(strtolower($exception->getMessage()), 'not found') ? 404 : 422;
            jsonResponse(false, $exception->getMessage(), null, $status);
        }

        jsonResponse(false, 'Unable to process the fee request right now. Please try again.', null, 500);
    }
}
