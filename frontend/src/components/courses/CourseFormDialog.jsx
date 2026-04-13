import { useMemo, useState } from "react";
import { BookOpen, Plus, Save, Tag, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const emptyForm = {
  course_id: "",
  course_name: "",
  description: "",
  duration_months: "",
  fee_amount: "",
  mode: "Offline",
  subjects: [],
  status: "Active",
};

const toFormState = (course) => ({
  course_id: course?.course_id || "",
  course_name: course?.course_name || "",
  description: course?.description || "",
  duration_months:
    course?.duration_months === null || course?.duration_months === undefined
      ? ""
      : String(course.duration_months),
  fee_amount:
    course?.fee_amount === null || course?.fee_amount === undefined
      ? ""
      : String(course.fee_amount),
  mode: course?.mode || "Offline",
  subjects: Array.isArray(course?.subjects) ? course.subjects : [],
  status: course?.status || "Active",
});

export default function CourseFormDialog({
  open,
  mode = "create",
  course,
  meta,
  loading,
  error,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(() =>
    mode === "edit" && course ? toFormState(course) : emptyForm,
  );
  const [fieldErrors, setFieldErrors] = useState({});
  const [subjectInput, setSubjectInput] = useState("");

  const hydratedForm = useMemo(
    () => (mode === "edit" && course ? toFormState(course) : emptyForm),
    [course, mode],
  );

  if (!open) {
    return null;
  }

  const currentForm = form.course_name || form.course_id || form.description
    ? form
    : hydratedForm;

  const updateField = (key, value) => {
    setForm((current) => ({ ...currentForm, ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
  };

  const addSubject = () => {
    const nextSubject = subjectInput.trim();
    if (!nextSubject) {
      return;
    }

    if (currentForm.subjects.some((subject) => subject.toLowerCase() === nextSubject.toLowerCase())) {
      setSubjectInput("");
      return;
    }

    updateField("subjects", [...currentForm.subjects, nextSubject]);
    setSubjectInput("");
  };

  const removeSubject = (subjectToRemove) => {
    updateField(
      "subjects",
      currentForm.subjects.filter((subject) => subject !== subjectToRemove),
    );
  };

  const validate = () => {
    const nextErrors = {};

    if (!currentForm.course_name.trim()) {
      nextErrors.course_name = "Course name is required.";
    }

    if (currentForm.fee_amount !== "" && Number(currentForm.fee_amount) < 0) {
      nextErrors.fee_amount = "Fee amount cannot be negative.";
    }

    if (currentForm.duration_months !== "" && Number(currentForm.duration_months) < 0) {
      nextErrors.duration_months = "Duration cannot be negative.";
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
      duration_months: currentForm.duration_months === "" ? "" : Number(currentForm.duration_months),
      fee_amount: currentForm.fee_amount === "" ? 0 : Number(currentForm.fee_amount),
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
              Courses
            </p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">
              {mode === "edit" ? "Edit Course" : "Create New Course"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Define pricing, delivery mode, subjects, and course lifecycle in one place.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <section className="rounded-3xl border border-border p-5">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-foreground">Core Setup</h3>
              <p className="text-sm text-muted-foreground">
                Give the course a market-ready identity and pricing structure.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground">Course ID</label>
                <Input
                  value={currentForm.course_id}
                  onChange={(event) => updateField("course_id", event.target.value)}
                  placeholder="Auto-generated if blank"
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Course Name</label>
                <Input
                  value={currentForm.course_name}
                  onChange={(event) => updateField("course_name", event.target.value)}
                  placeholder="IIT Foundation 11th"
                  className="mt-2"
                />
                {renderFieldError("course_name")}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Duration (months)</label>
                <Input
                  type="number"
                  min="0"
                  value={currentForm.duration_months}
                  onChange={(event) => updateField("duration_months", event.target.value)}
                  placeholder="12"
                  className="mt-2"
                />
                {renderFieldError("duration_months")}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Fee Amount</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentForm.fee_amount}
                  onChange={(event) => updateField("fee_amount", event.target.value)}
                  placeholder="45000"
                  className="mt-2"
                />
                {renderFieldError("fee_amount")}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Mode</label>
                <select
                  value={currentForm.mode}
                  onChange={(event) => updateField("mode", event.target.value)}
                  className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {(meta?.modes || []).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Status</label>
                <select
                  value={currentForm.status}
                  onChange={(event) => updateField("status", event.target.value)}
                  className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {(meta?.statuses || []).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border p-5">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-foreground">Curriculum</h3>
              <p className="text-sm text-muted-foreground">
                Capture the course positioning and learning scope.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea
                  rows={4}
                  value={currentForm.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  placeholder="Summarize what this course delivers and who it is for."
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Subjects</label>
                <div className="mt-2 flex gap-2">
                  <Input
                    value={subjectInput}
                    onChange={(event) => setSubjectInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addSubject();
                      }
                    }}
                    placeholder="Add subject and press Enter"
                  />
                  <Button type="button" variant="outline" onClick={addSubject} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {currentForm.subjects.length ? (
                    currentForm.subjects.map((subject) => (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => removeSubject(subject)}
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-sm text-foreground"
                      >
                        <Tag className="h-3.5 w-3.5 text-primary" />
                        {subject}
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Add subject chips like Physics, Chemistry, Maths, or Biology.
                    </p>
                  )}
                </div>
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
              {loading ? <BookOpen className="h-4 w-4 animate-pulse" /> : <Save className="h-4 w-4" />}
              {loading
                ? mode === "edit"
                  ? "Saving Course..."
                  : "Creating Course..."
                : mode === "edit"
                  ? "Save Changes"
                  : "Create Course"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
