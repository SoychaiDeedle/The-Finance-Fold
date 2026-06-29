"use client"

import { useCallback, useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area,
} from "recharts"
import { RotateCcw, Percent, DollarSign, AlertTriangle, RefreshCcw, Loader2 } from "lucide-react"

interface MonthRow {
  month:          string
  qty_sold:       number
  revenue:        number
  revenue_ex_tax: number
  refund_units:   number
  refunds_aud:    number
  cogs_est:       number
}

const RANGE_OPTIONS = [
  { label: "Last 3 months",  from: -3 },
  { label: "Last 6 months",  from: -6 },
  { label: "Last 12 months", from: -12 },
  { label: "Last 24 months", from: -24 },
]

function monthsAgo(n: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function toYM(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function fmtAUD(v: number) {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(v)
}

export default function ReturnsPage() {
  const [data, setData]       = useState<MonthRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [range, setRange]     = useState("-12")

  const fetch_ = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const from = monthsAgo(parseInt(range))
      const to   = toYM()
      const res  = await fetch(`/api/sales-summary?groupBy=month&from=${from}&to=${to}`)
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error ?? `HTTP ${res.status}`) }
      const j = await res.json()
      setData(j.data ?? [])
    } catch (e: any) {
      setError(e.message ?? "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [range])

  useEffect(() => { fetch_() }, [fetch_])

  const totalRefundUnits = data.reduce((s, r) => s + r.refund_units, 0)
  const totalRefundsAUD  = data.reduce((s, r) => s + r.refunds_aud, 0)
  const totalQtySold     = data.reduce((s, r) => s + r.qty_sold, 0)
  const totalRevenue     = data.reduce((s, r) => s + r.revenue, 0)
  const returnRate       = totalQtySold > 0 ? (totalRefundUnits / totalQtySold) * 100 : 0

  const chartData = data.map(r => ({
    month:        r.month.slice(5),
    returns:      r.refund_units,
    refundsAUD:   r.refunds_aud,
    returnRate:   r.qty_sold > 0 ? +((r.refund_units / r.qty_sold) * 100).toFixed(2) : 0,
    revenue:      r.revenue,
  }))

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Returns"
        description={data.length ? `${data.length}-month view · Athena live data` : "Querying Athena…"}
      >
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="h-8 w-36 rounded-2xl text-[12px]"><SelectValue /></SelectTrigger>
          <SelectContent className="rounded-2xl">
            {RANGE_OPTIONS.map(o => (
              <SelectItem key={o.from} value={String(o.from)} className="text-[12px]">{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="h-8 rounded-2xl text-[12px] gap-1.5" onClick={fetch_} disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
          Refresh
        </Button>
      </DashboardHeader>

      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Return Units" value={loading ? "…" : totalRefundUnits.toLocaleString()} icon={<RotateCcw className="h-4 w-4" />} accent />
          <KpiCard title="Return Rate"  value={loading ? "…" : `${returnRate.toFixed(1)}%`}       icon={<Percent className="h-4 w-4" />} />
          <KpiCard title="Refund Value" value={loading ? "…" : fmtAUD(totalRefundsAUD)}           icon={<DollarSign className="h-4 w-4" />} />
          <KpiCard title="Units Sold"   value={loading ? "…" : totalQtySold.toLocaleString()}      icon={<AlertTriangle className="h-4 w-4" />} />
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">Athena query failed</p>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono break-all">{error}</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={fetch_}>Retry</Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold tracking-wide flex items-center gap-2">
                Return Units — Monthly
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "2px", fontSize: "12px" }} />
                  <Bar dataKey="returns" fill="var(--color-chart-5)" radius={[2, 2, 0, 0]} maxBarSize={32} name="Returns" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold tracking-wide flex items-center gap-2">
                Return Rate % — Monthly
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "2px", fontSize: "12px" }} formatter={(v: number) => [`${v}%`, "Rate"]} />
                  <Line type="monotone" dataKey="returnRate" stroke="var(--color-chart-5)" strokeWidth={2} dot={false} name="Rate" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold tracking-wide flex items-center gap-2">
              Refund Value (A$) — Monthly
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="refGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--color-chart-5)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-chart-5)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "2px", fontSize: "12px" }} formatter={(v: number) => [fmtAUD(v), "Refunds"]} />
                <Area type="monotone" dataKey="refundsAUD" stroke="var(--color-chart-5)" strokeWidth={2} fill="url(#refGrad)" name="Refunds" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {!loading && data.length > 0 && (
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold tracking-wide">Monthly Detail</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-5 pb-2">
                <div className="grid grid-cols-5 gap-3 text-[10px] text-muted-foreground tracking-[0.15em] uppercase pb-2 border-b border-border">
                  <span>Month</span>
                  <span className="text-right">Revenue</span>
                  <span className="text-right">Units Sold</span>
                  <span className="text-right">Returns</span>
                  <span className="text-right">Refund Value</span>
                </div>
                <div className="divide-y divide-border max-h-72 overflow-y-auto">
                  {[...data].reverse().map(r => (
                    <div key={r.month} className="grid grid-cols-5 gap-3 py-2.5 items-center">
                      <span className="text-[12px] font-medium text-foreground">{r.month}</span>
                      <span className="text-[12px] text-right text-foreground">{fmtAUD(r.revenue)}</span>
                      <span className="text-[12px] text-right text-muted-foreground">{r.qty_sold.toLocaleString()}</span>
                      <span className="text-[12px] text-right text-[var(--tangelo)]">{r.refund_units.toLocaleString()}</span>
                      <span className="text-[12px] text-right font-medium text-foreground">{fmtAUD(r.refunds_aud)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
