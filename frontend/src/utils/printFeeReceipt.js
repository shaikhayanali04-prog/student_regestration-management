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

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export function printFeeReceipt(receipt) {
  if (!receipt || typeof window === "undefined") {
    return;
  }

  const printWindow = window.open("", "fee-receipt", "width=920,height=760");
  if (!printWindow) {
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(receipt.receipt_number || "Receipt")}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 32px;
            color: #111827;
            background: #ffffff;
          }
          .sheet {
            max-width: 820px;
            margin: 0 auto;
            border: 1px solid #e5e7eb;
            border-radius: 20px;
            overflow: hidden;
          }
          .header {
            padding: 28px 32px;
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            color: white;
          }
          .header h1 {
            margin: 8px 0 0;
            font-size: 30px;
          }
          .section {
            padding: 24px 32px;
            border-top: 1px solid #e5e7eb;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
          }
          .card {
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            padding: 16px;
          }
          .label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: #6b7280;
            margin-bottom: 8px;
          }
          .value {
            font-size: 16px;
            font-weight: 700;
          }
          .amount-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
          }
          .amount-box {
            border-radius: 16px;
            padding: 18px;
            background: #f8fafc;
          }
          .amount-box strong {
            display: block;
            margin-top: 8px;
            font-size: 24px;
          }
          .footer {
            padding: 20px 32px 32px;
            font-size: 13px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="header">
            <div>SMART COACHING ERP</div>
            <h1>Payment Receipt</h1>
            <div>Receipt No. ${escapeHtml(receipt.receipt_number || "Pending")}</div>
          </div>
          <div class="section">
            <div class="grid">
              <div class="card">
                <div class="label">Student</div>
                <div class="value">${escapeHtml(receipt.student_name)}</div>
                <div>${escapeHtml(receipt.student_id)}</div>
                <div>${escapeHtml(receipt.phone || "Phone not captured")}</div>
              </div>
              <div class="card">
                <div class="label">Course Details</div>
                <div class="value">${escapeHtml(receipt.course_name)}</div>
                <div>${escapeHtml(receipt.batch_name || "Batch not assigned")}</div>
                <div>Paid on ${escapeHtml(formatDate(receipt.payment_date))}</div>
              </div>
            </div>
          </div>
          <div class="section">
            <div class="amount-grid">
              <div class="amount-box">
                <div class="label">Tuition Amount</div>
                <strong>${escapeHtml(formatCurrency(receipt.amount_paid))}</strong>
              </div>
              <div class="amount-box">
                <div class="label">Late Fee</div>
                <strong>${escapeHtml(formatCurrency(receipt.late_fee))}</strong>
              </div>
              <div class="amount-box">
                <div class="label">Total Received</div>
                <strong>${escapeHtml(formatCurrency(receipt.total_collected))}</strong>
              </div>
            </div>
          </div>
          <div class="section">
            <div class="grid">
              <div class="card">
                <div class="label">Payment Method</div>
                <div class="value">${escapeHtml(receipt.payment_method)}</div>
              </div>
              <div class="card">
                <div class="label">Transaction Reference</div>
                <div class="value">${escapeHtml(receipt.transaction_id || "Not provided")}</div>
              </div>
            </div>
          </div>
          <div class="section">
            <div class="label">Remarks</div>
            <div>${escapeHtml(receipt.remarks || "No remarks were added for this payment.")}</div>
          </div>
          <div class="footer">
            Generated from Smart Coaching ERP on ${escapeHtml(formatDate(new Date()))}
          </div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  window.setTimeout(() => {
    printWindow.print();
  }, 250);
}
