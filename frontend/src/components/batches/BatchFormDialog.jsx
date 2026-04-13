import { useMemo, useState } from "react";
import { CalendarDays, Plus, Save, Users, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const emptyForm = {
  batch_id: "",
  batch_name: "",
  course_id: "",
  faculty_id: "",
  faculty_name: "",
  start_date: "",
  end_date: "",
  days_of_week: [],
  start_time: "",
  end_time: "",
  room: "",
  capacity: "",
  status: "Planned",
  assigned_student_ids: [],
};

const toFormState = (batch) => ({
  batch_id: batch?.batch_id || "",
  batch_name: batch?.batch_name || "",
  course_id: batch?.course_id ? String(batch.course_id) : "",
  faculty_id: batch?.faculty_id ? String(batch.faculty_id) : "",
  faculty_name: batch?.faculty_name || "",
  start_date: batch?.start_date || "",
  end_date: batch?.end_date || "",
  days_of_week: Array.isArray(batch?.days_of_week) ? batch.days_of_week : [],
  start_time: batch?.start_time ? String(batch.start_time).slice(0, 5) : "",
  end_time: batch?.end_time ? String(batch.end_time).slice(0, 5) : "",
  room: batch?.room || "",
  capacity:
    batch?.capacity === null || batch?.capacity === undefined ? "" : String(batch.capacity),
  status: batch?.status || "Planned",
  assigned_student_ids: Array.isArray(batch?.assigned_student_ids)
    ? batch.assigned_student_ids.map(String)
    : [],
});

export default function BatchFormDialog({
  open,
  mode = "create",
  batch,
  meta,
  loading,
  error,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(() =>
    mode === "edit" && batch ? toFormState(batch) : emptyForm,
  );
  const [fieldErrors, setFieldErrors] = useState({});

  const hydratedForm = useMemo(
    () => (mode === "edit" && batch ? toFormState(batch) : emptyForm),
    [batch, mode],
  );

  if (!open) {
    return null;
  }

  const currentForm = form.batch_name || form.batch_id || form.course_id ? form : hydratedForm;
  const availableStudents = (meta?.students || []).filter(
    (student) =>
      currentForm.course_id && String(student.course_id) === String(currentForm.course_id),
  );

  const updateField = (key, value) => {
    setForm((current) => ({ ...currentForm, ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
  };

  const toggleWeekday = (day) => {
    const currentDays = currentForm.days_of_week;
    updateField(
      "days_of_week",
      currentDays.includes(day)
        ? currentDays.filter((item) => item !== day)
        : [...currentDays, day],
    );
  };

  const toggleStudent = (studentId) => {
    const nextValue = String(studentId);
    const selected = currentForm.assigned_student_ids;
    updateField(
      "assigned_student_ids",
      selected.includes(nextValue)
        ? selected.filter((item) => item !== nextValue)
        : [...selected, nextValue],
    );
  };

  const validate = () => {
    const nextErrors = {};

    if (!currentForm.batch_name.trim()) {
      nextErrors.batch_name = "Batch name is required.";
    }

    if (!currentForm.course_id) {
      nextErrors.course_id = "Please choose a course.";
    }

    if (currentForm.capacity !== "" && Number(currentForm.capacity) < 0) {
      nextErrors.capacity = "Capacity cannot be negative.";
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
      course_id: Number(currentForm.course_id),
      faculty_id: currentForm.faculty_id === "" ? "" : Number(currentForm.faculty_id),
      capacity: currentForm.capacity === "" ? "" : Number(currentForm.capacity),
      assigned_student_ids: currentForm.assigned_student_ids.map(Number),
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
              Batches
            </p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">
              {mode === "edit" ? "Edit Batch" : "Create New Batch"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure schedule, delivery owner, room, capacity, and assigned students.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <section className="rounded-3xl border border-border p-5">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-foreground">Batch Setup</h3>
              <p className="text-sm text-muted-foreground">
                Define the operational identity and timetable anchors for this batch.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground">Batch ID</label>
                <Input
                  value={currentForm.batch_id}
                  onChange={(event) => updateField("batch_id", event.target.value)}
                  placeholder="Auto-generated if blank"
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Batch Name</label>
                <Input
                  value={currentForm.batch_name}
                  onChange={(event) => updateField("batch_name", event.target.value)}
                  placeholder="Morning NEET Alpha"
                  className="mt-2"
                />
                {renderFieldError("batch_name")}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Course</label>
                <select
                  value={currentForm.course_id}
                  onChange={(event) =>
                    updateField("course_id", event.target.value)
                  }
                  className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select course</option>
                  {(meta?.courses || []).map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.course_name}
                    </option>
                  ))}
                </select>
                {renderFieldError("course_id")}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Faculty / Owner</label>
                <select
                  value={currentForm.faculty_id}
                  onChange={(event) => updateField("faculty_id", event.target.value)}
                  className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Unassigned</option>
                  {(meta?.faculty || []).map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name}
                      {member.subject_specialization?.length
                        ? ` - ${member.subject_specialization.join(", ")}`
                        : ""}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">
                  {meta?.faculty?.length
                    ? "Choose a faculty record from the live directory."
                    : "No faculty records available yet. Add faculty first to assign batch ownership."}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Start Date</label>
                <Input
                  type="date"
                  value={currentForm.start_date}
                  onChange={(event) => updateField("start_date", event.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">End Date</label>
                <Input
                  type="date"
                  value={currentForm.end_date}
                  onChange={(event) => updateField("end_date", event.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Start Time</label>
                <Input
                  type="time"
                  value={currentForm.start_time}
                  onChange={(event) => updateField("start_time", event.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">End Time</label>
                <Input
                  type="time"
                  value={currentForm.end_time}
                  onChange={(event) => updateField("end_time", event.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Room</label>
                <Input
                  value={currentForm.room}
                  onChange={(event) => updateField("room", event.target.value)}
                  placeholder="Room A-204"
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Capacity</label>
                <Input
                  type="number"
                  min="0"
                  value={currentForm.capacity}
                  onChange={(event) => updateField("capacity", event.target.value)}
                  placeholder="40"
                  className="mt-2"
                />
                {renderFieldError("capacity")}
              </div>

              <div className="md:col-span-2">
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
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-foreground">Weekly Schedule</h3>
              <p className="text-sm text-muted-foreground">
                Choose the recurring days this batch will run.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {weekDays.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleWeekday(day)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    currentForm.days_of_week.includes(day)
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-border p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Student Assignment</h3>
                <p className="text-sm text-muted-foreground">
                  Assign students already enrolled in the selected course.
                </p>
              </div>
            </div>

            {currentForm.course_id ? (
              availableStudents.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {availableStudents.map((student) => {
                    const selected = currentForm.assigned_student_ids.includes(String(student.id));

                    return (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => toggleStudent(student.id)}
                        className={`rounded-3xl border p-4 text-left transition ${
                          selected
                            ? "border-primary bg-primary/10"
                            : "border-border bg-background hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-foreground">{student.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {student.student_id} • {student.phone || "No phone"}
                            </p>
                          </div>
                          {selected ? (
                            <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                              Selected
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground">
                          Current batch: {student.batch_name || "Unassigned"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-5 text-sm text-muted-foreground">
                  No students are enrolled in this course yet. Add students to the course first, then assign them here.
                </div>
              )
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-5 text-sm text-muted-foreground">
                Select a course first to see assignable students.
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
              {loading ? (
                <CalendarDays className="h-4 w-4 animate-pulse" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {loading
                ? mode === "edit"
                  ? "Saving Batch..."
                  : "Creating Batch..."
                : mode === "edit"
                  ? "Save Changes"
                  : "Create Batch"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
