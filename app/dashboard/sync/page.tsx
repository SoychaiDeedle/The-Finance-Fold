"use client"

import { useCallback, useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCcw, Loader2, Database, CheckCircle, AlertTriangle, Clock, Play } from "lucide-react"

interface SyncStatus {
  loop?: {
    ok:           boolean
    counts?:      Record<string, number>
    recent_syncs?: any[]
    error?:       string
  }
  sales?: {
    ok:           boolean
    total_rows?:  number
    min_date?:    string
    max_date?:    string
    recent_syncs?: any[]
    error?:       string
  }
}

function fmtTs(ts: string) {
  if (!ts) return "—"
  const d = new Date(ts)
  return d.toLocaleString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
}

function fmtMs(ms: number) {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export default function SyncPage() {
  const [status, setStatus]     = useState<SyncStatus>({})
  const [loading, setLoading]   = useState(true)
  const [syncing, setSyncing]   = useState<string | null>(null)

  const [loopFrom, setLoopFrom] = useState("2024-01")
  const [loopTo,   setLoopTo]   = useState(() => new Date().toISOString().slice(0, 7))
  const [salesFrom, setSalesFrom] = useState("2025-07-01")
  const [salesTo,   setSalesTo]   = useState(() => new Date().toISOString().slice(0, 10))

  const fetchStatus = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/sync/status")
      const j   = await res.json()
      setStatus(j)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchStatus() }, [fetchStatus])

  async function triggerLoopSync() {
    setSyncing("loop")
    try {
      const res = await fetch("/api/sync/loop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: loopFrom, to: loopTo }),
      })
      const j = await res.json()
      console.log("Loop sync result:", j)
    } catch (err) {
      console.error(err)
    }
    await fetchStatus()
    setSyncing(null)
  }

  async function triggerSalesSync() {
    setSyncing("sales")
    try {
      const res = await fetch("/api/sync/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: salesFrom, to: salesTo, triggered_by: "finance-fold-ui" }),
      })
      const j = await res.json()
      console.log("Sales sync result:", j)
    } catch (err) {
      console.error(err)
    }
    await fetchStatus()
    setSyncing(null)
  }

  const loopCounts = status.loop?.counts ?? {}
  const totalLoopRows = Object.values(loopCounts).reduce((s, n) => s + n, 0)

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Data Sync" description="Athena → Postgres sync management for returns and sales data">
        <Button variant="outline" size="sm" className="h-8 rounded-2xl text-[12px] gap-1.5" onClick={fetchStatus} disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
          Refresh Status
        </Button>
      </DashboardHeader>

      <main className="flex-1 p-6 space-y-6">

        {/* Architecture note */}
        <div className="rounded-2xl border border-border bg-muted/40 px-5 py-4">
          <p className="text-[12px] text-muted-foreground">
            <span className="font-medium text-foreground">Data architecture: </span>
            Orders and sales summaries are queried live from AWS Athena (5–15 s). Returns detail and daily sales are synced from Athena → Postgres for fast repeated queries. Sync is idempotent — safe to re-run.
          </p>
        </div>

        {/* Status cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
                  <Database className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground tracking-[0.15em] uppercase">Loop Returns</p>
                  <p className="text-lg font-semibold text-foreground">{loading ? "…" : totalLoopRows.toLocaleString()} rows</p>
                </div>
              </div>
              {status.loop?.ok === false && (
                <Badge variant="destructive" className="text-[9px] tracking-wide rounded-2xl">Error</Badge>
              )}
              {status.loop?.ok && (
                <div className="space-y-1">
                  {Object.entries(loopCounts).map(([t, n]) => (
                    <div key={t} className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground font-mono">{t}</span>
                      <span className="text-[11px] font-medium text-foreground">{n.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
                  <Database className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground tracking-[0.15em] uppercase">Daily Sales</p>
                  <p className="text-lg font-semibold text-foreground">{loading ? "…" : (status.sales?.total_rows ?? 0).toLocaleString()} rows</p>
                </div>
              </div>
              {status.sales?.ok && (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[11px] text-muted-foreground">From</span>
                    <span className="text-[11px] font-medium text-foreground">{status.sales.min_date ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px] text-muted-foreground">To</span>
                    <span className="text-[11px] font-medium text-foreground">{status.sales.max_date ?? "—"}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground tracking-[0.15em] uppercase">Live Queries</p>
                  <p className="text-lg font-semibold text-foreground">Athena</p>
                </div>
              </div>
              <div className="space-y-1">
                {[
                  { feed: "Orders",         path: "/api/orders",        latency: "5–15s" },
                  { feed: "Sales Summary",  path: "/api/sales-summary", latency: "5–15s" },
                ].map(f => (
                  <div key={f.feed} className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">{f.feed}</span>
                    <Badge variant="outline" className="text-[9px] rounded-2xl tracking-wide">{f.latency}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sync controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Loop sync */}
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold tracking-wide flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Sync Loop Returns (Athena → Postgres)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[12px] text-muted-foreground">
                Syncs <code className="text-[11px] bg-muted px-1 py-0.5 rounded">loop_returns</code>,{" "}
                <code className="text-[11px] bg-muted px-1 py-0.5 rounded">loop_return_lineitems</code>,{" "}
                <code className="text-[11px] bg-muted px-1 py-0.5 rounded">loop_return_labels</code>,{" "}
                <code className="text-[11px] bg-muted px-1 py-0.5 rounded">loop_return_exchanges</code> from Athena.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] text-muted-foreground tracking-[0.1em] uppercase">From (YYYY-MM)</label>
                  <Input value={loopFrom} onChange={e => setLoopFrom(e.target.value)} className="h-8 rounded-xl text-[12px]" />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] text-muted-foreground tracking-[0.1em] uppercase">To (YYYY-MM)</label>
                  <Input value={loopTo} onChange={e => setLoopTo(e.target.value)} className="h-8 rounded-xl text-[12px]" />
                </div>
              </div>
              <Button onClick={triggerLoopSync} disabled={syncing === "loop"} className="w-full rounded-xl gap-2">
                {syncing === "loop" ? <><Loader2 className="h-4 w-4 animate-spin" /> Syncing — may take several minutes…</> : <><Play className="h-4 w-4" /> Run Loop Sync</>}
              </Button>

              {status.loop?.recent_syncs && status.loop.recent_syncs.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <p className="text-[10px] text-muted-foreground tracking-[0.15em] uppercase">Recent runs</p>
                  <div className="space-y-1.5">
                    {status.loop.recent_syncs.slice(0, 5).map((s, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {s.error
                            ? <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
                            : <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" />
                          }
                          <span className="text-[11px] font-mono text-muted-foreground">{s.table_name}</span>
                          <span className="text-[11px] text-muted-foreground">{s.partition_year_month}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-muted-foreground">{(s.rows_synced ?? 0).toLocaleString()} rows</span>
                          <span className="text-[10px] text-muted-foreground/60">{fmtMs(s.duration_ms)}</span>
                          <span className="text-[10px] text-muted-foreground/60">{fmtTs(s.synced_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sales sync */}
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold tracking-wide flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Sync Daily Sales (Athena → Postgres)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[12px] text-muted-foreground">
                Syncs <code className="text-[11px] bg-muted px-1 py-0.5 rounded">agg_salesbystoreskuday</code> into{" "}
                <code className="text-[11px] bg-muted px-1 py-0.5 rounded">ss_sales_daily</code>. One row per (date, store, SKU). Safe to re-run — upserts on conflict.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] text-muted-foreground tracking-[0.1em] uppercase">From (YYYY-MM-DD)</label>
                  <Input value={salesFrom} onChange={e => setSalesFrom(e.target.value)} className="h-8 rounded-xl text-[12px]" />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] text-muted-foreground tracking-[0.1em] uppercase">To (YYYY-MM-DD)</label>
                  <Input value={salesTo} onChange={e => setSalesTo(e.target.value)} className="h-8 rounded-xl text-[12px]" />
                </div>
              </div>
              <Button onClick={triggerSalesSync} disabled={syncing === "sales"} className="w-full rounded-xl gap-2">
                {syncing === "sales" ? <><Loader2 className="h-4 w-4 animate-spin" /> Syncing — may take several minutes…</> : <><Play className="h-4 w-4" /> Run Sales Sync</>}
              </Button>

              {status.sales?.recent_syncs && status.sales.recent_syncs.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <p className="text-[10px] text-muted-foreground tracking-[0.15em] uppercase">Recent runs</p>
                  <div className="space-y-1.5">
                    {status.sales.recent_syncs.slice(0, 5).map((s, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {s.error
                            ? <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
                            : <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" />
                          }
                          <span className="text-[11px] text-muted-foreground">{s.from_date} → {s.to_date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-muted-foreground">{(s.rows_synced ?? 0).toLocaleString()} rows</span>
                          <span className="text-[10px] text-muted-foreground/60">{fmtMs(s.duration_ms)}</span>
                          <span className="text-[10px] text-muted-foreground/60">{fmtTs(s.synced_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function RotateCcw({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
    </svg>
  )
}

function TrendingUp({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
      <polyline points="16 7 22 7 22 13"/>
    </svg>
  )
}
