"use client"

import { useCallback, useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search, Download, SlidersHorizontal, ShoppingBag, CheckCircle,
  Truck, RefreshCcw, AlertTriangle, Loader2, PackageOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface OrderLine {
  lineId:         string
  orderId:        string
  product:        string
  variant:        string
  sku:            string
  store:          string
  qty:            number
  unitPrice:      number
  lineValue:      number
  lineValueExTax: number
  currency:       string
  status:         string
  period:         string
}

interface Meta {
  count:        number
  uniqueOrders: number
  totalRevenue: number
  fulfilled:    number
  unfulfilled:  number
  from:         string
  queryId:      string
}

const STATUS_STYLES: Record<string, string> = {
  Fulfilled:   "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Unfulfilled: "bg-amber-500/10  text-amber-600  dark:text-amber-400  border-amber-500/20",
  Partial:     "bg-blue-500/10   text-blue-600   dark:text-blue-400   border-blue-500/20",
  Restocked:   "bg-destructive/10 text-destructive border-destructive/20",
}

const STORE_LABELS: Record<string, string> = {
  AU: "Australia", US: "United States", UK: "United Kingdom", NZ: "New Zealand", EU: "Europe",
}

const DAY_OPTIONS = [
  { label: "Last 30 days",  value: "30" },
  { label: "Last 60 days",  value: "60" },
  { label: "Last 90 days",  value: "90" },
  { label: "Last 180 days", value: "180" },
]

function fmtCurrency(val: number, currency = "AUD") {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency, maximumFractionDigits: 2 }).format(val)
}

function downloadCsv(rows: OrderLine[]) {
  const header = "Line ID,Order ID,Product,Variant,SKU,Store,Qty,Unit Price,Line Value,Currency,Status,Period"
  const body = rows.map(r =>
    [r.lineId, r.orderId, r.product, r.variant, r.sku, r.store, r.qty, r.unitPrice, r.lineValue, r.currency, r.status, r.period]
      .map(v => `"${String(v ?? "").replace(/"/g, '""')}"`)
      .join(",")
  )
  const blob = new Blob([[header, ...body].join("\n")], { type: "text/csv" })
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(blob),
    download: `orders-${new Date().toISOString().slice(0, 10)}.csv`,
  })
  a.click()
}

