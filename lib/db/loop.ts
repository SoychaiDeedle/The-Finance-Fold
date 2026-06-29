import { Pool } from "pg"

let pool: Pool | null = null

export function getLoopDb(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false },
      max: 5,
    })
  }
  return pool
}

export const DDL = `
CREATE TABLE IF NOT EXISTS loop_returns (
  id BIGINT NOT NULL,
  account TEXT NOT NULL,
  partition_year_month TEXT,
  state TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  edited_at TIMESTAMPTZ,
  total DOUBLE PRECISION,
  outcome TEXT,
  order_id TEXT,
  order_name TEXT,
  order_number TEXT,
  provider_order_id TEXT,
  provider_order_number TEXT,
  customer TEXT,
  origin_country TEXT,
  origin_country_code TEXT,
  currency TEXT,
  multi_currency BOOLEAN,
  return_product_total DOUBLE PRECISION,
  return_discount_total DOUBLE PRECISION,
  return_tax_total DOUBLE PRECISION,
  return_total DOUBLE PRECISION,
  return_credit_total DOUBLE PRECISION,
  exchange_product_total DOUBLE PRECISION,
  exchange_discount_total DOUBLE PRECISION,
  exchange_tax_total DOUBLE PRECISION,
  exchange_total DOUBLE PRECISION,
  exchange_credit_total DOUBLE PRECISION,
  gift_card TEXT,
  gift_card_order_name TEXT,
  gift_card_order_id TEXT,
  handling_fee DOUBLE PRECISION,
  refund DOUBLE PRECISION,
  upsell DOUBLE PRECISION,
  refund_before_inspection BOOLEAN,
  was_processed BOOLEAN,
  outcomes_return_processed TIMESTAMPTZ,
  outcomes_refund_processed TIMESTAMPTZ,
  outcomes_gift_card_processed TIMESTAMPTZ,
  outcomes_exchange_processed TIMESTAMPTZ,
  carrier TEXT,
  tracking_number TEXT,
  label_status TEXT,
  label_url TEXT,
  label_rate DOUBLE PRECISION,
  label_updated_at TIMESTAMPTZ,
  destination_id TEXT,
  package_reference TEXT,
  type TEXT,
  status_page_url TEXT,
  return_method_provider TEXT,
  return_method_method_type TEXT,
  return_method_state TEXT,
  shopify_refund_object TEXT,
  PRIMARY KEY (id, account)
);

CREATE TABLE IF NOT EXISTS loop_return_lineitems (
  return_id BIGINT NOT NULL,
  line_item_id TEXT NOT NULL,
  account TEXT NOT NULL,
  partition_year_month TEXT,
  provider_line_item_id TEXT,
  product_id TEXT,
  variant_id TEXT,
  sku TEXT,
  title TEXT,
  price DOUBLE PRECISION,
  discount DOUBLE PRECISION,
  tax DOUBLE PRECISION,
  refund DOUBLE PRECISION,
  refund_item DOUBLE PRECISION,
  refund_tax DOUBLE PRECISION,
  returned_at TIMESTAMPTZ,
  exchange_variant TEXT,
  return_reason TEXT,
  parent_return_reason TEXT,
  return_comment TEXT,
  barcode TEXT,
  outcome TEXT,
  consolidation_destination_id TEXT,
  consolidation_tracking TEXT,
  provider_restock_location_id TEXT,
  condition_description TEXT,
  condition_category TEXT,
  condition_return_processor TEXT,
  condition_note TEXT,
  condition_inspected_at TIMESTAMPTZ,
  disposition_outcome TEXT,
  disposition_return_processor TEXT,
  disposition_note TEXT,
  disposition_inspected_at TIMESTAMPTZ,
  PRIMARY KEY (return_id, line_item_id, account)
);

CREATE TABLE IF NOT EXISTS loop_return_labels (
  return_id BIGINT NOT NULL,
  account TEXT NOT NULL,
  partition_year_month TEXT,
  status TEXT,
  updated_at TIMESTAMPTZ,
  url TEXT,
  rate DOUBLE PRECISION,
  carrier TEXT,
  tracking_number TEXT,
  label_line_items TEXT,
  PRIMARY KEY (return_id, account)
);

CREATE TABLE IF NOT EXISTS loop_return_exchanges (
  return_id BIGINT NOT NULL,
  exchange_id TEXT NOT NULL,
  account TEXT NOT NULL,
  partition_year_month TEXT,
  exchange_order_id TEXT,
  exchange_order_name TEXT,
  product_id TEXT,
  variant_id TEXT,
  sku TEXT,
  type TEXT,
  title TEXT,
  price DOUBLE PRECISION,
  discount DOUBLE PRECISION,
  tax DOUBLE PRECISION,
  total DOUBLE PRECISION,
  out_of_stock BOOLEAN,
  out_of_stock_resolution TEXT,
  consolidation_tracking TEXT,
  PRIMARY KEY (return_id, exchange_id, account)
);

CREATE TABLE IF NOT EXISTS loop_sync_log (
  id SERIAL PRIMARY KEY,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  table_name TEXT,
  partition_year_month TEXT,
  rows_synced INTEGER,
  duration_ms INTEGER,
  error TEXT
);
`

