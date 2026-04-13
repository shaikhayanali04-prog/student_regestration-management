import { Badge } from "../ui/badge";

const statusVariantMap = {
  Active: "success",
  Inactive: "secondary",
  Online: "default",
  Offline: "secondary",
  Hybrid: "default",
};

export default function CourseStatusBadge({ value }) {
  return (
    <Badge variant={statusVariantMap[value] || "secondary"} className="capitalize">
      {value || "Unknown"}
    </Badge>
  );
}