export default function OrdersPage() {
  const [lines, setLines]               = useState<OrderLine[]>([])
  const [meta, setMeta]                 = useState<Meta | null>(null)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)
  const [search, setSearch]             = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [storeFilter, setStoreFilter]   = useState("all")
  const [days, setDays]                 = useState("90")

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/orders?days=${days}&limit=2000`)
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? `HTTP ${res.status}`)
      }
      const j = await res.json()
      setLines(j.orders ?? [])
      setMeta(j.meta ?? null)
    } catch (e: any) {
      setError(e.message ?? "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const stores = [...new Set(lines.map(l => l.store))].sort()

  const filtered = lines.filter(l => {
    const q = search.toLowerCase()
    const matchSearch = !q || l.orderId.toLowerCase().includes(q) || l.product.toLowerCase().includes(q) || l.sku.toLowerCase().includes(q)
    const matchStatus = statusFilter === "all" || l.status === statusFilter
    const matchStore  = storeFilter  === "all" || l.store  === storeFilter
    return matchSearch && matchStatus && matchStore
  })

  const filteredRevenue = filtered.reduce((s, l) => s + l.lineValue, 0)
  const filteredQty     = filtered.reduce((s, l) => s + l.qty, 0)

  const dominantCurrency = lines.length
    ? Object.entries(lines.reduce((acc, l) => { acc[l.currency] = (acc[l.currency] ?? 0) + 1; return acc }, {} as Record<string, number>))
        .sort((a, b) => b[1] - a[1])[0][0]
    : "AUD"

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Orders"
        description={meta ? `${meta.uniqueOrders.toLocaleString()} orders · ${meta.count.toLocaleString()} lines · Athena live` : "Querying Athena…"}
      >
        <Button variant="outline" size="sm" className="h-8 rounded-2xl text-[12px] gap-1.5" onClick={fetchOrders} disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
          Refresh
        </Button>
        <Button variant="outline" size="sm" className="h-8 rounded-2xl text-[12px] gap-1.5"
          onClick={() => downloadCsv(filtered)} disabled={loading || !filtered.length}>
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </DashboardHeader>

      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Unique Orders"
            value={loading ? "…" : (meta?.uniqueOrders ?? 0).toLocaleString()}
            icon={<ShoppingBag className="h-4 w-4" />} accent />
          <KpiCard title="Line Items"
            value={loading ? "…" : (meta?.count ?? 0).toLocaleString()}
            icon={<PackageOpen className="h-4 w-4" />} />
          <KpiCard title="Fulfilled"
            value={loading ? "…" : (meta?.fulfilled ?? 0).toLocaleString()}
            icon={<CheckCircle className="h-4 w-4" />} />
          <KpiCard title="Unfulfilled"
            value={loading ? "…" : (meta?.unfulfilled ?? 0).toLocaleString()}
            icon={<Truck className="h-4 w-4" />} />
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">Athena query failed</p>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono break-all">{error}</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs h-7 shrink-0" onClick={fetchOrders}>Retry</Button>
          </div>
        )}

        <Card className="rounded-2xl">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap">
              <CardTitle className="text-sm font-semibold tracking-wide flex items-center gap-2">
                Order Lines
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
              </CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={days} onValueChange={setDays}>
                  <SelectTrigger className="h-8 w-36 rounded-2xl text-[12px]"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {DAY_OPTIONS.map(d => <SelectItem key={d.value} value={d.value} className="text-[12px]">{d.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={storeFilter} onValueChange={setStoreFilter}>
                  <SelectTrigger className="h-8 w-32 rounded-2xl text-[12px]"><SelectValue placeholder="Store" /></SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="all" className="text-[12px]">All Stores</SelectItem>
                    {stores.map(s => <SelectItem key={s} value={s} className="text-[12px]">{STORE_LABELS[s] ?? s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 w-36 rounded-2xl text-[12px]">
                    <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="all"         className="text-[12px]">All Statuses</SelectItem>
                    <SelectItem value="Fulfilled"   className="text-[12px]">Fulfilled</SelectItem>
                    <SelectItem value="Unfulfilled" className="text-[12px]">Unfulfilled</SelectItem>
                    <SelectItem value="Partial"     className="text-[12px]">Partial</SelectItem>
                    <SelectItem value="Restocked"   className="text-[12px]">Restocked</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Order, product, SKU…"
                    className="pl-8 h-8 rounded-2xl text-[12px] w-48"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {["Order", "Product", "SKU", "Store", "Qty", "Value", "Status"].map((h, i) => (
                      <th key={h} className={cn(
                        "text-[10px] text-muted-foreground tracking-[0.15em] uppercase font-normal pb-3",
                        i === 0 ? "text-left px-5" : i >= 5 ? "text-right" : "text-left",
                        i === 2 && "hidden md:table-cell",
                        i === 3 && "hidden lg:table-cell",
                        i === 6 && "pr-5"
                      )}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading && (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-sm text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                        Querying Athena — this takes ~5–15 seconds…
                      </td>
                    </tr>
                  )}
                  {!loading && !error && filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-sm text-muted-foreground">No order lines found</td>
                    </tr>
                  )}
                  {!loading && filtered.map(line => (
                    <tr key={line.lineId} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3">
                        <span className="font-mono text-[11px] text-muted-foreground">{line.orderId}</span>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{line.period}</p>
                      </td>
                      <td className="py-3 max-w-[220px]">
                        <p className="text-[13px] font-medium text-foreground truncate">{line.product}</p>
                        {line.variant && <p className="text-[11px] text-muted-foreground">{line.variant}</p>}
                      </td>
                      <td className="py-3 hidden md:table-cell">
                        <span className="font-mono text-[11px] text-muted-foreground">{line.sku}</span>
                      </td>
                      <td className="py-3 hidden lg:table-cell">
                        <span className="text-[12px] text-muted-foreground">{STORE_LABELS[line.store] ?? line.store}</span>
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-[13px] text-foreground">{line.qty}</span>
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-[13px] font-medium text-foreground">
                          {fmtCurrency(line.lineValue, line.currency)}
                        </span>
                      </td>
                      <td className="py-3 pr-5 text-right">
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-2xl text-[10px] tracking-wide border",
                          STATUS_STYLES[line.status] ?? "bg-muted text-muted-foreground border-border"
                        )}>
                          {line.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {!loading && filtered.length > 0 && (
                  <tfoot>
                    <tr className="border-t border-border bg-muted/30">
                      <td className="px-5 py-3 text-[11px] text-muted-foreground" colSpan={4}>
                        {filtered.length.toLocaleString()} lines
                        {filtered.length !== lines.length ? ` (of ${lines.length.toLocaleString()})` : ""}
                      </td>
                      <td className="py-3 text-right text-[12px] font-medium text-foreground">{filteredQty.toLocaleString()}</td>
                      <td className="py-3 text-right text-[13px] font-semibold text-foreground">{fmtCurrency(filteredRevenue, dominantCurrency)}</td>
                      <td className="py-3 pr-5" />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
