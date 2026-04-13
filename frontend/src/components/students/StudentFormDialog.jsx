import { useEffect, useMemo, useState } from "react";
import { Camera, Loader2, Save, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const emptyForm = {
  student_id: "",
  full_name: "",
  email: "",
  phone: "",
  parent_name: "",
  parent_phone: "",
  address: "",
  admission_date: new Date().toISOString().slice(0, 10),
  course_id: "",
  batch_id: "",
  date_of_birth: "",
  gender: "",
  status: "Active",
  notes: "",
  student_photo: null,
  remove_photo: false,
};

const toFormState = (student) => ({
  student_id: student?.student_id || "",
  full_name: student?.full_name || "",
  email: student?.email || "",
  phone: student?.phone || "",
  parent_name: student?.parent_name || "",
  parent_phone: student?.parent_phone || "",
  address: student?.address || "",
  admission_date:
    student?.admission_date || new Date().toISOString().slice(0, 10),
  course_id: student?.course_id ? String(student.course_id) : "",
  batch_id: student?.batch_id ? String(student.batch_id) : "",
  date_of_birth: student?.date_of_birth || "",
  gender: student?.gender || "",
  status: student?.status || "Active",
  notes: student?.notes || "",
  student_photo: null,
  remove_photo: false,
});

export default function StudentFormDialog({
  open,
  mode = "create",
  student,
  meta,
  loading,
  error,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(() =>
    mode === "edit" && student ? toFormState(student) : emptyForm,
  );
  const [fieldErrors, setFieldErrors] = useState({});

  const previewUrl = useMemo(
    () => (form.student_photo ? URL.createObjectURL(form.student_photo) : null),
    [form.student_photo],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const filteredBatches = useMemo(() => {
    if (!form.course_id) {
      return meta?.batches || [];
    }

    return (meta?.batches || []).filter(
      (batch) => String(batch.course_id) === String(form.course_id),
    );
  }, [form.course_id, meta?.batches]);

  if (!open) {
    return null;
  }

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.full_name.trim()) {
      nextErrors.full_name = "Full name is required.";
    }

    if (!form.phone.trim()) {
      nextErrors.phone = "Phone number is required.";
    }

    if (!form.admission_date) {
      nextErrors.admission_date = "Admission date is required.";
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (form.student_photo && form.student_photo.size > 2 * 1024 * 1024) {
      nextErrors.student_photo = "Photo must be under 2 MB.";
    }

    setFieldErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    const payload = {
      ...form,
      course_id: form.course_id || "",
      batch_id: form.batch_id || "",
      remove_photo: form.remove_photo ? "1" : "",
    };

    await onSubmit(payload);
  };

  const currentPhoto = previewUrl || (!form.remove_photo ? student?.student_photo : null);

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
              Students
            </p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">
              {mode === "edit" ? "Edit Student" : "Create New Student"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Capture admission details, guardian info, course allocation, and photo in one flow.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 p-6">
          <div className="grid gap-8 lg:grid-cols-[220px,1fr]">
            <div className="space-y-4 rounded-3xl border border-border bg-muted/20 p-5">
              <div className="aspect-square overflow-hidden rounded-3xl border border-dashed border-border bg-background">
                {currentPhoto ? (
                  <img
                    src={currentPhoto}
                    alt="Student preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                    <Camera className="h-8 w-8" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Upload student photo</p>
                      <p className="text-xs text-muted-foreground">JPG, PNG, or WEBP up to 2 MB</p>
                    </div>
                  </div>
                )}
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-foreground">Student Photo</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) =>
                    updateField("student_photo", event.target.files?.[0] || null)
                  }
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:font-semibold file:text-primary hover:file:bg-primary/20"
                />
              </label>
              {renderFieldError("student_photo")}

              {student?.student_photo && (
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={form.remove_photo}
                    onChange={(event) => updateField("remove_photo", event.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  Remove current photo
                </label>
              )}
            </div>

            <div className="space-y-6">
              <section className="rounded-3xl border border-border p-5">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Primary identity and communication details used across the ERP.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-foreground">Full Name</label>
                    <Input
                      value={form.full_name}
                      onChange={(event) => updateField("full_name", event.target.value)}
                      placeholder="Enter student full name"
                      className="mt-2"
                    />
                    {renderFieldError("full_name")}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Email Address</label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(event) => updateField("email", event.target.value)}
                      placeholder="student@example.com"
                      className="mt-2"
                    />
                    {renderFieldError("email")}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Phone Number</label>
                    <Input
                      value={form.phone}
                      onChange={(event) => updateField("phone", event.target.value)}
                      placeholder="+91 98765 43210"
                      className="mt-2"
                    />
                    {renderFieldError("phone")}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Date of Birth</label>
                    <Input
                      type="date"
                      value={form.date_of_birth}
                      onChange={(event) => updateField("date_of_birth", event.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Gender</label>
                    <select
                      value={form.gender}
                      onChange={(event) => updateField("gender", event.target.value)}
                      className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-foreground">Address</label>
                    <textarea
                      rows={3}
                      value={form.address}
                      onChange={(event) => updateField("address", event.target.value)}
                      placeholder="House number, locality, city"
                      className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-border p-5">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Admission & Guardian</h3>
                  <p className="text-sm text-muted-foreground">
                    Academic placement and parent communication details.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-foreground">Student ID</label>
                    <Input
                      value={form.student_id}
                      onChange={(event) => updateField("student_id", event.target.value)}
                      placeholder="Auto-generated if left blank"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Admission Date</label>
                    <Input
                      type="date"
                      value={form.admission_date}
                      onChange={(event) => updateField("admission_date", event.target.value)}
                      className="mt-2"
                    />
                    {renderFieldError("admission_date")}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Course</label>
                    <select
                      value={form.course_id}
                      onChange={(event) => {
                        const nextCourseId = event.target.value;
                        const availableBatches = (meta?.batches || []).filter((batch) =>
                          nextCourseId ? String(batch.course_id) === String(nextCourseId) : true,
                        );
                        const matchesSelectedBatch = availableBatches.some(
                          (batch) => String(batch.id) === String(form.batch_id),
                        );

                        setForm((current) => ({
                          ...current,
                          course_id: nextCourseId,
                          batch_id: matchesSelectedBatch ? current.batch_id : "",
                        }));
                        setFieldErrors((current) => ({
                          ...current,
                          course_id: "",
                          batch_id: "",
                        }));
                      }}
                      className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select course</option>
                      {(meta?.courses || []).map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Batch</label>
                    <select
                      value={form.batch_id}
                      onChange={(event) => updateField("batch_id", event.target.value)}
                      className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select batch</option>
                      {filteredBatches.map((batch) => (
                        <option key={batch.id} value={batch.id}>
                          {batch.name}
                          {batch.course_name ? ` • ${batch.course_name}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Parent / Guardian Name</label>
                    <Input
                      value={form.parent_name}
                      onChange={(event) => updateField("parent_name", event.target.value)}
                      placeholder="Parent full name"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Parent Phone</label>
                    <Input
                      value={form.parent_phone}
                      onChange={(event) => updateField("parent_phone", event.target.value)}
                      placeholder="+91 98765 43210"
                      className="mt-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-foreground">Student Status</label>
                    <select
                      value={form.status}
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
                  <h3 className="text-lg font-semibold text-foreground">Notes</h3>
                  <p className="text-sm text-muted-foreground">
                    Capture onboarding details, special remarks, or follow-up context.
                  </p>
                </div>
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                  placeholder="Add any academic, communication, or admission notes here..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
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
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {loading
                    ? mode === "edit"
                      ? "Saving Changes..."
                      : "Creating Student..."
                    : mode === "edit"
                      ? "Save Changes"
                      : "Create Student"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
