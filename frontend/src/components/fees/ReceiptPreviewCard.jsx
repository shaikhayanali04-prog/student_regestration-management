import { FileText, Printer } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { EmptyState } from "../ui/empty-state";
import { Skeleton } from "../ui/skeleton";

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
    : "Not available";

export default function ReceiptPreviewCard({
  receipt,
  loading,
  error,
  onPrint,
  onRetry,
}) {
  if (loading) {
    return (
      <Card className="rounded-3xl border-border">
        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-7 w-48 rounded-full" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={FileText}
        title="Receipt preview unavailable"
        description={error}
        action={onRetry ? <Button onClick={onRetry}>Retry Receipt</Button> : null}
      />
    );
  }

  if (!receipt) {
    return (
      <EmptyState
        icon={FileText}
        title="No receipt selected"
        description="Choose a payment entry to load its receipt preview and print it."
      />
    );
  }

  return (
    <Card className="rounded-3xl border-border shadow-sm">
      <CardHeader className="flex flex-col gap-4 border-b border-border bg-muted/10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Smart Coaching ERP
          </p>
          <CardTitle className="mt-2 text-2xl">Payment Receipt</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Receipt No. {receipt.receipt_number || "Pending"}
          </p>
        </div>
        <Button className="gap-2" onClick={onPrint}>
          <Printer className="h-4 w-4" />
          Print Receipt
        </Button>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Student
            </p>
            <p className="mt-2 text-lg font-semibold text-foreground">{receipt.student_name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{receipt.student_id}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {receipt.phone || "Phone not captured"}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Course Details
            </p>
            <p className="mt-2 text-lg font-semibold text-foreground">{receipt.course_name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {receipt.batch_name || "Batch not assigned"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Paid on {formatDate(receipt.payment_date)}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Tuition Amount
              </p>
              <p className="mt-2 text-2xl font-black text-foreground">
                {formatCurrency(receipt.amount_paid)}
              </p>
            </div>
            <div className="rounded-2xl bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Late Fee
              </p>
              <p className="mt-2 text-2xl font-black text-foreground">
                {formatCurrency(receipt.late_fee)}
              </p>
            </div>
            <div className="rounded-2xl bg-primary/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Total Received
              </p>
              <p className="mt-2 text-2xl font-black text-foreground">
                {formatCurrency(receipt.total_collected)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Payment Method
            </p>
            <p className="mt-2 font-medium text-foreground">{receipt.payment_method}</p>
          </div>
          <div className="rounded-2xl border border-border p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Transaction Reference
            </p>
            <p className="mt-2 font-medium text-foreground">
              {receipt.transaction_id || "Not provided"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-muted/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Remarks
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
            {receipt.remarks || "No remarks were added for this payment."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
