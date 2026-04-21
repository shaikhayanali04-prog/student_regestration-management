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
      <div className="hidden overflow-hidden rounded-xl border border-gray-100 bg-white lg:block">
        <Table>
          <TableHeader>
            <TableRow>
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
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-sky-100 font-display text-sm font-bold text-primary">
                      {ledger.student_name?.charAt(0) || "S"}
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">{ledger.student_name}</p>
                      <p className="text-sm text-text-secondary">{ledger.student_code}</p>
                      <p className="mt-1 text-sm text-text-secondary">
                        {ledger.phone || "Phone not captured"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-text-primary">{ledger.course_name}</p>
                  <p className="text-sm text-text-secondary">
                    {ledger.batch_name || "Batch not assigned"}
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">
                    Due by {formatDate(ledger.due_date)}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="font-mono font-semibold text-text-primary">
                    {formatCurrency(ledger.net_fee)}
                  </p>
                  <p className="text-sm text-text-secondary">
                    Total {formatCurrency(ledger.total_fee)}
                  </p>
                  <p className="text-sm text-text-secondary">
                    Discount {formatCurrency(ledger.discount)}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="font-mono font-semibold text-text-primary">
                    {formatCurrency(ledger.total_collected)}
                  </p>
                  <p className="text-sm text-text-secondary">
                    Due {formatCurrency(ledger.due_amount)}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {ledger.payment_count} payments
                    {ledger.last_payment_date
                      ? ` | last on ${formatDate(ledger.last_payment_date)}`
                      : ""}
                  </p>
                </TableCell>
                <TableCell>
                  <FeeStatusBadge status={ledger.due_status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" asChild aria-label="View fee ledger">
                      <Link to={`/admin/fees/${ledger.id}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEditPlan(ledger)}
                      aria-label="Edit fee plan"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      onClick={() => onRecordPayment(ledger)}
                      aria-label="Record payment"
                    >
                      <CreditCard className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-4 lg:hidden">
        {ledgers.map((ledger) => (
          <Card key={ledger.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-sky-100 font-display text-sm font-bold text-primary">
                    {ledger.student_name?.charAt(0) || "S"}
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">{ledger.student_name}</p>
                    <p className="text-sm text-text-secondary">{ledger.student_code}</p>
                  </div>
                </div>
                <FeeStatusBadge status={ledger.due_status} />
              </div>

              <div className="mt-4 grid gap-3 rounded-2xl border border-gray-100 bg-slate-50/70 p-4 text-sm">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                    Academic Mapping
                  </p>
                  <p className="mt-1 text-text-primary">{ledger.course_name}</p>
                  <p className="text-text-secondary">
                    {ledger.batch_name || "Batch not assigned"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                    Fee Plan
                  </p>
                  <p className="mt-1 font-mono text-text-primary">{formatCurrency(ledger.net_fee)}</p>
                  <p className="text-text-secondary">
                    Due {formatCurrency(ledger.due_amount)} by {formatDate(ledger.due_date)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                    Collections
                  </p>
                  <p className="mt-1 font-mono text-text-primary">
                    {formatCurrency(ledger.total_collected)} collected
                  </p>
                  <p className="text-text-secondary">
                    {ledger.payment_count} payments
                    {ledger.last_payment_date
                      ? ` | last on ${formatDate(ledger.last_payment_date)}`
                      : ""}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/admin/fees/${ledger.id}`}>
                    <Eye className="h-4 w-4" />
                    View
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => onEditPlan(ledger)}>
                  <Pencil className="h-4 w-4" />
                  Edit Plan
                </Button>
                <Button size="sm" onClick={() => onRecordPayment(ledger)}>
                  <CreditCard className="h-4 w-4" />
                  Record Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
