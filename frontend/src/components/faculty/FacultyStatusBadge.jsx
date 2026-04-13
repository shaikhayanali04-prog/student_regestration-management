const statusStyles = {
  Active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  Inactive: "bg-muted text-muted-foreground border-border",
};

export default function FacultyStatusBadge({ value = "Active" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[value] || statusStyles.Active}`}
    >
      {value}
    </span>
  );
}
