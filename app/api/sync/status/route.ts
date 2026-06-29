import { NextResponse } from "next/server"
import { getLoopDb, ensureLoopTables, TABLE_DEFS } from "@/lib/db/loop"
import { getSalesDb, ensureSalesTables } from "@/lib/db/sales"

export const runtime = "nodejs"

// GET /api/sync/status — combined status for the sync panel
export async function GET() {
  const result: Record<string, any> = {}

  // Loop returns
  try {
    await ensureLoopTables()
    const db     = getLoopDb()
    const tables = Object.values(TABLE_DEFS).map(d => d.pg)
    const counts: Record<string, number> = {}
    for (const t of tables) {
      const res = await db.query(`SELECT COUNT(*) AS n FROM "${t}"`)
      counts[t] = parseInt(res.rows[0].n, 10)
    }
    const lastSync = await db.query(
      `SELECT table_name, partition_year_month, rows_synced, duration_ms, synced_at, error
       FROM loop_sync_log ORDER BY synced_at DESC LIMIT 5`
    )
    result.loop = { counts, recent_syncs: lastSync.rows, ok: true }
  } catch (err: any) {
    result.loop = { ok: false, error: String(err.message ?? err) }
  }

  // Daily sales
  try {
    await ensureSalesTables()
    const db = getSalesDb()
    const [countRes, rangeRes, lastSyncRes] = await Promise.all([
      db.query("SELECT COUNT(*) AS total FROM ss_sales_daily"),
      db.query("SELECT MIN(sale_date) AS min_date, MAX(sale_date) AS max_date FROM ss_sales_daily"),
      db.query("SELECT * FROM ss_sales_sync_log ORDER BY synced_at DESC LIMIT 5"),
    ])
    result.sales = {
      ok:           true,
      total_rows:   parseInt(countRes.rows[0].total, 10),
      min_date:     rangeRes.rows[0].min_date,
      max_date:     rangeRes.rows[0].max_date,
      recent_syncs: lastSyncRes.rows,
    }
  } catch (err: any) {
    result.sales = { ok: false, error: String(err.message ?? err) }
  }

  return NextResponse.json(result)
}
