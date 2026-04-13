import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  Eye,
  NotebookText,
  Pencil,
  Printer,
  Wallet,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { EmptyState } from "../components/ui/empty-state";
import { Skeleton } from "../components/ui/skeleton";
import FeePlanDialog from "../components/fees/FeePlanDialog";
import FeeStatusBadge from "../components/fees/FeeStatusBadge";
import PaymentDialog from "../components/fees/PaymentDialog";
import feeService from "../services/feeService";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function FeeProfile() {
  const { feeId } = useParams();
  const [record, setRecord] = useState(null);
  const [meta, setMeta] = useState({
    enrollments: [],
    payment_modes: [],
    due_statuses: [],
    courses: [],
    batches: [],
  });
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [planOpen, setPlanOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const loadLedger = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [ledgerData, metaData] = await Promise.all([
        feeService.getLedger(feeId),
        feeService.getMeta(),
      ]);
      setRecord(ledgerData);
      setMeta(metaData);
      if (ledgerData?.payments?.[0]) {
        const receipt = await feeService.getReceipt(ledgerData.payments[0].id);
        setSelectedReceipt(receipt);
      } else {
        setSelectedReceipt(null);
      }
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "We couldn't load the fee ledger right now.",
      );
    } finally {
      setLoading(false);
    }
  }, [feeId]);

  useEffect(() => {
    loadLedger();
  }, [loadLedger]);

  const ledger = record?.ledger;

  const stats = useMemo(
    () => [
      { label: "Net Fee", value: formatCurrency(ledger?.net_fee || 0), icon: Wallet },
      { label: "Collected", value: formatCurrency(ledger?.total_collected || 0), icon: CreditCard },
      { label: "Pending", value: formatCurrency(ledger?.due_amount || 0), icon: NotebookText },
      { label: "Payments", value: ledger?.payment_count || 0, icon: Eye },
    ],
    [ledger],
  );

  const handlePlanSave = async (payload) => {
    try {
      setFormLoading(true);
      setFormError("");
      const response = await feeService.configurePlan(payload);
      setRecord(response);
      setPlanOpen(false);
    } catch (requestError) {
      setFormError(
        requestError?.response?.data?.message || "Unable to save the fee plan right now.",
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handlePaymentSave = async (payload) => {
    try {
      setFormLoading(true);
      setFormError("");
      const response = await feeService.recordPayment(payload);
      setRecord(response);
      setPaymentOpen(false);
      if (response?.payments?.[0]) {
        const receipt = await feeService.getReceipt(response.payments[0].id);
        setSelectedReceipt(receipt);
      }
    } catch (requestError) {
      setFormError(
        requestError?.response?.data?.message || "Unable to record the payment right now.",
      );
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <Skeleton className="h-10 w-44 rounded-full" />
        <Skeleton className="h-52 rounded-3xl" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-28 rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-[420px] rounded-3xl" />
      </div>
    );
  }

  if (error || !ledger) {
    return (
      <EmptyState
        title="Fee ledger unavailable"
        description={error || "We couldn't find that fee ledger."}
        action={
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link to="/admin/fees">Back to Fees</Link>
            </Button>
            <Button onClick={loadLedger}>Retry</Button>
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Button variant="ghost" asChild className="mb-3 -ml-3 text-muted-foreground">
            <Link to="/admin/fees">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to fees
            </Link>
          </Button>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {ledger.student_name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {ledger.student_code} • {ledger.course_name}
            {ledger.batch_name ? ` • ${ledger.batch_name}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <FeeStatusBadge status={ledger.due_status} />
          <Button variant="outline" className="gap-2" onClick={() => setPlanOpen(true)}>
            <Pencil className="h-4 w-4" />
            Edit Plan
          </Button>
          <Button className="gap-2" onClick={() => setPaymentOpen(true)}>
            <CreditCard className="h-4 w-4" />
            Record Payment
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden rounded-[28px] border-border bg-gradient-to-br from-primary/15 via-card to-card shadow-lg">
        <CardContent className="p-0">
          <div className="grid gap-0 lg:grid-cols-[320px,1fr]">
            <div className="border-b border-border/70 bg-background/60 p-6 lg:border-b-0 lg:border-r">
              <div className="flex h-40 items-center justify-center rounded-3xl border border-border bg-muted/30">
                <Wallet className="h-16 w-16 text-primary" />
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-border bg-card/90 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    Fee Plan
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-foreground">
                    <p>Total Fee: {formatCurrency(ledger.total_fee)}</p>
                    <p>Discount: {formatCurrency(ledger.discount)}</p>
                    <p>Due Date: {ledger.due_date || "--"}</p>
                    <p>Installments: {ledger.installment_count || "Not set"}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-card/90 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    Notes
                  </p>
                  <p className="mt-3 text-sm leading-6 text-foreground">
                    {ledger.notes || "No fee plan notes added yet."}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="rounded-3xl border border-border bg-card/90 p-4 shadow-sm"
                    >
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="mt-2 text-lg font-bold text-foreground">{item.value}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <Card className="rounded-3xl border-border">
                  <CardHeader>
                    <CardTitle>Ledger Overview</CardTitle>
                    <CardDescription>Current collection health for this enrollment.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-medium text-foreground">{ledger.due_status}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Amount Paid</span>
                      <span className="font-medium text-foreground">{formatCurrency(ledger.amount_paid)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Late Fee Collected</span>
                      <span className="font-medium text-foreground">{formatCurrency(ledger.late_fee_collected)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Last Payment</span>
                      <span className="font-medium text-foreground">{ledger.last_payment_date || "--"}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-border">
                  <CardHeader>
                    <CardTitle>Printable Receipt</CardTitle>
                    <CardDescription>Latest receipt preview for quick admin reference.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {selectedReceipt ? (
                      <>
                        <div className="rounded-2xl border border-border p-4">
                          <p className="font-semibold text-foreground">{selectedReceipt.receipt_number}</p>
                          <p className="mt-1 text-muted-foreground">
                            {selectedReceipt.student_name} • {selectedReceipt.course_name}
                          </p>
                          <p className="mt-3 text-foreground">
                            Total collected: {formatCurrency(selectedReceipt.total_collected)}
                          </p>
                          <p className="text-muted-foreground">
                            {selectedReceipt.payment_method} • {selectedReceipt.payment_date}
                          </p>
                        </div>
                        <Button variant="outline" className="gap-2" onClick={() => window.print()}>
                          <Printer className="h-4 w-4" />
                          Print Receipt
                        </Button>
                      </>
                    ) : (
                      <p className="text-muted-foreground">
                        No receipts yet. Record a payment to generate one.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6 rounded-3xl border-border">
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>
                    Every installment and surcharge recorded against this student ledger.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {record?.payments?.length ? (
                    record.payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex flex-col gap-3 rounded-2xl border border-border p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <p className="font-semibold text-foreground">
                            {formatCurrency(payment.total_collected)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Receipt {payment.receipt_number} • {payment.payment_method}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>{payment.payment_date}</p>
                          <p>{payment.transaction_id || "No transaction reference"}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      title="No payments recorded yet"
                      description="Record the first installment to start building this payment timeline."
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <FeePlanDialog
        key={`${ledger.id}-${planOpen ? "open" : "closed"}-plan`}
        open={planOpen}
        mode="edit"
        ledger={ledger}
        meta={meta}
        loading={formLoading}
        error={formError}
        onClose={() => {
          setPlanOpen(false);
          setFormError("");
        }}
        onSubmit={handlePlanSave}
      />

      <PaymentDialog
        key={`${ledger.id}-${paymentOpen ? "open" : "closed"}-pay`}
        open={paymentOpen}
        ledger={ledger}
        meta={meta}
        loading={formLoading}
        error={formError}
        onClose={() => {
          setPaymentOpen(false);
          setFormError("");
        }}
        onSubmit={handlePaymentSave}
      />
    </div>
  );
}
