/**
 * Utility to generate and download official printable DV Confirmation Reference Slips.
 * Specifically embeds and highlights Entrant First Name and Last Name for instant identification.
 */

export interface DvSlipData {
  applicantName: string;
  applicantFirstName?: string;
  applicantLastName?: string;
  confirmationNumber: string;
  stationaryName: string;
  submittedAt?: string;
  paymentReference?: string | null;
  paymentMethod?: string | null;
  dvPdfUrl?: string | null;
}

/**
 * Downloads the official uploaded DV confirmation PDF from Backblaze B2,
 * ensuring the downloaded file is named with the Entrant's First & Last Name.
 */
export function downloadOfficialDvPdf(
  dvPdfUrl: string,
  firstName?: string,
  lastName?: string,
  confirmationNumber?: string
) {
  if (!dvPdfUrl) return;

  const cleanFirst = (firstName || "Entrant").replace(/[^a-zA-Z0-9]/g, "_");
  const cleanLast = (lastName || "Candidate").replace(/[^a-zA-Z0-9]/g, "_");
  const cleanConf = (confirmationNumber || "CONF").replace(/[^a-zA-Z0-9]/g, "");
  const downloadFileName = `DV2026-CONFIRMATION-${cleanFirst}_${cleanLast}-${cleanConf}.pdf`;

  // Create temporary anchor to trigger native file download
  const link = document.createElement("a");
  link.href = dvPdfUrl;
  link.download = downloadFileName;
  link.target = "_blank";
  link.rel = "noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates and downloads the official printable DV confirmation slip,
 * with prominent FIRST NAME and LAST NAME in both document text and download filename.
 */
export function downloadDvConfirmationSlip(data: DvSlipData): void {
  // If an official PDF uploaded by the Super Admin exists, trigger direct download
  if (data.dvPdfUrl && data.dvPdfUrl.length > 5 && !data.dvPdfUrl.endsWith(".html")) {
    downloadOfficialDvPdf(
      data.dvPdfUrl,
      data.applicantFirstName,
      data.applicantLastName,
      data.confirmationNumber
    );
    return;
  }

  // Extract explicit First Name and Last Name
  let firstName = data.applicantFirstName || "";
  let lastName = data.applicantLastName || "";

  if (!firstName || !lastName) {
    const rawParts = (data.applicantName || "").trim().split(/\s+/);
    if (rawParts.length === 1) {
      firstName = rawParts[0] || "ENTRANT";
      lastName = rawParts[0] || "CANDIDATE";
    } else {
      firstName = rawParts[0];
      lastName = rawParts.slice(1).join(" ");
    }
  }

  const cleanFirst = firstName.replace(/[^a-zA-Z0-9]/g, "_");
  const cleanLast = lastName.replace(/[^a-zA-Z0-9]/g, "_");

  const printDate = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const entryDate = data.submittedAt
    ? new Date(data.submittedAt).toLocaleString("en-US", {
        dateStyle: "full",
        timeStyle: "medium",
      })
    : printDate;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>DV-2026 Confirmation - ${firstName} ${lastName} (${data.confirmationNumber})</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      margin: 0;
      padding: 24px;
      background: #f8fafc;
    }
    .sheet {
      max-width: 680px;
      margin: 0 auto;
      background: #ffffff;
      border: 2px solid #0f172a;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 18px;
      margin-bottom: 20px;
    }
    .brand {
      font-size: 20px;
      font-weight: 900;
      color: #1e3a8a;
      letter-spacing: 0.5px;
      margin: 0;
      text-transform: uppercase;
    }
    .sub {
      font-size: 11px;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 700;
      margin-top: 5px;
      letter-spacing: 1px;
    }
    .status-badge {
      display: inline-block;
      background: #10b981;
      color: #ffffff;
      font-weight: 800;
      font-size: 11px;
      padding: 4px 14px;
      border-radius: 9999px;
      margin-top: 10px;
      letter-spacing: 0.5px;
    }

    /* ENTRANT NAME IDENTITY BANNER - PROMINENT FIRST & LAST NAME */
    .name-banner {
      background: #f1f5f9;
      border: 2px solid #cbd5e1;
      border-radius: 12px;
      padding: 16px 20px;
      margin: 18px 0;
      text-align: center;
    }
    .name-banner-title {
      font-size: 10px;
      font-weight: 800;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 8px;
    }
    .name-banner-first-last {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .name-chip {
      background: #ffffff;
      border: 1.5px solid #0f172a;
      border-radius: 8px;
      padding: 8px 16px;
      text-align: center;
      min-width: 140px;
    }
    .name-chip-label {
      display: block;
      font-size: 9px;
      font-weight: 800;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .name-chip-value {
      display: block;
      font-size: 17px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: 0.5px;
    }
    .name-chip.first-name-chip {
      border-color: #2563eb;
      background: #eff6ff;
    }
    .name-chip.first-name-chip .name-chip-value {
      color: #1d4ed8;
    }
    .name-chip.last-name-chip {
      border-color: #0f172a;
    }

    .hero-box {
      background: #f0fdf4;
      border: 2px dashed #16a34a;
      border-radius: 12px;
      padding: 18px;
      text-align: center;
      margin: 18px 0;
    }
    .hero-label {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: #166534;
      letter-spacing: 1.5px;
    }
    .hero-number {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 26px;
      font-weight: 900;
      color: #15803d;
      margin: 8px 0;
      letter-spacing: 3px;
    }
    .hero-hint {
      font-size: 11px;
      color: #166534;
      font-weight: 600;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 18px 0;
    }
    .data-table tr {
      border-bottom: 1px solid #f1f5f9;
    }
    .data-table td {
      padding: 9px 4px;
      font-size: 13px;
    }
    .data-table td.label {
      font-weight: 700;
      color: #64748b;
      width: 40%;
    }
    .data-table td.val {
      font-weight: 800;
      color: #0f172a;
    }
    .data-table td.val-highlight {
      font-size: 14px;
      font-weight: 900;
      color: #1d4ed8;
    }
    .notice-box {
      background: #eff6ff;
      border-left: 4px solid #2563eb;
      padding: 12px 14px;
      border-radius: 6px;
      margin: 18px 0;
    }
    .notice-title {
      font-size: 11px;
      font-weight: 800;
      color: #1e40af;
      margin-bottom: 4px;
      text-transform: uppercase;
    }
    .notice-text {
      font-size: 11px;
      color: #1e3a8a;
      line-height: 1.5;
      margin: 0;
    }
    .barcode-box {
      text-align: center;
      margin-top: 16px;
      padding-top: 14px;
      border-top: 1px solid #e2e8f0;
    }
    .barcode-svg {
      max-width: 260px;
      height: 44px;
      margin: 0 auto;
      display: block;
    }
    .footer {
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      margin-top: 14px;
    }
    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .sheet {
        border: 1.5px solid #000000;
        box-shadow: none;
        border-radius: 0;
        padding: 24px;
        max-width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <h1 class="brand">ETHIO DV PROXY • DV-2026 OFFICIAL CONFIRMATION</h1>
      <div class="sub">ELECTRONIC DIVERSITY VISA ENTRY RECEIPT & REFERENCE</div>
      <div class="status-badge">OFFICIAL VERIFIED ENTRY ✓</div>
    </div>

    <!-- PROMINENT ENTRANT FIRST NAME & LAST NAME IDENTIFICATION BOX -->
    <div class="name-banner">
      <div class="name-banner-title">OFFICIAL ENTRANT IDENTIFICATION (የአመልካች ስም)</div>
      <div class="name-banner-first-last">
        <div class="name-chip first-name-chip">
          <span class="name-chip-label">FIRST / GIVEN NAME</span>
          <span class="name-chip-value">${firstName.toUpperCase()}</span>
        </div>
        <div class="name-chip last-name-chip">
          <span class="name-chip-label">LAST / FAMILY NAME</span>
          <span class="name-chip-value">${lastName.toUpperCase()}</span>
        </div>
      </div>
    </div>

    <div class="hero-box">
      <div class="hero-label">ENTRANT CONFIRMATION NUMBER (የማረጋገጫ ቁጥር)</div>
      <div class="hero-number">${data.confirmationNumber}</div>
      <div class="hero-hint">Keep this confirmation number safe to verify lottery selection results in May 2027.</div>
    </div>

    <table class="data-table">
      <tr>
        <td class="label">Entrant First Name (የመጀመሪያ ስም):</td>
        <td class="val val-highlight">${firstName.toUpperCase()}</td>
      </tr>
      <tr>
        <td class="label">Entrant Last Name (የአያት ስም):</td>
        <td class="val val-highlight">${lastName.toUpperCase()}</td>
      </tr>
      <tr>
        <td class="label">Full Legal Record Name:</td>
        <td class="val">${data.applicantName.toUpperCase()}</td>
      </tr>
      <tr>
        <td class="label">Date & Time of Entry:</td>
        <td class="val">${entryDate}</td>
      </tr>
      <tr>
        <td class="label">Stationary Shop / Terminal:</td>
        <td class="val">${data.stationaryName}</td>
      </tr>
      <tr>
        <td class="label">Filing Status:</td>
        <td class="val" style="color: #2563eb;">FILLED & SUBMITTED ✓</td>
      </tr>
      <tr>
        <td class="label">Payment Status:</td>
        <td class="val" style="color: #16a34a;">SETTLED & PAID ✓ (${data.paymentMethod || "CBE / Telebirr"})</td>
      </tr>
      ${
        data.paymentReference
          ? `
      <tr>
        <td class="label">Settlement Reference / TxID:</td>
        <td class="val" style="font-family: monospace; color: #d97706;">${data.paymentReference}</td>
      </tr>
      `
          : ""
      }
    </table>

    <div class="notice-box">
      <div class="notice-title">IMPORTANT APPLICANT NOTICE (ጠቃሚ ማሳሰቢያ):</div>
      <p class="notice-text">
        Please retain this confirmation document. Your official Confirmation Number is required to check your Diversity Visa entry status at the Department of State official website (dvprogram.state.gov). The Department of State does not notify entrants by email, letter, or phone.
      </p>
    </div>

    <div class="barcode-box">
      <svg class="barcode-svg" viewBox="0 0 260 48" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="4" width="4" height="40" fill="#0f172a" />
        <rect x="18" y="4" width="2" height="40" fill="#0f172a" />
        <rect x="24" y="4" width="6" height="40" fill="#0f172a" />
        <rect x="34" y="4" width="2" height="40" fill="#0f172a" />
        <rect x="40" y="4" width="4" height="40" fill="#0f172a" />
        <rect x="48" y="4" width="8" height="40" fill="#0f172a" />
        <rect x="60" y="4" width="2" height="40" fill="#0f172a" />
        <rect x="66" y="4" width="6" height="40" fill="#0f172a" />
        <rect x="76" y="4" width="4" height="40" fill="#0f172a" />
        <rect x="84" y="4" width="2" height="40" fill="#0f172a" />
        <rect x="90" y="4" width="8" height="40" fill="#0f172a" />
        <rect x="102" y="4" width="4" height="40" fill="#0f172a" />
        <rect x="110" y="4" width="2" height="40" fill="#0f172a" />
        <rect x="116" y="4" width="6" height="40" fill="#0f172a" />
        <rect x="126" y="4" width="4" height="40" fill="#0f172a" />
        <rect x="134" y="4" width="8" height="40" fill="#0f172a" />
        <rect x="146" y="4" width="2" height="40" fill="#0f172a" />
        <rect x="152" y="4" width="6" height="40" fill="#0f172a" />
        <rect x="162" y="4" width="4" height="40" fill="#0f172a" />
        <rect x="170" y="4" width="8" height="40" fill="#0f172a" />
        <rect x="182" y="4" width="2" height="40" fill="#0f172a" />
        <rect x="188" y="4" width="6" height="40" fill="#0f172a" />
        <rect x="198" y="4" width="4" height="40" fill="#0f172a" />
        <rect x="206" y="4" width="8" height="40" fill="#0f172a" />
        <rect x="218" y="4" width="4" height="40" fill="#0f172a" />
        <rect x="226" y="4" width="2" height="40" fill="#0f172a" />
        <rect x="232" y="4" width="6" height="40" fill="#0f172a" />
        <rect x="242" y="4" width="4" height="40" fill="#0f172a" />
      </svg>
      <div style="font-family: monospace; font-size: 11px; letter-spacing: 2px; color: #475569; margin-top: 4px;">
        * ${data.confirmationNumber} *
      </div>
    </div>

    <div class="footer">
      Generated via Ethio DV Proxy System • Terminal: ${data.stationaryName} • Issued on ${printDate}
    </div>
  </div>
  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  // Trigger file download with FIRST NAME and LAST NAME in the filename
  const a = document.createElement("a");
  a.href = url;
  a.download = `DV2026-CONFIRMATION-${cleanFirst}_${cleanLast}-${data.confirmationNumber}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Also open print window
  const printWindow = window.open(url, "_blank");
  if (printWindow) {
    printWindow.focus();
  }
}
