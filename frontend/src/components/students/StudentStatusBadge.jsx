import { Badge } from "../ui/badge";

const statusVariantMap = {
  Active: "success",
  Inactive: "secondary",
  Dropped: "destructive",
  Completed: "default",
  Present: "success",
  Absent: "destructive",
  Late: "default",
  Excused: "secondary",
};

export default function StudentStatusBadge({ status }) {
  return (
    <Badge variant={statusVariantMap[status] || "secondary"} className="capitalize">
      {status || "Unknown"}
    </Badge>
  );
}
