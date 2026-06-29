import { NextRequest, NextResponse } from "next/server"
import { StartQueryExecutionCommand } from "@aws-sdk/client-athena"
import { athena, waitForQuery, getAllRows, buildMonthChunks } from "@/lib/athena"
import { getSalesDb, coerceSalesRow, upsertSalesBatch, ensureSalesTables } from "@/lib/db/sales"

export const runtime = "nodejs"
export const maxDuration = 300

async function syncRange(fromDate: string, toDate: string): Promise<number> {
  const sql = `
    SELECT
      CAST(DATE(date) AS VARCHAR) AS sale_date,
      store_name,
      sku,
      category,
      range_category,
      range,
      subrange,
      colourway,
      size,
      colour_family,
      department,
      CAST(sale_units AS INTEGER)   AS sale_units,
      sales_aud,
      sales_ex_tax_aud,
      sales_tax_aud,
      sale_cogs_est,
      CAST(refund_units AS INTEGER) AS refund_units,
      refunds_aud,
      refunds_ex_tax_aud,
      refunds_tax_aud,
      refund_cogs_est
    FROM "ss-dl".agg_salesbystoreskuday
    WHERE DATE(date) >= DATE '${fromDate}'
      AND DATE(date) <= DATE '${toDate}'
      AND sku IS NOT NULL AND sku <> ''
    ORDER BY DATE(date), store_name, sku
  `

  const start = await athena.send(new StartQueryExecutionCommand({
    QueryString: sql,
    WorkGroup: "primary",
    QueryExecutionContext: { Database: "ss-dl", Catalog: "AwsDataCatalog" },
  }))
  await waitForQuery(start.QueryExecutionId!)
  const raw  = await getAllRows(start.QueryExecutionId!)
  const db   = getSalesDb()
  const rows = raw.map(coerceSalesRow)
  return upsertSalesBatch(db, rows)
}

// GET — sync status
export async function GET() {
  try {
    await ensureSalesTables()
    const db = getSalesDb()
    const [countRes, rangeRes, lastSyncRes] = await Promise.all([
      db.query("SELECT COUNT(*) AS total FROM ss_sales_daily"),
      db.query("SELECT MIN(sale_date) AS min_date, MAX(sale_date) AS max_date FROM ss_sales_daily"),
      db.query("SELECT * FROM ss_sales_sync_log ORDER BY synced_at DESC LIMIT 10"),
    ])
    return NextResponse.json({
      total_rows:   parseInt(countRes.rows[0].total, 10),
      min_date:     rangeRes.rows[0].min_date,
      max_date:     rangeRes.rows[0].max_date,
      recent_syncs: lastSyncRes.rows,
    })
  } catch (err: any) {
    return NextResponse.json({ error: String(err.message ?? err) }, { status: 500 })
  }
}

// POST — trigger sync { from: "YYYY-MM-DD", to: "YYYY-MM-DD" }
export async function POST(req: NextRequest) {
  const t0 = Date.now()
  try {
    await ensureSalesTables()
    const body: any = await req.json().catch(() => ({}))
    const today = new Date().toISOString().slice(0, 10)
    const from: string = body.from ?? "2025-07-01"
    const to:   string = body.to   ?? today
    const triggeredBy: string = body.triggered_by ?? "manual"

    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      return NextResponse.json({ error: "Dates must be YYYY-MM-DD" }, { status: 400 })
    }

    const db     = getSalesDb()
    const chunks = buildMonthChunks(from, to)
    let totalRows = 0
    const results: { from: string; to: string; rows: number; ms: number; error?: string }[] = []

    for (const chunk of chunks) {
      const ct0 = Date.now()
      try {
        const rows = await syncRange(chunk.from, chunk.to)
        totalRows += rows
        results.push({ from: chunk.from, to: chunk.to, rows, ms: Date.now() - ct0 })
      } catch (err: any) {
        results.push({ from: chunk.from, to: chunk.to, rows: 0, ms: Date.now() - ct0, error: String(err.message) })
      }
    }

    const duration = Date.now() - t0
    await db.query(
      `INSERT INTO ss_sales_sync_log (from_date, to_date, rows_synced, duration_ms, triggered_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [from, to, totalRows, duration, triggeredBy]
    )

    return NextResponse.json({ ok: true, from, to, total_rows: totalRows, chunks: results, duration_ms: duration })
  } catch (err: any) {
    console.error("[finance-fold/api/sync/sales]", err)
    return NextResponse.json({ error: String(err.message ?? err) }, { status: 500 })
  }
}
