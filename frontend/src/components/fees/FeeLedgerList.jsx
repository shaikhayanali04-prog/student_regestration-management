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

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not set";

export default function FeeLedgerList({ ledgers, onEditPlan, onRecordPayment }) {
  return (
    <>
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead>Student</TableHead>
              <TableHead>Course & Batch</TableHead>
              <TableHead>Fee Plan</TableHead>
              <TableHead>Collections</TableHead>
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
                    <p className="text-sm text-muted-foreground">{ledger.student_code}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {ledger.phone || "Phone not captured"}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">{ledger.course_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {ledger.batch_name || "Batch not assigned"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Due by {formatDate(ledger.due_date)}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">{formatCurrency(ledger.net_fee)}</p>
                  <p className="text-sm text-muted-foreground">
                    Total {formatCurrency(ledger.total_fee)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Discount {formatCurrency(ledger.discount)}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">
                    Collected {formatCurrency(ledger.total_collected)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Due {formatCurrency(ledger.due_amount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {ledger.payment_count} payments
                    {ledger.last_payment_date
                      ? ` - last on ${formatDate(ledger.last_payment_date)}`
                      : ""}
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
                      Edit Plan
                    </Button>
                    <Button size="sm" onClick={() => onRecordPayment(ledger)}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Record Payment
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
                    Academic Mapping
                  </p>
                  <p className="mt-1 text-foreground">{ledger.course_name}</p>
                  <p className="text-muted-foreground">
                    {ledger.batch_name || "Batch not assigned"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Fee Plan
                  </p>
                  <p className="mt-1 text-foreground">{formatCurrency(ledger.net_fee)}</p>
                  <p className="text-muted-foreground">
                    Due {formatCurrency(ledger.due_amount)} by {formatDate(ledger.due_date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Collections
                  </p>
                  <p className="mt-1 text-foreground">
                    {formatCurrency(ledger.total_collected)} collected
                  </p>
                  <p className="text-muted-foreground">
                    {ledger.payment_count} payments
                    {ledger.last_payment_date
                      ? ` - last on ${formatDate(ledger.last_payment_date)}`
                      : ""}
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
                  Edit Plan
                </Button>
                <Button size="sm" onClick={() => onRecordPayment(ledger)}>
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