export const TABLE_DEFS: Record<string, { pg: string; pk: string[]; cols: string[] }> = {
  loop_returns: {
    pg: "loop_returns",
    pk: ["id", "account"],
    cols: [
      "id","account","partition_year_month","state","created_at","updated_at","edited_at",
      "total","outcome","order_id","order_name","order_number","provider_order_id","provider_order_number",
      "customer","origin_country","origin_country_code","currency","multi_currency",
      "return_product_total","return_discount_total","return_tax_total","return_total","return_credit_total",
      "exchange_product_total","exchange_discount_total","exchange_tax_total","exchange_total","exchange_credit_total",
      "gift_card","gift_card_order_name","gift_card_order_id",
      "handling_fee","refund","upsell","refund_before_inspection","was_processed",
      "outcomes_return_processed","outcomes_refund_processed","outcomes_gift_card_processed","outcomes_exchange_processed",
      "carrier","tracking_number","label_status","label_url","label_rate","label_updated_at",
      "destination_id","package_reference","type","status_page_url",
      "return_method_provider","return_method_method_type","return_method_state","shopify_refund_object",
    ],
  },
  loop_return_lineitems: {
    pg: "loop_return_lineitems",
    pk: ["return_id", "line_item_id", "account"],
    cols: [
      "return_id","line_item_id","account","partition_year_month",
      "provider_line_item_id","product_id","variant_id","sku","title",
      "price","discount","tax","refund","refund_item","refund_tax",
      "returned_at","exchange_variant","return_reason","parent_return_reason","return_comment",
      "barcode","outcome","consolidation_destination_id","consolidation_tracking","provider_restock_location_id",
      "condition_description","condition_category","condition_return_processor","condition_note","condition_inspected_at",
      "disposition_outcome","disposition_return_processor","disposition_note","disposition_inspected_at",
    ],
  },
  loop_return_labels: {
    pg: "loop_return_labels",
    pk: ["return_id", "account"],
    cols: [
      "return_id","account","partition_year_month",
      "status","updated_at","url","rate","carrier","tracking_number","label_line_items",
    ],
  },
  loop_return_exchanges: {
    pg: "loop_return_exchanges",
    pk: ["return_id", "exchange_id", "account"],
    cols: [
      "return_id","exchange_id","account","partition_year_month",
      "exchange_order_id","exchange_order_name","product_id","variant_id","sku",
      "type","title","price","discount","tax","total",
      "out_of_stock","out_of_stock_resolution","consolidation_tracking",
    ],
  },
}

export const ATHENA_TABLE_MAP: Record<string, string> = {
  fct_returns_loop:        "loop_returns",
  fct_returnlineitems_loop:"loop_return_lineitems",
  fct_returnlabels_loop:   "loop_return_labels",
  fct_returnexchanges_loop:"loop_return_exchanges",
}

const BOOL_COLS   = new Set(["multi_currency","refund_before_inspection","was_processed","out_of_stock"])
const BIGINT_COLS = new Set(["id","return_id"])
const DOUBLE_COLS = new Set([
  "total","return_product_total","return_discount_total","return_tax_total","return_total",
  "return_credit_total","exchange_product_total","exchange_discount_total","exchange_tax_total",
  "exchange_total","exchange_credit_total","handling_fee","refund","upsell","label_rate",
  "price","discount","tax","refund_item","refund_tax","rate",
])

export function coerceRow(raw: Record<string, string>, cols: string[]): Record<string, any> {
  const out: Record<string, any> = {}
  for (const col of cols) {
    const v = raw[col]
    if (v === undefined || v === "" || v === null) {
      out[col] = null
    } else if (BOOL_COLS.has(col)) {
      out[col] = v === "true"
    } else if (BIGINT_COLS.has(col)) {
      out[col] = parseInt(v, 10) || null
    } else if (DOUBLE_COLS.has(col)) {
      out[col] = parseFloat(v) || null
    } else {
      out[col] = v
    }
  }
  return out
}

export async function upsertBatch(
  db: Pool,
  pgTable: string,
  cols: string[],
  pkCols: string[],
  rows: Record<string, any>[]
): Promise<number> {
  if (!rows.length) return 0
  const updateCols = cols.filter(c => !pkCols.includes(c))
  let inserted = 0
  for (let i = 0; i < rows.length; i += 500) {
    const batch = rows.slice(i, i + 500)
    const vals: any[] = []
    const placeholderRows = batch.map(row => {
      const placeholders = cols.map(col => { vals.push(row[col] ?? null); return `$${vals.length}` })
      return `(${placeholders.join(",")})`
    })
    const updateSet = updateCols.length
      ? updateCols.map(c => `"${c}" = EXCLUDED."${c}"`).join(", ")
      : `"${pkCols[0]}" = EXCLUDED."${pkCols[0]}"`
    const sql = `
      INSERT INTO "${pgTable}" (${cols.map(c => `"${c}"`).join(",")})
      VALUES ${placeholderRows.join(",")}
      ON CONFLICT (${pkCols.map(c => `"${c}"`).join(",")}) DO UPDATE SET ${updateSet}
    `
    await db.query(sql, vals)
    inserted += batch.length
  }
  return inserted
}

export async function ensureLoopTables(): Promise<void> {
  const db = getLoopDb()
  for (const stmt of DDL.split(";").map(s => s.trim()).filter(Boolean)) {
    await db.query(stmt)
  }
}
