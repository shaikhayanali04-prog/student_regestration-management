import { CreditCard, Save, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const today = new Date().toISOString().slice(0, 10);

const toFormState = (ledger) => ({
  student_course_id: ledger?.student_course_id ? String(ledger.student_course_id) : "",
  amount_paid: "",
  late_fee: "",
  payment_date: today,
  payment_method: "Cash",
  transaction_id: "",
  remarks: "",
});

export default function PaymentDialog({
  open,
  ledger,
  meta,
  loading,
  error,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(() => toFormState(ledger));
  const [fieldErrors, setFieldErrors] = useState({});

  const hydratedForm = useMemo(() => toFormState(ledger), [ledger]);

  if (!open || !ledger) {
    return null;
  }

  const currentForm = form.student_course_id ? form : hydratedForm;

  const updateField = (key, value) => {
    setForm((current) => ({ ...currentForm, ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    const amountPaid = Number(currentForm.amount_paid || 0);
    const lateFee = Number(currentForm.late_fee || 0);

    if (amountPaid <= 0 && lateFee <= 0) {
      nextErrors.amount_paid = "Enter a payment or late fee amount.";
    }

    if (amountPaid > Number(ledger.due_amount || 0)) {
      nextErrors.amount_paid = "Payment cannot exceed the pending due amount.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    await onSubmit({
      ...currentForm,
      student_course_id: Number(currentForm.student_course_id),
      amount_paid: Number(currentForm.amount_paid || 0),
      late_fee: Number(currentForm.late_fee || 0),
    });
  };

  const renderFieldError = (name) =>
    fieldErrors[name] ? (
      <p className="mt-1 text-xs text-destructive">{fieldErrors[name]}</p>
    ) : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/70 backdrop-blur-sm">
      <div className="h-full w-full max-w-xl overflow-y-auto border-l border-border bg-card shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-6 py-5 backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Payments
            </p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">Record Installment</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a partial or full payment and generate a receipt-ready entry.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <section className="rounded-3xl border border-border p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Payment Details</h3>
                <p className="text-sm text-muted-foreground">
                  Outstanding due: {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(ledger.due_amount || 0)}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground">Amount Paid</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentForm.amount_paid}
                  onChange={(event) => updateField("amount_paid", event.target.value)}
                  className="mt-2"
                />
                {renderFieldError("amount_paid")}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Late Fee</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentForm.late_fee}
                  onChange={(event) => updateField("late_fee", event.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Payment Date</label>
                <Input
                  type="date"
                  value={currentForm.payment_date}
                  onChange={(event) => updateField("payment_date", event.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Payment Method</label>
                <select
                  value={currentForm.payment_method}
                  onChange={(event) => updateField("payment_method", event.target.value)}
                  className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {(meta?.payment_modes || []).map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground">Transaction ID</label>
                <Input
                  value={currentForm.transaction_id}
                  onChange={(event) => updateField("transaction_id", event.target.value)}
                  placeholder="Optional reference"
                  className="mt-2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground">Remarks</label>
                <textarea
                  rows={4}
                  value={currentForm.remarks}
                  onChange={(event) => updateField("remarks", event.target.value)}
                  placeholder="Add any payment note or collection remark."
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
          </section>

          {error ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              <Save className={`h-4 w-4 ${loading ? "animate-pulse" : ""}`} />
              {loading ? "Recording Payment..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
