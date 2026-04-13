import { Badge } from "../ui/badge";

const variantMap = {
  Paid: "success",
  Partial: "default",
  Pending: "secondary",
  Overdue: "destructive",
};

export default function FeeStatusBadge({ status }) {
  return (
    <Badge variant={variantMap[status] || "secondary"} className="capitalize">
      {status || "Unknown"}
    </Badge>
  );
}
