import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCollectionPeriod, getPeriodReport } from "@/lib/actions/periods";
import {
  formatCurrency,
  getMonthName,
  formatDate,
  daysBetween,
} from "@/lib/format";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const periodId = searchParams.get("period");

  if (!periodId) {
    return NextResponse.json(
      { error: "Period ID is required" },
      { status: 400 }
    );
  }

  try {
    const [period, report] = await Promise.all([
      getCollectionPeriod(periodId),
      getPeriodReport(periodId),
    ]);

    if (!period) {
      return NextResponse.json({ error: "Period not found" }, { status: 404 });
    }

    // Calculate summary
    const periodDays = daysBetween(period.start_date, period.end_date);

    // Generate HTML for viewing/printing
    const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Laporan Iuran ${getMonthName(period.month)} ${
      period.year
    } - E-Kencleng RT 7</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1e293b;
      line-height: 1.6;
      padding: 40px;
      max-width: 900px;
      margin: 0 auto;
      background: #f8fafc;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .print-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #10b981, #14b8a6);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .print-btn:hover {
      background: linear-gradient(135deg, #059669, #0d9488);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #10b981;
      padding-bottom: 20px;
    }
    .header h1 {
      color: #10b981;
      font-size: 28px;
      margin-bottom: 5px;
      letter-spacing: -0.5px;
    }
    .header p {
      color: #94a3b8;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      padding: 4px 12px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    th {
      background: #f1f5f9;
      font-weight: 600;
      color: #475569;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td {
      font-size: 14px;
    }
    tr:hover {
      background: #f8fafc;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
    .badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-success {
      background: #dcfce7;
      color: #16a34a;
    }
    .badge-danger {
      background: #fee2e2;
      color: #dc2626;
    }
    .money-positive {
      color: #059669;
      font-family: 'SF Mono', Monaco, monospace;
      font-weight: 600;
    }
    .money-negative {
      color: #dc2626;
      font-family: 'SF Mono', Monaco, monospace;
      font-weight: 600;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: end;
      color: #94a3b8;
      font-size: 12px;
    }
    @media print {
      body {
        padding: 0;
        background: white;
      }
      .container {
        box-shadow: none;
        padding: 20px;
      }
      .print-btn {
        display: none !important;
      }
      .summary {
        grid-template-columns: repeat(4, 1fr);
      }
    }
    @media (max-width: 768px) {
      .summary {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>LAPORAN KENCLENG RT 7</h1>
      <p>Periode: ${formatDate(period.start_date)} - ${formatDate(
      period.end_date
    )} (${periodDays} hari)</p>
    </div>

    <table>
      <thead>
        <tr>
          <th>Nama</th>
          <th class="text-right">Total Tagihan</th>
          <th class="text-right">Bayar</th>
          <th class="text-right">Hutang</th>
          <th class="text-center">Status</th>
        </tr>
      </thead>
      <tbody>
        ${report
          .map((row) => {
            const difference = row.total_paid - row.total_due;
            return `
            <tr>
              <td><strong>${row.household_name}</strong></td>
              <td class="text-right">${formatCurrency(row.total_due)}</td>
              <td class="text-right money-positive">${formatCurrency(
                row.total_paid
              )}</td>
              <td class="text-right ${
                difference >= 0 ? "money-positive" : "money-negative"
              }">
                ${difference >= 0 ? "+" : ""}${formatCurrency(difference)}
              </td>
              <td class="text-center">
                <span class="badge ${
                  row.status === "PAID" ? "badge-success" : "badge-danger"
                }">
                  ${row.status === "PAID" ? "Lunas" : "Belum Lunas"}
                </span>
              </td>
            </tr>
          `;
          })
          .join("")}
      </tbody>
    </table>

    <div class="footer">
      <p>Dicetak pada ${formatDate(new Date())} | E-Kencleng RT 7</p>
    </div>
  </div>

  <button class="print-btn" onclick="window.print()">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
    Cetak / Simpan PDF
  </button>
</body>
</html>
    `;

    // Return HTML response for viewing in browser
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
