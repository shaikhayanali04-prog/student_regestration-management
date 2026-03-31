<?php

declare(strict_types=1);

class ExpenseController extends BaseController
{
    public function index(): void
    {
        $expenseModel = new Expense();

        $this->render('expenses/index', [
            'title' => 'Expenses',
            'expenses' => $expenseModel->all(),
            'totalSpent' => $expenseModel->totalSpent(),
        ]);
    }

    public function store(): void
    {
        verify_csrf();

        $input = $this->validate($_POST, [
            'title' => 'required|max:150',
            'category' => 'required|max:60',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
        ]);

        (new Expense())->create([
            'title' => $input['title'],
            'category' => $input['category'],
            'amount' => (float) $input['amount'],
            'expense_date' => $input['expense_date'],
            'note' => $_POST['note'] ?? null,
        ]);

        flash('global', 'Expense saved successfully.', 'success');
        $this->redirect('expenses');
    }

    public function delete(string $id): void
    {
        verify_csrf();
        (new Expense())->delete((int) $id);
        flash('global', 'Expense deleted successfully.', 'success');
        $this->redirect('expenses');
    }
}
