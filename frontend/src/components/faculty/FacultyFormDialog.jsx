import { useMemo, useState } from "react";
import { Briefcase, Save, UserRound, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const emptyForm = {
  faculty_id: "",
  full_name: "",
  email: "",
  phone: "",
  subject_specialization: "",
  joining_date: "",
  status: "Active",
  notes: "",
  assigned_batch_ids: [],
};

const toFormState = (faculty) => ({
  faculty_id: faculty?.faculty_id || "",
  full_name: faculty?.full_name || "",
  email: faculty?.email || "",
  phone: faculty?.phone || "",
  subject_specialization: Array.isArray(faculty?.subject_specialization)
    ? faculty.subject_specialization.join(", ")
    : "",
  joining_date: faculty?.joining_date || "",
  status: faculty?.status || "Active",
  notes: faculty?.notes || "",
  assigned_batch_ids: Array.isArray(faculty?.assigned_batch_ids)
    ? faculty.assigned_batch_ids.map(String)
    : [],
});

export default function FacultyFormDialog({
  open,
  mode = "create",
  faculty,
  meta,
  loading,
  error,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(() =>
    mode === "edit" && faculty ? toFormState(faculty) : emptyForm,
  );
  const [fieldErrors, setFieldErrors] = useState({});

  const hydratedForm = useMemo(
    () => (mode === "edit" && faculty ? toFormState(faculty) : emptyForm),
    [faculty, mode],
  );

  if (!open) {
    return null;
  }

  const currentForm = form.full_name || form.faculty_id ? form : hydratedForm;
  const batches = meta?.batches || [];

  const updateField = (key, value) => {
    setForm((current) => ({ ...currentForm, ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
  };

  const toggleBatch = (batchId) => {
    const nextValue = String(batchId);
    const selected = currentForm.assigned_batch_ids;

    updateField(
      "assigned_batch_ids",
      selected.includes(nextValue)
        ? selected.filter((item) => item !== nextValue)
        : [...selected, nextValue],
    );
  };

  const validate = () => {
    const nextErrors = {};

    if (!currentForm.full_name.trim()) {
      nextErrors.full_name = "Full name is required.";
    }

    if (currentForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentForm.email)) {
      nextErrors.email = "Please enter a valid email address.";
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
      subject_specialization: currentForm.subject_specialization
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      assigned_batch_ids: currentForm.assigned_batch_ids.map(Number),
    });
  };

  const renderFieldError = (name) =>
    fieldErrors[name] ? (
      <p className="mt-1 text-xs text-destructive">{fieldErrors[name]}</p>
    ) : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/70 backdrop-blur-sm">
      <div className="h-full w-full max-w-3xl overflow-y-auto border-l border-border bg-card shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-6 py-5 backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Faculty
            </p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">
              {mode === "edit" ? "Edit Faculty" : "Add Faculty Member"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Capture teacher profile, specialization, and live batch assignments.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <section className="rounded-3xl border border-border p-5">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-foreground">Faculty Profile</h3>
              <p className="text-sm text-muted-foreground">
                Add core contact and employment details for the faculty member.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground">Faculty ID</label>
                <Input
                  value={currentForm.faculty_id}
                  onChange={(event) => updateField("faculty_id", event.target.value)}
                  placeholder="Auto-generated if blank"
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <Input
                  value={currentForm.full_name}
                  onChange={(event) => updateField("full_name", event.target.value)}
                  placeholder="Priya Sharma"
                  className="mt-2"
                />
                {renderFieldError("full_name")}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  type="email"
                  value={currentForm.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="faculty@smarterp.com"
                  className="mt-2"
                />
                {renderFieldError("email")}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Phone</label>
                <Input
                  value={currentForm.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="+91 98765 43210"
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Joining Date</label>
                <Input
                  type="date"
                  value={currentForm.joining_date}
                  onChange={(event) => updateField("joining_date", event.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Status</label>
                <select
                  value={currentForm.status}
                  onChange={(event) => updateField("status", event.target.value)}
                  className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {(meta?.statuses || []).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Specialization</h3>
                <p className="text-sm text-muted-foreground">
                  List subjects or domains separated by commas.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Subject Specialization</label>
                <textarea
                  value={currentForm.subject_specialization}
                  onChange={(event) => updateField("subject_specialization", event.target.value)}
                  placeholder="Physics, NEET, IIT-JEE"
                  rows={3}
                  className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Notes</label>
                <textarea
                  value={currentForm.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                  placeholder="Optional notes about this faculty member"
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Batch Assignment</h3>
                <p className="text-sm text-muted-foreground">
                  Assign this faculty member to the batches they currently own.
                </p>
              </div>
            </div>

            {batches.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {batches.map((batch) => {
                  const selected = currentForm.assigned_batch_ids.includes(String(batch.id));
                  const assignedElsewhere =
                    batch.faculty_id && String(batch.faculty_id) !== String(faculty?.id || "");

                  return (
                    <button
                      key={batch.id}
                      type="button"
                      onClick={() => toggleBatch(batch.id)}
                      className={`rounded-3xl border p-4 text-left transition ${
                        selected
                          ? "border-primary bg-primary/10"
                          : "border-border bg-background hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{batch.batch_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {batch.batch_id} - {batch.course_name}
                          </p>
                        </div>
                        {selected ? (
                          <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                            Selected
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-3 grid gap-1 text-xs text-muted-foreground">
                        <p>{batch.student_count} students</p>
                        <p>{batch.timing || "Timing not configured"}</p>
                        <p>
                          {assignedElsewhere
                            ? `Currently assigned to ${batch.assigned_faculty_name}`
                            : batch.assigned_faculty_name
                              ? `Currently assigned to ${batch.assigned_faculty_name}`
                              : "Currently unassigned"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-5 text-sm text-muted-foreground">
                No batches are available yet. Create batches first, then assign them to faculty.
              </div>
            )}
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
                  ? "Saving Faculty..."
                  : "Creating Faculty..."
                : mode === "edit"
                  ? "Save Changes"
                  : "Create Faculty"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
