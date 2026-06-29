import { NextRequest, NextResponse } from "next/server"
import { StartQueryExecutionCommand } from "@aws-sdk/client-athena"
import {
  athena, waitForQuery, getAllRows, monthRange,
} from "@/lib/athena"
import {
  getLoopDb, DDL, TABLE_DEFS, ATHENA_TABLE_MAP,
  coerceRow, upsertBatch, ensureLoopTables,
} from "@/lib/db/loop"

export const runtime = "nodejs"
export const maxDuration = 300

async function queryAthena(sql: string): Promise<Record<string, string>[]> {
  const start = await athena.send(new StartQueryExecutionCommand({
    QueryString: sql,
    WorkGroup: "primary",
    QueryExecutionContext: { Database: "ss-dl", Catalog: "AwsDataCatalog" },
  }))
  await waitForQuery(start.QueryExecutionId!, 120)
  return getAllRows(start.QueryExecutionId!)
}

async function syncTableMonth(
  athenaTable: string,
  pgTable: string,
  yearMonth: string
): Promise<{ rows: number; ms: number; error?: string }> {
  const t0  = Date.now()
  const db  = getLoopDb()
  const def = TABLE_DEFS[pgTable]

  try {
    const raw     = await queryAthena(`SELECT * FROM "ss-dl"."${athenaTable}" WHERE partition_year_month = '${yearMonth}'`)
    const coerced = raw.map(r => coerceRow(r, def.cols))
    const count   = await upsertBatch(db, pgTable, def.cols, def.pk, coerced)
    const ms      = Date.now() - t0

    await db.query(
      `INSERT INTO loop_sync_log (table_name, partition_year_month, rows_synced, duration_ms)
       VALUES ($1, $2, $3, $4)`,
      [pgTable, yearMonth, count, ms]
    )
    return { rows: count, ms }
  } catch (err: any) {
    const ms    = Date.now() - t0
    const error = String(err.message ?? err)
    await db.query(
      `INSERT INTO loop_sync_log (table_name, partition_year_month, rows_synced, duration_ms, error)
       VALUES ($1, $2, 0, $3, $4)`,
      [pgTable, yearMonth, ms, error]
    ).catch(() => {})
    return { rows: 0, ms, error }
  }
}

// GET — row counts + recent sync log
export async function GET() {
  try {
    const db = getLoopDb()
    await ensureLoopTables()

    const tables  = Object.values(TABLE_DEFS).map(d => d.pg)
    const counts: Record<string, number> = {}
    for (const t of tables) {
      const res = await db.query(`SELECT COUNT(*) AS n FROM "${t}"`)
      counts[t] = parseInt(res.rows[0].n, 10)
    }

    const lastSync = await db.query(
      `SELECT table_name, partition_year_month, rows_synced, duration_ms, synced_at, error
       FROM loop_sync_log ORDER BY synced_at DESC LIMIT 20`
    )

    return NextResponse.json({ counts, recent_syncs: lastSync.rows })
  } catch (err: any) {
    return NextResponse.json({ error: String(err.message ?? err) }, { status: 500 })
  }
}

// POST — trigger sync
export async function POST(req: NextRequest) {
  const body: any = await req.json().catch(() => ({}))
  const from: string = body.from || "2024-01"
  const to:   string = body.to   || new Date().toISOString().slice(0, 7)
  const requestedTables: string[] = body.tables || Object.keys(ATHENA_TABLE_MAP)

  if (!/^\d{4}-\d{2}$/.test(from) || !/^\d{4}-\d{2}$/.test(to)) {
    return NextResponse.json({ error: "Invalid date format, expected YYYY-MM" }, { status: 400 })
  }

  const validTables = requestedTables.filter(t => ATHENA_TABLE_MAP[t])
  if (!validTables.length) {
    return NextResponse.json({ error: "No valid tables. Use: " + Object.keys(ATHENA_TABLE_MAP).join(", ") }, { status: 400 })
  }

  try { await ensureLoopTables() } catch (err: any) {
    return NextResponse.json({ error: "Failed to create tables: " + String(err.message ?? err) }, { status: 500 })
  }

  const months  = monthRange(from, to)
  const results: Record<string, { total_rows: number; months: Record<string, any> }> = {}

  for (const athenaTable of validTables) {
    const pgTable = ATHENA_TABLE_MAP[athenaTable]
    results[athenaTable] = { total_rows: 0, months: {} }
    for (const month of months) {
      const result = await syncTableMonth(athenaTable, pgTable, month)
      results[athenaTable].months[month] = result
      results[athenaTable].total_rows   += result.rows
    }
  }

  const totalRows = Object.values(results).reduce((s, t) => s + t.total_rows, 0)
  return NextResponse.json({ ok: true, from, to, months: months.length, tables_synced: validTables.length, total_rows_upserted: totalRows, results })
}
