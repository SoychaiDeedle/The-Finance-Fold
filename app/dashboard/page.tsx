"use client"

import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts"
import { DashboardHeader } from "@/components/dashboard-header"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, FileText, CreditCard } from "lucide-react"

const revenueData = [
  { month: "Jul", revenue: 1240000, invoices: 48 },
  { month: "Aug", revenue: 1380000, invoices: 54 },
  { month: "Sep", revenue: 1190000, invoices: 44 },
  { month: "Oct", revenue: 1520000, invoices: 61 },
  { month: "Nov", revenue: 1680000, invoices: 67 },
  { month: "Dec", revenue: 2140000, invoices: 84 },
  { month: "Jan", revenue: 980000, invoices: 38 },
  { month: "Feb", revenue: 1120000, invoices: 43 },
  { month: "Mar", revenue: 1460000, invoices: 57 },
  { month: "Apr", revenue: 1590000, invoices: 63 },
  { month: "May", revenue: 1720000, invoices: 69 },
  { month: "Jun", revenue: 1850000, invoices: 74 },
]

const categoryData = [
  { name: "Bedding", value: 42 },
  { name: "Towels", value: 24 },
  { name: "Accessories", value: 18 },
  { name: "Homeware", value: 10 },
  { name: "Gift Sets", value: 6 },
]

const COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"]

const recentTransactions = [
  { id: "INV-4291", entity: "Selfridges UK", amount: "£48,200", type: "Invoice", status: "Paid", date: "Today" },
  { id: "INV-4290", entity: "David Jones AU", amount: "A$92,400", type: "Invoice", status: "Pending", date: "Today" },
  { id: "EXP-0814", entity: "DHL Logistics", amount: "A$4,180", type: "Expense", status: "Approved", date: "Yesterday" },
  { id: "INV-4289", entity: "Harvey Nichols", amount: "£31,600", type: "Invoice", status: "Paid", date: "2 days ago" },
  { id: "REF-0192", entity: "Myer AU", amount: "A$7,240", type: "Refund", status: "Processing", date: "3 days ago" },
]

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Paid: "default",
  Pending: "secondary",
  Approved: "outline",
  Processing: "secondary",
}

const cashflowData = [
  { month: "Jan", inflow: 980000, outflow: 620000 },
  { month: "Feb", inflow: 1120000, outflow: 710000 },
  { month: "Mar", inflow: 1460000, outflow: 880000 },
  { month: "Apr", inflow: 1590000, outflow: 940000 },
  { month: "May", inflow: 1720000, outflow: 1020000 },
  { month: "Jun", inflow: 1850000, outflow: 1080000 },
]

export default function OverviewPage() {
  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Overview" description="Financial performance at a glance — FY 2025–26" />

      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Total Revenue" value="A$17.9M" change={14.2} icon={<DollarSign className="h-4 w-4" />} accent />
          <KpiCard title="Gross Margin" value="68.4%" change={2.1} icon={<TrendingUp className="h-4 w-4" />} />
          <KpiCard title="Invoices Raised" value="702" change={9.8} icon={<FileText className="h-4 w-4" />} />
          <KpiCard title="Outstanding A/R" value="A$2.3M" change={-4.6} icon={<CreditCard className="h-4 w-4" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 rounded-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold tracking-wide">Revenue — 12 Month Trend</CardTitle>
                <Badge variant="outline" className="text-[10px] tracking-wide rounded-2xl">FY 2025–26</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip
                    contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "2px", fontSize: "12px" }}
                    formatter={(v: number) => [`A$${(v / 1000000).toFixed(2)}M`, "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold tracking-wide">Revenue by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} dataKey="value" strokeWidth={0}>
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "2px", fontSize: "12px" }}
                    formatter={(v: number) => [`${v}%`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {categoryData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full shrink-0" style={{ background: COLORS[i] }} />
                      <span className="text-[12px] text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="text-[12px] font-medium text-foreground">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold tracking-wide">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-5 pb-2">
                <div className="grid grid-cols-5 gap-2 text-[10px] text-muted-foreground tracking-[0.15em] uppercase pb-2 border-b border-border">
                  <span>Ref</span>
                  <span className="col-span-2">Entity</span>
                  <span className="text-right">Amount</span>
                  <span className="text-right">Status</span>
                </div>
                <div className="divide-y divide-border">
                  {recentTransactions.map((t) => (
                    <div key={t.id} className="grid grid-cols-5 gap-2 py-2.5 items-center">
                      <span className="text-[10px] font-mono text-muted-foreground">{t.id}</span>
                      <div className="col-span-2">
                        <p className="text-[12px] font-medium text-foreground truncate">{t.entity}</p>
                        <p className="text-[10px] text-muted-foreground">{t.type} · {t.date}</p>
                      </div>
                      <span className="text-[12px] text-right font-medium text-foreground">{t.amount}</span>
                      <div className="flex justify-end">
                        <Badge variant={statusVariant[t.status] || "outline"} className="text-[9px] tracking-wide rounded-2xl h-5 px-1.5">
                          {t.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold tracking-wide">Cash Flow — Last 6 Months</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={cashflowData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip
                    contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "2px", fontSize: "12px" }}
                    formatter={(v: number, name: string) => [`A$${(v / 1000000).toFixed(2)}M`, name === "inflow" ? "Inflow" : "Outflow"]}
                  />
                  <Bar dataKey="inflow" fill="var(--color-chart-1)" radius={[2, 2, 0, 0]} maxBarSize={24} />
                  <Bar dataKey="outflow" fill="var(--color-chart-2)" radius={[2, 2, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
