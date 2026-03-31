<?php

declare(strict_types=1);

class Expense extends BaseModel
{
    public function all(): array
    {
        return $this->db->select(
            'SELECT e.*
             FROM expenses e
             ORDER BY e.expense_date DESC, e.id DESC'
        );
    }

    public function create(array $data): int
    {
        return $this->db->insert(
            'INSERT INTO expenses (title, category, amount, expense_date, note, created_by)
             VALUES (:title, :category, :amount, :expense_date, :note, :created_by)',
            [
                'title' => $data['title'],
                'category' => $data['category'],
                'amount' => $data['amount'],
                'expense_date' => $data['expense_date'],
                'note' => $data['note'] ?: null,
                'created_by' => current_user()['id'] ?? null,
            ]
        );
    }

    public function delete(int $id): void
    {
        $this->db->execute('DELETE FROM expenses WHERE id = :id', ['id' => $id]);
    }

    public function monthlyTotals(int $months = 6): array
    {
        return $this->db->select(
            'SELECT DATE_FORMAT(expense_date, "%Y-%m") AS month_key, SUM(amount) AS total
             FROM expenses
             WHERE expense_date >= DATE_SUB(CURDATE(), INTERVAL ' . (int) $months . ' MONTH)
             GROUP BY DATE_FORMAT(expense_date, "%Y-%m")
             ORDER BY month_key ASC'
        );
    }

    public function totalSpent(): float
    {
        return (float) ($this->db->scalar('SELECT COALESCE(SUM(amount), 0) FROM expenses') ?? 0);
    }
}
