import { useCallback, useEffect, useMemo, useState } from "react";
import { CircleDollarSign, CreditCard, Plus, RotateCcw, Search } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { EmptyState } from "../components/ui/empty-state";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import FeeLedgerList from "../components/fees/FeeLedgerList";
import FeePlanDialog from "../components/fees/FeePlanDialog";
import PaymentDialog from "../components/fees/PaymentDialog";
import FeeSummaryCards from "../components/fees/FeeSummaryCards";
import feeService from "../services/feeService";

const initialMeta = {
  courses: [],
  batches: [],
  enrollments: [],
  due_statuses: [],
  payment_modes: [],
};

const initialResult = {
  items: [],
  meta: {
    summary: {
      ledger_count: 0,
      total_collected: 0,
      pending_fees: 0,
      overdue_fees: 0,
      today_collection: 0,
    },
    pagination: {
      page: 1,
      limit: 8,
      total: 0,
      total_pages: 1,
    },
  },
};

export default function Fees() {
  const [feesResult, setFeesResult] = useState(initialResult);
  const [meta, setMeta] = useState(initialMeta);
  const [query, setQuery] = useState({
    search: "",
    course_id: "",
    batch_id: "",
    due_status: "",
    payment_from: "",
    payment_to: "",
    page: 1,
    limit: 8,
  });
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [editingLedger, setEditingLedger] = useState(null);
  const [paymentLedger, setPaymentLedger] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const ledgers = feesResult.items || [];
  const summary = feesResult.meta?.summary || initialResult.meta.summary;
  const pagination = feesResult.meta?.pagination || initialResult.meta.pagination;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setQuery((current) => ({
        ...current,
        page: 1,
        search: searchInput.trim(),
      }));
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const loadMeta = useCallback(async () => {
    try {
      const response = await feeService.getMeta();
      setMeta(response || initialMeta);
    } catch (requestError) {
      console.error(requestError);
    }
  }, []);

  const fetchLedgers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await feeService.getLedgers(query);
      setFeesResult(response || initialResult);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "We couldn't load the fee ledgers right now.",
      );
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    fetchLedgers();
  }, [fetchLedgers]);

  const filteredBatches = useMemo(() => {
    if (!query.course_id) {
      return meta.batches || [];
    }

    return (meta.batches || []).filter(
      (batch) => String(batch.course_id) === String(query.course_id),
    );
  }, [meta.batches, query.course_id]);

  const updateFilter = (key, value) => {
    setQuery((current) => ({
      ...current,
      page: 1,
      [key]: value,
      ...(key === "course_id" ? { batch_id: "" } : {}),
    }));
  };

  const resetFilters = () => {
    setSearchInput("");
    setQuery({
      search: "",
      course_id: "",
      batch_id: "",
      due_status: "",
      payment_from: "",
      payment_to: "",
      page: 1,
      limit: 8,
    });
  };

  const refreshAll = async () => {
    await Promise.all([fetchLedgers(), loadMeta()]);
  };

  const openCreateDialog = () => {
    setEditingLedger(null);
    setFormError("");
    setDialogOpen(true);
  };

  const openEditDialog = (ledger) => {
    setEditingLedger(ledger);
    setFormError("");
    setDialogOpen(true);
  };

  const openPaymentDialog = (ledger) => {
    setPaymentLedger(ledger);
    setFormError("");
    setPaymentDialogOpen(true);
  };

  const closePlanDialog = () => {
    setDialogOpen(false);
    setEditingLedger(null);
    setFormError("");
  };

  const closePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setPaymentLedger(null);
    setFormError("");
  };

  const handleConfigurePlan = async (payload) => {
    try {
      setFormLoading(true);
      setFormError("");
      const response = await feeService.configurePlan(payload);
      closePlanDialog();
      setFeedback({
        type: "success",
        message: `${response?.ledger?.student_name || "Fee plan"} has been saved successfully.`,
      });
      await refreshAll();
    } catch (requestError) {
      setFormError(
        requestError?.response?.data?.message ||
          "Unable to save the fee plan right now.",
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
      closePaymentDialog();
      const latestReceipt = response?.payments?.[0]?.receipt_number;
      setFeedback({
        type: "success",
        message: latestReceipt
          ? `Payment recorded successfully. Receipt ${latestReceipt} is ready.`
          : "Payment recorded successfully.",
      });
      await refreshAll();
    } catch (requestError) {
      setFormError(
        requestError?.response?.data?.message ||
          "Unable to record the payment right now.",
      );
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Fees Module
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
            Fee Collection & Dues
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Configure fee plans, track dues, record installments, and generate receipt-ready payment records across every enrollment.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="gap-2" onClick={refreshAll}>
            <RotateCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            className="gap-2"
            onClick={openCreateDialog}
            disabled={!meta.enrollments.length}
          >
            <Plus className="h-4 w-4" />
            Configure Fee Plan
          </Button>
        </div>
      </div>

      {!meta.enrollments.length ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          No student-course enrollments are available yet. Assign students to courses first, then configure their fee plans here.
        </div>
      ) : null}

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

      {loading ? (
        <div className="space-y-4">
          <FeeSummaryCards summary={summary} />
          <Card className="rounded-[28px] border-border">
            <CardContent className="space-y-3 p-6">
              {[1, 2, 3, 4].map((item) => (
                <Skeleton key={item} className="h-20 rounded-2xl" />
              ))}
            </CardContent>
          </Card>
        </div>
      ) : error ? (
        <EmptyState
          icon={CircleDollarSign}
          title="Fee data could not be loaded"
          description={error}
          action={<Button onClick={fetchLedgers}>Retry Loading Fees</Button>}
        />
      ) : (
        <>
          <FeeSummaryCards summary={summary} />

          <Card className="rounded-[30px] border-border shadow-sm">
            <CardHeader className="space-y-4 border-b border-border bg-muted/10">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <CardTitle className="text-2xl">Fee Ledger Directory</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Search by student, course, batch, or payment activity and act on dues quickly.
                  </p>
                </div>
                <div className="flex flex-col gap-3 md:flex-row">
                  <div className="relative min-w-[280px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      placeholder="Search by student, course, batch, phone, or ID"
                      className="rounded-full pl-10"
                    />
                  </div>
                  <Button variant="outline" className="rounded-full" onClick={resetFilters}>
                    Clear Filters
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                <select
                  value={query.course_id}
                  onChange={(event) => updateFilter("course_id", event.target.value)}
                  className="flex h-10 w-full rounded-full border border-input bg-background px-4 text-sm"
                >
                  <option value="">All courses</option>
                  {(meta.courses || []).map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.course_name}
                    </option>
                  ))}
                </select>
                <select
                  value={query.batch_id}
                  onChange={(event) => updateFilter("batch_id", event.target.value)}
                  className="flex h-10 w-full rounded-full border border-input bg-background px-4 text-sm"
                >
                  <option value="">All batches</option>
                  {filteredBatches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.batch_name}
                    </option>
                  ))}
                </select>
                <select
                  value={query.due_status}
                  onChange={(event) => updateFilter("due_status", event.target.value)}
                  className="flex h-10 w-full rounded-full border border-input bg-background px-4 text-sm"
                >
                  <option value="">All due states</option>
                  {(meta.due_statuses || []).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <Input
                  type="date"
                  value={query.payment_from}
                  onChange={(event) => updateFilter("payment_from", event.target.value)}
                  className="rounded-full"
                />
                <Input
                  type="date"
                  value={query.payment_to}
                  onChange={(event) => updateFilter("payment_to", event.target.value)}
                  className="rounded-full"
                />
                <select
                  value={String(query.limit)}
                  onChange={(event) => updateFilter("limit", Number(event.target.value))}
                  className="flex h-10 w-full rounded-full border border-input bg-background px-4 text-sm"
                >
                  {[8, 12, 20].map((size) => (
                    <option key={size} value={size}>
                      {size} per page
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {ledgers.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={CreditCard}
                    title="No fee ledgers found"
                    description="No fee plans matched the current filters. Configure a new fee plan or reset the filters to widen the results."
                    action={
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Button variant="outline" onClick={resetFilters}>
                          Reset Filters
                        </Button>
                        <Button onClick={openCreateDialog} disabled={!meta.enrollments.length}>
                          Configure Fee Plan
                        </Button>
                      </div>
                    }
                  />
                </div>
              ) : (
                <>
                  <FeeLedgerList
                    ledgers={ledgers}
                    onEditPlan={openEditDialog}
                    onRecordPayment={openPaymentDialog}
                  />

                  <div className="flex flex-col gap-4 border-t border-border px-6 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <p>
                      Showing {(pagination.page - 1) * pagination.limit + 1}-
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                      {pagination.total} ledgers
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setQuery((current) => ({
                            ...current,
                            page: current.page - 1,
                          }))
                        }
                        disabled={pagination.page <= 1}
                      >
                        Previous
                      </Button>
                      <span className="min-w-[96px] text-center">
                        Page {pagination.page} of {pagination.total_pages || 1}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setQuery((current) => ({
                            ...current,
                            page: current.page + 1,
                          }))
                        }
                        disabled={pagination.page >= pagination.total_pages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <FeePlanDialog
        key={`${editingLedger?.id || "new"}-${dialogOpen ? "open" : "closed"}`}
        open={dialogOpen}
        mode={editingLedger ? "edit" : "create"}
        ledger={editingLedger}
        meta={meta}
        loading={formLoading}
        error={formError}
        onClose={closePlanDialog}
        onSubmit={handleConfigurePlan}
      />

      <PaymentDialog
        key={`${paymentLedger?.id || "payment"}-${paymentDialogOpen ? "open" : "closed"}`}
        open={paymentDialogOpen}
        ledger={paymentLedger}
        meta={meta}
        loading={formLoading}
        error={formError}
        onClose={closePaymentDialog}
        onSubmit={handleRecordPayment}
      />
    </div>
  );
}
