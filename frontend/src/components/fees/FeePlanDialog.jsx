import { Save, Wallet, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const emptyForm = {
  student_course_id: "",
  total_fee: "",
  discount: "",
  due_date: "",
  installment_count: "",
  notes: "",
};

const toFormState = (ledger) => ({
  student_course_id: ledger?.student_course_id ? String(ledger.student_course_id) : "",
  total_fee: ledger?.total_fee !== undefined ? String(ledger.total_fee) : "",
  discount: ledger?.discount !== undefined ? String(ledger.discount) : "",
  due_date: ledger?.due_date || "",
  installment_count:
    ledger?.installment_count === null || ledger?.installment_count === undefined
      ? ""
      : String(ledger.installment_count),
  notes: ledger?.notes || "",
});

export default function FeePlanDialog({
  open,
  mode = "create",
  ledger,
  meta,
  loading,
  error,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(() =>
    mode === "edit" && ledger ? toFormState(ledger) : emptyForm,
  );
  const [fieldErrors, setFieldErrors] = useState({});

  const hydratedForm = useMemo(
    () => (mode === "edit" && ledger ? toFormState(ledger) : emptyForm),
    [ledger, mode],
  );

  if (!open) {
    return null;
  }

  const currentForm =
    form.student_course_id || form.total_fee || form.discount || form.notes
      ? form
      : hydratedForm;

  const selectedEnrollment = (meta?.enrollments || []).find(
    (item) => String(item.student_course_id) === String(currentForm.student_course_id),
  );

  const updateField = (key, value) => {
    setForm((current) => ({ ...currentForm, ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!currentForm.student_course_id) {
      nextErrors.student_course_id = "Please choose a student enrollment.";
    }

    const totalFee = Number(currentForm.total_fee);
    const discount = Number(currentForm.discount || 0);

    if (Number.isNaN(totalFee) || totalFee < 0) {
      nextErrors.total_fee = "Total fee must be zero or greater.";
    }

    if (Number.isNaN(discount) || discount < 0) {
      nextErrors.discount = "Discount cannot be negative.";
    }

    if (!nextErrors.total_fee && !nextErrors.discount && discount > totalFee) {
      nextErrors.discount = "Discount cannot exceed the total fee.";
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
      total_fee: Number(currentForm.total_fee || 0),
      discount: Number(currentForm.discount || 0),
      installment_count:
        currentForm.installment_count === "" ? "" : Number(currentForm.installment_count),
    });
  };

  const renderFieldError = (name) =>
    fieldErrors[name] ? (
      <p className="mt-1 text-xs text-destructive">{fieldErrors[name]}</p>
    ) : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/70 backdrop-blur-sm">
      <div className="h-full w-full max-w-2xl overflow-y-auto border-l border-border bg-card shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-6 py-5 backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Fees
            </p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">
              {mode === "edit" ? "Edit Fee Plan" : "Configure Fee Plan"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Set course fees, discount, due date, and installment guidance for the selected enrollment.
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
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Ledger Configuration</h3>
                <p className="text-sm text-muted-foreground">
                  Connect the fee plan to an existing student-course enrollment.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground">Enrollment</label>
                <select
                  value={currentForm.student_course_id}
                  onChange={(event) => updateField("student_course_id", event.target.value)}
                  disabled={mode === "edit"}
                  className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-70"
                >
                  <option value="">Select student enrollment</option>
                  {(meta?.enrollments || []).map((item) => (
                    <option key={item.student_course_id} value={item.student_course_id}>
                      {item.student_name} • {item.course_name}
                      {item.batch_name ? ` • ${item.batch_name}` : ""}
                    </option>
                  ))}
                </select>
                {renderFieldError("student_course_id")}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Total Fee</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentForm.total_fee}
                  onChange={(event) => updateField("total_fee", event.target.value)}
                  className="mt-2"
                />
                {renderFieldError("total_fee")}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Discount</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentForm.discount}
                  onChange={(event) => updateField("discount", event.target.value)}
                  className="mt-2"
                />
                {renderFieldError("discount")}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Due Date</label>
                <Input
                  type="date"
                  value={currentForm.due_date}
                  onChange={(event) => updateField("due_date", event.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Installments</label>
                <Input
                  type="number"
                  min="0"
                  value={currentForm.installment_count}
                  onChange={(event) => updateField("installment_count", event.target.value)}
                  placeholder="Optional"
                  className="mt-2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground">Notes</label>
                <textarea
                  rows={4}
                  value={currentForm.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                  placeholder="Capture plan notes, payment terms, or special discounts."
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            {selectedEnrollment ? (
              <div className="mt-5 rounded-2xl border border-border bg-muted/20 p-4 text-sm">
                <p className="font-semibold text-foreground">{selectedEnrollment.student_name}</p>
                <p className="mt-1 text-muted-foreground">
                  {selectedEnrollment.student_code} • {selectedEnrollment.course_name}
                  {selectedEnrollment.batch_name ? ` • ${selectedEnrollment.batch_name}` : ""}
                </p>
              </div>
            ) : null}
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
              {loading
                ? mode === "edit"
                  ? "Saving Plan..."
                  : "Configuring Plan..."
                : mode === "edit"
                  ? "Save Plan"
                  : "Create / Update Plan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
