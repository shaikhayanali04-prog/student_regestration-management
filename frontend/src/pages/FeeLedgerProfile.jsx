import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  CreditCard,
  FileText,
  Pencil,
  ReceiptText,
  Wallet,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { EmptyState } from "../components/ui/empty-state";
import { Skeleton } from "../components/ui/skeleton";
import FeePlanDialog from "../components/fees/FeePlanDialog";
import PaymentDialog from "../components/fees/PaymentDialog";
import ReceiptPreviewCard from "../components/fees/ReceiptPreviewCard";
import FeeStatusBadge from "../components/fees/FeeStatusBadge";
import feeService from "../services/feeService";
import { printFeeReceipt } from "../utils/printFeeReceipt";

const tabs = ["Overview", "Payments", "Receipt"];

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

export default function FeeLedgerProfile() {
  const { feeId } = useParams();
  const [record, setRecord] = useState(null);
  const [meta, setMeta] = useState({
    courses: [],
    batches: [],
    enrollments: [],
    due_statuses: [],
    payment_modes: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [editingPlan, setEditingPlan] = useState(false);
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptError, setReceiptError] = useState("");

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
  const payments = useMemo(() => record?.payments || [], [record?.payments]);

  useEffect(() => {
    if (!payments.length) {
      setSelectedPaymentId(null);
      setReceipt(null);
      setReceiptError("");
      return;
    }

    const currentExists = payments.some(
      (payment) => String(payment.id) === String(selectedPaymentId),
    );

    if (!currentExists) {
      setSelectedPaymentId(payments[0].id);
    }
  }, [payments, selectedPaymentId]);

  const loadReceipt = useCallback(async (paymentId) => {
    if (!paymentId) {
      setReceipt(null);
      setReceiptError("");
      return;
    }

    try {
      setReceiptLoading(true);
      setReceiptError("");
      const response = await feeService.getReceipt(paymentId);
      setReceipt(response);
    } catch (requestError) {
      setReceipt(null);
      setReceiptError(
        requestError?.response?.data?.message ||
          "Unable to load the receipt preview right now.",
      );
    } finally {
      setReceiptLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedPaymentId) {
      loadReceipt(selectedPaymentId);
    }
  }, [loadReceipt, selectedPaymentId]);

  const quickStats = useMemo(
    () => [
      { label: "Net Fee", value: formatCurrency(ledger?.net_fee || 0), icon: Wallet },
      {
        label: "Collected",
        value: formatCurrency(ledger?.total_collected || 0),
        icon: CircleDollarSign,
      },
      {
        label: "Pending Due",
        value: formatCurrency(ledger?.due_amount || 0),
        icon: CreditCard,
      },
      {
        label: "Installments",
        value: ledger?.installment_count || ledger?.payment_count || 0,
        icon: CalendarDays,
      },
    ],
    [ledger?.due_amount, ledger?.installment_count, ledger?.net_fee, ledger?.payment_count, ledger?.total_collected],
  );

  const handleUpdatePlan = async (payload) => {
    try {
      setFormLoading(true);
      setFormError("");
      const response = await feeService.configurePlan(payload);
      setRecord(response);
      setEditingPlan(false);
      setFeedback({
        type: "success",
        message: "Fee plan updated successfully.",
      });
    } catch (requestError) {
      setFormError(
        requestError?.response?.data?.message ||
          "Unable to update the fee plan right now.",
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleRecordPayment = async (payload) => {
    try {
      setFormLoading(true);
      setFormError("");
      const response = await feeService.recordPayment(payload);
      setRecord(response);
      setRecordingPayment(false);
      if (response?.payments?.[0]?.id) {
        setSelectedPaymentId(response.payments[0].id);
        setActiveTab("Receipt");
      }
      setFeedback({
        type: "success",
        message: "Payment recorded and receipt generated successfully.",
      });
    } catch (requestError) {
      setFormError(
        requestError?.response?.data?.message ||
          "Unable to record the payment right now.",
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
        <Skeleton className="h-[360px] rounded-3xl" />
      </div>
    );
  }

  if (error || !ledger) {
    return (
      <EmptyState
        icon={Wallet}
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
            {ledger.student_code} - {ledger.course_name}
            {ledger.batch_name ? ` - ${ledger.batch_name}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <FeeStatusBadge status={ledger.due_status} />
          <Button variant="outline" className="gap-2" onClick={() => setEditingPlan(true)}>
            <Pencil className="h-4 w-4" />
            Edit Plan
          </Button>
          <Button className="gap-2" onClick={() => setRecordingPayment(true)}>
            <CreditCard className="h-4 w-4" />
            Record Payment
          </Button>
        </div>
      </div>

      {feedback ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            feedback.type === "error"
              ? "border-destructive/20 bg-destructive/10 text-destructive"
              : "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <Card className="overflow-hidden rounded-[28px] border-border bg-gradient-to-br from-primary/15 via-card to-card shadow-lg">
        <CardContent className="p-0">
          <div className="grid gap-0 lg:grid-cols-[300px,1fr]">
            <div className="border-b border-border/70 bg-background/60 p-6 lg:border-b-0 lg:border-r">
              <div className="flex h-40 items-center justify-center rounded-3xl border border-border bg-muted/30">
                <ReceiptText className="h-16 w-16 text-primary" />
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-border bg-card/90 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    Collection Status
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-foreground">
                    <p>Due Amount: {formatCurrency(ledger.due_amount)}</p>
                    <p className="text-muted-foreground">
                      Last payment {ledger.last_payment_date ? formatDate(ledger.last_payment_date) : "not recorded"}
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-card/90 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    Payment Plan
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-foreground">
                    <p>{ledger.installment_count || 0} planned installments</p>
                    <p className="text-muted-foreground">
                      Due by {formatDate(ledger.due_date)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {quickStats.map((item) => {
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

              <div className="mt-6 flex flex-wrap gap-2 rounded-2xl border border-border bg-background/60 p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                      activeTab === tab
                        ? "bg-primary text-primary-foreground shadow"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                {activeTab === "Overview" ? (
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="rounded-3xl border-border">
                      <CardHeader>
                        <CardTitle>Fee Plan Overview</CardTitle>
                        <CardDescription>Net fee, discount policy, due date, and plan guidance.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Total Fee</span>
                          <span className="font-medium text-foreground">{formatCurrency(ledger.total_fee)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Discount</span>
                          <span className="font-medium text-foreground">{formatCurrency(ledger.discount)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Net Fee</span>
                          <span className="font-medium text-foreground">{formatCurrency(ledger.net_fee)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Due Date</span>
                          <span className="font-medium text-foreground">{formatDate(ledger.due_date)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Joined On</span>
                          <span className="font-medium text-foreground">{formatDate(ledger.joined_date)}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-border">
                      <CardHeader>
                        <CardTitle>Collection Summary</CardTitle>
                        <CardDescription>Operational view of collected, overdue, and late-fee totals.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Collected</span>
                          <span className="font-medium text-foreground">{formatCurrency(ledger.amount_paid)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Late Fee Collected</span>
                          <span className="font-medium text-foreground">{formatCurrency(ledger.late_fee_collected)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Total Received</span>
                          <span className="font-medium text-foreground">{formatCurrency(ledger.total_collected)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Pending Due</span>
                          <span className="font-medium text-foreground">{formatCurrency(ledger.due_amount)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Recorded Payments</span>
                          <span className="font-medium text-foreground">{ledger.payment_count}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-border lg:col-span-2">
                      <CardHeader>
                        <CardTitle>Plan Notes</CardTitle>
                        <CardDescription>Special collection terms, installment guidance, and admin notes.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-wrap leading-7 text-foreground">
                          {ledger.notes || "No plan notes were added for this student yet."}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ) : null}

                {activeTab === "Payments" ? (
                  payments.length ? (
                    <div className="space-y-4">
                      {payments.map((payment) => (
                        <Card
                          key={payment.id}
                          className={`rounded-3xl border-border transition ${
                            String(selectedPaymentId) === String(payment.id)
                              ? "ring-2 ring-primary/40"
                              : ""
                          }`}
                        >
                          <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                              <div className="flex items-center gap-3">
                                <p className="font-semibold text-foreground">{formatCurrency(payment.total_collected)}</p>
                                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                  {payment.receipt_number || "Receipt pending"}
                                </span>
                              </div>
                              <div className="mt-2 grid gap-1 text-sm text-muted-foreground">
                                <p>{payment.payment_method} - {formatDate(payment.payment_date)}</p>
                                <p>
                                  Tuition {formatCurrency(payment.amount_paid)} | Late fee {formatCurrency(payment.late_fee)}
                                </p>
                                <p>Reference: {payment.transaction_id || "Not provided"}</p>
                              </div>
                            </div>

                            <div className="flex flex-col gap-3 lg:items-end">
                              <p className="max-w-md text-sm text-muted-foreground lg:text-right">
                                {payment.remarks || "No remarks added for this payment."}
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedPaymentId(payment.id);
                                  setActiveTab("Receipt");
                                }}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                View Receipt
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Clock3}
                      title="No payments recorded yet"
                      description="Record the first installment to build the payment history for this fee ledger."
                      action={<Button onClick={() => setRecordingPayment(true)}>Record Payment</Button>}
                    />
                  )
                ) : null}

                {activeTab === "Receipt" ? (
                  payments.length ? (
                    <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
                      <Card className="rounded-3xl border-border">
                        <CardHeader>
                          <CardTitle>Receipt History</CardTitle>
                          <CardDescription>Choose a payment entry to preview its receipt.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {payments.map((payment) => (
                            <button
                              key={payment.id}
                              type="button"
                              onClick={() => setSelectedPaymentId(payment.id)}
                              className={`w-full rounded-2xl border p-4 text-left transition ${
                                String(selectedPaymentId) === String(payment.id)
                                  ? "border-primary bg-primary/10"
                                  : "border-border bg-card hover:bg-muted/20"
                              }`}
                            >
                              <p className="font-semibold text-foreground">
                                {payment.receipt_number || "Receipt pending"}
                              </p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {formatDate(payment.payment_date)}
                              </p>
                              <p className="mt-2 text-sm text-foreground">
                                {formatCurrency(payment.total_collected)}
                              </p>
                            </button>
                          ))}
                        </CardContent>
                      </Card>

                      <ReceiptPreviewCard
                        receipt={receipt}
                        loading={receiptLoading}
                        error={receiptError}
                        onPrint={() => printFeeReceipt(receipt)}
                        onRetry={() => loadReceipt(selectedPaymentId)}
                      />
                    </div>
                  ) : (
                    <EmptyState
                      icon={ReceiptText}
                      title="No receipts available yet"
                      description="Receipts will appear here once a payment is recorded for this fee ledger."
                    />
                  )
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <FeePlanDialog
        key={`${ledger.id}-${editingPlan ? "plan-open" : "plan-closed"}`}
        open={editingPlan}
        mode="edit"
        ledger={ledger}
        meta={meta}
        loading={formLoading}
        error={formError}
        onClose={() => {
          setEditingPlan(false);
          setFormError("");
        }}
        onSubmit={handleUpdatePlan}
      />

      <PaymentDialog
        key={`${ledger.id}-${recordingPayment ? "pay-open" : "pay-closed"}`}
        open={recordingPayment}
        ledger={ledger}
        meta={meta}
        loading={formLoading}
        error={formError}
        onClose={() => {
          setRecordingPayment(false);
          setFormError("");
        }}
        onSubmit={handleRecordPayment}
      />
    </div>
  );
}
