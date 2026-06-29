import { NextRequest, NextResponse } from "next/server"
import { StartQueryExecutionCommand } from "@aws-sdk/client-athena"
import { athena, waitForQuery, getAllRows } from "@/lib/athena"

export const runtime = "nodejs"

// GET /api/sales-summary?groupBy=month|day|sku|sku_detailed|store_month&from=YYYY-MM&to=YYYY-MM&store=
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const from    = searchParams.get("from")    || "2024-01"
  const to      = searchParams.get("to")      || new Date().toISOString().slice(0, 7)
  const groupBy = searchParams.get("groupBy") || "month"
  const store   = searchParams.get("store")   || ""

  if (!/^\d{4}-\d{2}$/.test(from) || !/^\d{4}-\d{2}$/.test(to)) {
    return NextResponse.json({ error: "Invalid date format, expected YYYY-MM" }, { status: 400 })
  }

  const dateFilter = `
    DATE_FORMAT(DATE(date), '%Y-%m') >= '${from}'
    AND DATE_FORMAT(DATE(date), '%Y-%m') <= '${to}'
  `
  const storeFilter = store ? `AND store_name = '${store.replace(/'/g, "''")}'` : ""

  let sql: string

  if (groupBy === "month") {
    sql = `
      SELECT
        DATE_FORMAT(DATE(date), '%Y-%m') AS month,
        CAST(SUM(sale_units)   AS BIGINT) AS qty_sold,
        ROUND(SUM(sales_aud),  2)         AS revenue,
        ROUND(SUM(sales_ex_tax_aud), 2)   AS revenue_ex_tax,
        CAST(SUM(refund_units) AS BIGINT) AS refund_units,
        ROUND(SUM(refunds_aud), 2)        AS refunds_aud,
        ROUND(SUM(sale_cogs_est), 2)      AS cogs_est
      FROM "ss-dl".agg_salesbystoreskuday
      WHERE ${dateFilter} ${storeFilter}
      GROUP BY DATE_FORMAT(DATE(date), '%Y-%m')
      ORDER BY month
    `
  } else if (groupBy === "day") {
    sql = `
      SELECT
        CAST(DATE(date) AS VARCHAR)       AS day,
        CAST(SUM(sale_units)   AS BIGINT) AS qty_sold,
        ROUND(SUM(sales_aud),  2)         AS revenue,
        ROUND(SUM(sales_ex_tax_aud), 2)   AS revenue_ex_tax,
        CAST(SUM(refund_units) AS BIGINT) AS refund_units,
        ROUND(SUM(refunds_aud), 2)        AS refunds_aud
      FROM "ss-dl".agg_salesbystoreskuday
      WHERE ${dateFilter} ${storeFilter}
      GROUP BY CAST(DATE(date) AS VARCHAR)
      ORDER BY day
    `
  } else if (groupBy === "sku") {
    sql = `
      SELECT
        sku,
        CAST(SUM(sale_units)   AS BIGINT) AS qty_sold,
        ROUND(SUM(sales_aud),  2)         AS revenue,
        CAST(SUM(refund_units) AS BIGINT) AS refund_units,
        ROUND(SUM(refunds_aud), 2)        AS refunds_aud
      FROM "ss-dl".agg_salesbystoreskuday
      WHERE ${dateFilter} AND sku IS NOT NULL AND sku <> '' ${storeFilter}
      GROUP BY sku
      ORDER BY qty_sold DESC
      LIMIT 10000
    `
  } else if (groupBy === "store_month") {
    sql = `
      SELECT
        store_name,
        DATE_FORMAT(DATE(date), '%Y-%m')  AS month,
        CAST(SUM(sale_units)   AS BIGINT) AS qty_sold,
        ROUND(SUM(sales_aud),  2)         AS revenue,
        CAST(SUM(refund_units) AS BIGINT) AS refund_units,
        ROUND(SUM(refunds_aud), 2)        AS refunds_aud
      FROM "ss-dl".agg_salesbystoreskuday
      WHERE ${dateFilter}
      GROUP BY store_name, DATE_FORMAT(DATE(date), '%Y-%m')
      ORDER BY store_name, month
    `
  } else {
    return NextResponse.json({ error: "Invalid groupBy. Use: month | day | sku | store_month" }, { status: 400 })
  }

  try {
    const start = await athena.send(new StartQueryExecutionCommand({
      QueryString: sql,
      WorkGroup: "primary",
      QueryExecutionContext: { Database: "ss-dl", Catalog: "AwsDataCatalog" },
    }))
    const qid = start.QueryExecutionId!
    await waitForQuery(qid)
    const raw = await getAllRows(qid)

    let data: any[]
    if (groupBy === "month") {
      data = raw.map(r => ({
        month:           r.month,
        qty_sold:        parseInt(r.qty_sold, 10)    || 0,
        revenue:         parseFloat(r.revenue)        || 0,
        revenue_ex_tax:  parseFloat(r.revenue_ex_tax) || 0,
        refund_units:    parseInt(r.refund_units, 10) || 0,
        refunds_aud:     parseFloat(r.refunds_aud)    || 0,
        cogs_est:        parseFloat(r.cogs_est)       || 0,
      }))
    } else if (groupBy === "day") {
      data = raw.map(r => ({
        day:            r.day,
        qty_sold:       parseInt(r.qty_sold, 10)    || 0,
        revenue:        parseFloat(r.revenue)        || 0,
        revenue_ex_tax: parseFloat(r.revenue_ex_tax) || 0,
        refund_units:   parseInt(r.refund_units, 10) || 0,
        refunds_aud:    parseFloat(r.refunds_aud)    || 0,
      }))
    } else if (groupBy === "sku") {
      data = raw.map(r => ({
        sku:          r.sku,
        qty_sold:     parseInt(r.qty_sold, 10)    || 0,
        revenue:      parseFloat(r.revenue)        || 0,
        refund_units: parseInt(r.refund_units, 10) || 0,
        refunds_aud:  parseFloat(r.refunds_aud)    || 0,
      }))
    } else {
      data = raw.map(r => ({
        store_name:   r.store_name,
        month:        r.month,
        qty_sold:     parseInt(r.qty_sold, 10)    || 0,
        revenue:      parseFloat(r.revenue)        || 0,
        refund_units: parseInt(r.refund_units, 10) || 0,
        refunds_aud:  parseFloat(r.refunds_aud)    || 0,
      }))
    }

    return NextResponse.json({ data, groupBy, from, to, queryId: qid })
  } catch (err: any) {
    console.error("[finance-fold/api/sales-summary]", err)
    return NextResponse.json({ error: String(err.message ?? err) }, { status: 500 })
  }
}
