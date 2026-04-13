import { Link } from "react-router-dom";
import { CreditCard, Eye, Pencil } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import FeeStatusBadge from "./FeeStatusBadge";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function FeeDirectoryList({ ledgers, onEditPlan, onRecordPayment }) {
  return (
    <>
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead>Student</TableHead>
              <TableHead>Course & Batch</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Collection</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ledgers.map((ledger) => (
              <TableRow key={ledger.id}>
                <TableCell>
                  <div>
                    <p className="font-semibold text-foreground">{ledger.student_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {ledger.student_code} • {ledger.phone || "No phone"}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">{ledger.course_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {ledger.batch_name || "No batch assigned"}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">{formatCurrency(ledger.net_fee)}</p>
                  <p className="text-sm text-muted-foreground">
                    Discount {formatCurrency(ledger.discount)} • Due {ledger.due_date || "--"}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">{formatCurrency(ledger.amount_paid)}</p>
                  <p className="text-sm text-muted-foreground">
                    Pending {formatCurrency(ledger.due_amount)} • {ledger.payment_count} payments
                  </p>
                </TableCell>
                <TableCell>
                  <FeeStatusBadge status={ledger.due_status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/admin/fees/${ledger.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onEditPlan(ledger)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Plan
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onRecordPayment(ledger)}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-4 p-4 lg:hidden">
        {ledgers.map((ledger) => (
          <Card key={ledger.id} className="rounded-3xl border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{ledger.student_name}</p>
                  <p className="text-sm text-muted-foreground">{ledger.student_code}</p>
                </div>
                <FeeStatusBadge status={ledger.due_status} />
              </div>

              <div className="mt-4 grid gap-3 rounded-2xl bg-muted/20 p-4 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Course
                  </p>
                  <p className="mt-1 text-foreground">{ledger.course_name}</p>
                  <p className="text-muted-foreground">
                    {ledger.batch_name || "No batch assigned"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Plan
                  </p>
                  <p className="mt-1 text-foreground">{formatCurrency(ledger.net_fee)}</p>
                  <p className="text-muted-foreground">
                    Due {formatCurrency(ledger.due_amount)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/admin/fees/${ledger.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => onEditPlan(ledger)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Plan
                </Button>
                <Button variant="outline" size="sm" onClick={() => onRecordPayment(ledger)}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
