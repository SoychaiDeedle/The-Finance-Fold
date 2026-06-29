import { NextRequest, NextResponse } from "next/server"
import { StartQueryExecutionCommand } from "@aws-sdk/client-athena"
import { athena, waitForQuery, getAllRows, earliestPartition } from "@/lib/athena"

export const runtime = "nodejs"

function normaliseStatus(raw: string): string {
  const s = (raw ?? "").toLowerCase().trim()
  if (!s || s === "null")      return "Unfulfilled"
  if (s === "fulfilled")       return "Fulfilled"
  if (s === "partial")         return "Partial"
  if (s.includes("restocked")) return "Restocked"
  return raw
}

function mapRow(r: Record<string, string>) {
  return {
    lineId:         r.id              ?? "—",
    orderId:        r.order_id        ?? "—",
    product:        r.title           ?? "—",
    variant:        r.variant_title   ?? "",
    sku:            r.sku             ?? "—",
    store:          r.shopify_account ?? "—",
    qty:            parseInt(r.quantity  ?? "0", 10) || 0,
    unitPrice:      parseFloat(r.unit_price ?? "0") || 0,
    lineValue:      parseFloat(r.extended_price ?? "0") || 0,
    lineValueExTax: parseFloat(r.extended_price_ex_tax ?? "0") || 0,
    currency:       r.currency        ?? "AUD",
    status:         normaliseStatus(r.fulfillment_status),
    period:         r.partition_year_month ?? "—",
  }
}

// GET /api/orders?days=90&limit=2000
export async function GET(req: NextRequest) {
  const url   = new URL(req.url)
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "2000", 10), 5000)
  const days  = parseInt(url.searchParams.get("days") ?? "90", 10)
  const from  = earliestPartition(days)

  const sql = `
    SELECT
      CAST(id AS VARCHAR)                    AS id,
      CAST(order_id AS VARCHAR)              AS order_id,
      title,
      variant_title,
      sku,
      CAST(quantity AS VARCHAR)              AS quantity,
      CAST(unit_price AS VARCHAR)            AS unit_price,
      CAST(extended_price AS VARCHAR)        AS extended_price,
      CAST(extended_price_ex_tax AS VARCHAR) AS extended_price_ex_tax,
      fulfillment_status,
      currency,
      shopify_account,
      partition_year_month
    FROM "ss-dl".fct_saleorderlines
    WHERE partition_year_month >= '${from}'
    ORDER BY partition_year_month DESC, order_id DESC
    LIMIT ${limit}
  `

  try {
    const start = await athena.send(new StartQueryExecutionCommand({
      QueryString: sql,
      WorkGroup: "primary",
      QueryExecutionContext: { Database: "ss-dl", Catalog: "AwsDataCatalog" },
    }))
    const qid = start.QueryExecutionId!
    await waitForQuery(qid)
    const raw    = await getAllRows(qid)
    const orders = raw.map(mapRow)

    const totalRevenue = orders.reduce((s, o) => s + o.lineValue, 0)
    const fulfilled    = orders.filter(o => o.status === "Fulfilled").length
    const unfulfilled  = orders.filter(o => o.status === "Unfulfilled").length
    const uniqueOrders = new Set(orders.map(o => o.orderId)).size

    return NextResponse.json({
      orders,
      meta: { count: orders.length, uniqueOrders, totalRevenue, fulfilled, unfulfilled, from, queryId: qid },
    })
  } catch (err: any) {
    console.error("[finance-fold/api/orders]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
