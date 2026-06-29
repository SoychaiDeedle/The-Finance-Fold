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
import { TrendingUp, ShoppingCart, DollarSign, Percent, RefreshCcw, Loader2, AlertTriangle } from "lucide-react"

interface DayRow {
  day:            string
  qty_sold:       number
  revenue:        number
  revenue_ex_tax: number
  refund_units:   number
  refunds_aud:    number
}

interface MonthRow {
  month:          string
  qty_sold:       number
  revenue:        number
  revenue_ex_tax: number
  refund_units:   number
  refunds_aud:    number
  cogs_est:       number
}

interface StoreRow {
  store_name:   string
  month:        string
  qty_sold:     number
  revenue:      number
  refund_units: number
  refunds_aud:  number
}

function fmtAUD(v: number) {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(v)
}

function toYM() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function daysAgoDate(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

function monthsAgo(n: number) {
  const d = new Date()
  d.setMonth(d.getMonth() - n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

export default function DailySalesPage() {
  const [dayData, setDayData]       = useState<DayRow[]>([])
  const [monthData, setMonthData]   = useState<MonthRow[]>([])
  const [storeData, setStoreData]   = useState<StoreRow[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [period, setPeriod]         = useState("30")

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const days   = parseInt(period)
      const fromDay = daysAgoDate(days)
      const today   = new Date().toISOString().slice(0, 10)
      const from12m = monthsAgo(12)
      const toYm    = toYM()

      const [dayRes, monthRes, storeRes] = await Promise.all([
        fetch(`/api/sales-summary?groupBy=day&from=${fromDay.slice(0,7)}&to=${toYm}`),
        fetch(`/api/sales-summary?groupBy=month&from=${from12m}&to=${toYm}`),
        fetch(`/api/sales-summary?groupBy=store_month&from=${monthsAgo(3)}&to=${toYm}`),
      ])

      const [dayJson, monthJson, storeJson] = await Promise.all([
        dayRes.json(), monthRes.json(), storeRes.json(),
      ])

      if (!dayRes.ok)   throw new Error(dayJson.error   ?? "Day query failed")
      if (!monthRes.ok) throw new Error(monthJson.error ?? "Month query failed")
      if (!storeRes.ok) throw new Error(storeJson.error ?? "Store query failed")

      const allDays: DayRow[] = dayJson.data ?? []
      const cutoff = fromDay
      setDayData(allDays.filter(r => r.day >= cutoff))
      setMonthData(monthJson.data ?? [])
      setStoreData(storeJson.data ?? [])
    } catch (e: any) {
      setError(e.message ?? "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => { fetchAll() }, [fetchAll])

  const totalRevenue   = dayData.reduce((s, r) => s + r.revenue, 0)
  const totalUnits     = dayData.reduce((s, r) => s + r.qty_sold, 0)
  const totalRefunds   = dayData.reduce((s, r) => s + r.refunds_aud, 0)
  const netRevenue     = totalRevenue - totalRefunds
  const avgDailyRev    = dayData.length > 0 ? netRevenue / dayData.length : 0

  const last7 = dayData.slice(-7)
  const prev7  = dayData.slice(-14, -7)
  const last7Rev = last7.reduce((s, r) => s + r.revenue, 0)
  const prev7Rev = prev7.reduce((s, r) => s + r.revenue, 0)
  const wow      = prev7Rev > 0 ? ((last7Rev - prev7Rev) / prev7Rev) * 100 : 0

  const stores = [...new Set(storeData.map(r => r.store_name))].sort()
  const storeColors = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"]

  const storePivot = Object.values(
    storeData.reduce((acc, r) => {
      if (!acc[r.month]) acc[r.month] = { month: r.month.slice(5) }
      acc[r.month][r.store_name] = r.revenue
      return acc
    }, {} as Record<string, any>)
  ).sort((a, b) => a.month.localeCompare(b.month))

  const dailyChart = dayData.map(r => ({
    day:     r.day.slice(5),
    revenue: r.revenue,
    units:   r.qty_sold,
  }))

  const monthChart = monthData.map(r => ({
    month:     r.month.slice(5),
    revenue:   r.revenue,
    refunds:   r.refunds_aud,
    net:       r.revenue - r.refunds_aud,
  }))

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Daily Sales"
        description={dayData.length ? `${dayData.length} days · Athena live data` : "Querying Athena…"}
      >
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="h-8 w-36 rounded-2xl text-[12px]"><SelectValue /></SelectTrigger>
          <SelectContent className="rounded-2xl">
            <SelectItem value="14"  className="text-[12px]">Last 14 days</SelectItem>
            <SelectItem value="30"  className="text-[12px]">Last 30 days</SelectItem>
            <SelectItem value="60"  className="text-[12px]">Last 60 days</SelectItem>
            <SelectItem value="90"  className="text-[12px]">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="h-8 rounded-2xl text-[12px] gap-1.5" onClick={fetchAll} disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
          Refresh
        </Button>
      </DashboardHeader>

      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Net Revenue" value={loading ? "…" : fmtAUD(netRevenue)} change={+wow.toFixed(1)} icon={<DollarSign className="h-4 w-4" />} accent />
          <KpiCard title="Units Sold"  value={loading ? "…" : totalUnits.toLocaleString()} icon={<ShoppingCart className="h-4 w-4" />} />
          <KpiCard title="Avg Daily Revenue" value={loading ? "…" : fmtAUD(avgDailyRev)} icon={<TrendingUp className="h-4 w-4" />} />
          <KpiCard title="Refunds (Period)" value={loading ? "…" : fmtAUD(totalRefunds)} icon={<Percent className="h-4 w-4" />} />
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">Athena query failed</p>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono break-all">{error}</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={fetchAll}>Retry</Button>
          </div>
        )}

        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold tracking-wide flex items-center gap-2">
              Daily Revenue (A$) — Last {period} days
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={dailyChart} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--color-chart-1)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false}
                  interval={Math.floor(dailyChart.length / 8)} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false}
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "2px", fontSize: "12px" }}
                  formatter={(v: number) => [fmtAUD(v), "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#revGrad2)" name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold tracking-wide flex items-center gap-2">
                Revenue vs Refunds — Monthly (12m)
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthChart} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "2px", fontSize: "12px" }}
                    formatter={(v: number, name: string) => [fmtAUD(v), name === "revenue" ? "Revenue" : name === "refunds" ? "Refunds" : "Net"]} />
                  <Bar dataKey="revenue" fill="var(--color-chart-1)" radius={[2, 2, 0, 0]} maxBarSize={20} name="Revenue" />
                  <Bar dataKey="refunds" fill="var(--color-chart-5)" radius={[2, 2, 0, 0]} maxBarSize={20} name="Refunds" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold tracking-wide flex items-center gap-2">
                Revenue by Store — Last 3 Months
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={storePivot} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "2px", fontSize: "12px" }}
                    formatter={(v: number) => [fmtAUD(v), ""]} />
                  {stores.map((s, i) => (
                    <Bar key={s} dataKey={s} fill={storeColors[i % storeColors.length]} radius={[2, 2, 0, 0]} maxBarSize={18} name={s} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
              {stores.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {stores.map((s, i) => (
                    <div key={s} className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full shrink-0" style={{ background: storeColors[i % storeColors.length] }} />
                      <span className="text-[11px] text-muted-foreground">{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
