import { Pool } from "pg"

let pool: Pool | null = null

export function getSalesDb(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false },
      max: 5,
    })
  }
  return pool
}

export const SALES_DDL = `
CREATE TABLE IF NOT EXISTS ss_sales_daily (
  sale_date           DATE    NOT NULL,
  store_name          TEXT    NOT NULL,
  sku                 TEXT    NOT NULL,
  category            TEXT,
  range_category      TEXT,
  range               TEXT,
  subrange            TEXT,
  colourway           TEXT,
  size                TEXT,
  colour_family       TEXT,
  department          TEXT,
  sale_units          INTEGER,
  sales_aud           DOUBLE PRECISION,
  sales_ex_tax_aud    DOUBLE PRECISION,
  sales_tax_aud       DOUBLE PRECISION,
  sale_cogs_est       DOUBLE PRECISION,
  refund_units        INTEGER,
  refunds_aud         DOUBLE PRECISION,
  refunds_ex_tax_aud  DOUBLE PRECISION,
  refunds_tax_aud     DOUBLE PRECISION,
  refund_cogs_est     DOUBLE PRECISION,
  synced_at           TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (sale_date, store_name, sku)
);

CREATE INDEX IF NOT EXISTS ss_sales_daily_date_idx  ON ss_sales_daily (sale_date);
CREATE INDEX IF NOT EXISTS ss_sales_daily_sku_idx   ON ss_sales_daily (sku);
CREATE INDEX IF NOT EXISTS ss_sales_daily_store_idx ON ss_sales_daily (store_name);

CREATE TABLE IF NOT EXISTS ss_sales_sync_log (
  id          SERIAL PRIMARY KEY,
  synced_at   TIMESTAMPTZ DEFAULT NOW(),
  from_date   DATE,
  to_date     DATE,
  rows_synced INTEGER,
  duration_ms INTEGER,
  triggered_by TEXT,
  error       TEXT
);
`

export const SALES_COLS = [
  "sale_date","store_name","sku",
  "category","range_category","range","subrange","colourway",
  "size","colour_family","department",
  "sale_units","sales_aud","sales_ex_tax_aud","sales_tax_aud","sale_cogs_est",
  "refund_units","refunds_aud","refunds_ex_tax_aud","refunds_tax_aud","refund_cogs_est",
]

export const SALES_PK = ["sale_date","store_name","sku"]

export function coerceSalesRow(raw: Record<string, string>): Record<string, any> {
  return {
    sale_date:          raw.sale_date || null,
    store_name:         raw.store_name || null,
    sku:                raw.sku || null,
    category:           raw.category || null,
    range_category:     raw.range_category || null,
    range:              raw.range || null,
    subrange:           raw.subrange || null,
    colourway:          raw.colourway || null,
    size:               raw.size || null,
    colour_family:      raw.colour_family || null,
    department:         raw.department || null,
    sale_units:         parseInt(raw.sale_units, 10) || 0,
    sales_aud:          parseFloat(raw.sales_aud) || 0,
    sales_ex_tax_aud:   parseFloat(raw.sales_ex_tax_aud) || 0,
    sales_tax_aud:      parseFloat(raw.sales_tax_aud) || 0,
    sale_cogs_est:      parseFloat(raw.sale_cogs_est) || 0,
    refund_units:       parseInt(raw.refund_units, 10) || 0,
    refunds_aud:        parseFloat(raw.refunds_aud) || 0,
    refunds_ex_tax_aud: parseFloat(raw.refunds_ex_tax_aud) || 0,
    refunds_tax_aud:    parseFloat(raw.refunds_tax_aud) || 0,
    refund_cogs_est:    parseFloat(raw.refund_cogs_est) || 0,
  }
}

export async function upsertSalesBatch(db: Pool, rows: Record<string, any>[]): Promise<number> {
  if (!rows.length) return 0
  const updateCols = SALES_COLS.filter(c => !SALES_PK.includes(c))
  const updateSet = updateCols.map(c => `"${c}" = EXCLUDED."${c}"`).join(", ") + `, "synced_at" = NOW()`
  let inserted = 0
  for (let i = 0; i < rows.length; i += 500) {
    const batch = rows.slice(i, i + 500)
    const vals: any[] = []
    const placeholderRows = batch.map(row => {
      const placeholders = SALES_COLS.map(col => { vals.push(row[col] ?? null); return `$${vals.length}` })
      return `(${placeholders.join(",")})`
    })
    const sql = `
      INSERT INTO ss_sales_daily (${SALES_COLS.map(c => `"${c}"`).join(",")})
      VALUES ${placeholderRows.join(",")}
      ON CONFLICT (sale_date, store_name, sku) DO UPDATE SET ${updateSet}
    `
    await db.query(sql, vals)
    inserted += batch.length
  }
  return inserted
}

export async function ensureSalesTables(): Promise<void> {
  const db = getSalesDb()
  await db.query(SALES_DDL)
}
