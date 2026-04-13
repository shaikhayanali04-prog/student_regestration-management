import { Badge } from "../ui/badge";

const variantMap = {
  Planned: "secondary",
  Active: "success",
  Completed: "default",
};

export default function BatchStatusBadge({ status }) {
  return (
    <Badge variant={variantMap[status] || "secondary"} className="capitalize">
      {status || "Unknown"}
    </Badge>
  );
}
