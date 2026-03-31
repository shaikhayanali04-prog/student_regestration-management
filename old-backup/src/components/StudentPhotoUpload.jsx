export function StudentPhotoUpload({
  previewUrl,
  onChange,
  label = "Student Photo",
}) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">{label}</label>

      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Student preview"
          className="h-28 w-28 rounded-xl object-cover border border-slate-200"
        />
      ) : (
        <div className="flex h-28 w-28 items-center justify-center rounded-xl border border-dashed border-slate-300 text-xs text-slate-400">
          No Photo
        </div>
      )}

      <input
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={onChange}
        className="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
      />
    </div>
  );
}
