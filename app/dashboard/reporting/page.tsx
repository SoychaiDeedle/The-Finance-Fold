"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import { BarChart3, TrendingUp, Globe, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

const salesByRegion = [
  { region: "Australia", revenue: 7840000, margin: 69.2 },
  { region: "United Kingdom", revenue: 5124000, margin: 71.4 },
  { region: "Europe", revenue: 2480000, margin: 66.8 },
  { region: "United States", revenue: 1640000, margin: 68.1 },
  { region: "Middle East", revenue: 640000, margin: 72.4 },
  { region: "Rest of World", revenue: 276000, margin: 64.2 },
]

const marginByCategory = [
  { name: "Bedding", margin: 71.2 },
  { name: "Towels", margin: 66.8 },
  { name: "Accessories", margin: 74.1 },
  { name: "Homeware", margin: 62.4 },
  { name: "Gift Sets", margin: 68.9 },
]

const qtrData = [
  { qtr: "Q1 FY25", revenue: 4130000, budget: 3900000 },
  { qtr: "Q2 FY25", revenue: 5340000, budget: 5100000 },
  { qtr: "Q3 FY25", revenue: 3910000, budget: 4200000 },
  { qtr: "Q4 FY25", revenue: 6200000, budget: 5800000 },
  { qtr: "Q1 FY26", revenue: 4480000, budget: 4200000 },
  { qtr: "Q2 FY26", revenue: 5610000, budget: 5400000 },
]

const PIE_COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"]

export default function ReportingPage() {
  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Reporting" description="Sales analysis, margin breakdown and regional performance">
        <Button variant="outline" size="sm" className="h-8 rounded-xl gap-2 text-xs">
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
      </DashboardHeader>
      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Total Revenue" value="A$17.9M" change={14.2} icon={<BarChart3 className="h-4 w-4" />} accent />
          <KpiCard title="vs Budget" value="+6.8%" change={6.8} icon={<TrendingUp className="h-4 w-4" />} />
          <KpiCard title="Top Region" value="AU" icon={<Globe className="h-4 w-4" />} />
          <KpiCard title="Best Margin" value="Accessories" icon={<TrendingUp className="h-4 w-4" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold tracking-wide">Revenue vs Budget — Quarterly</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={qtrData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="qtr" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "2px", fontSize: "12px" }} formatter={(v: number) => [`A$${(v / 1000000).toFixed(2)}M`, ""]} />
                  <Bar dataKey="budget" fill="var(--color-chart-2)" radius={[2, 2, 0, 0]} maxBarSize={20} name="Budget" />
                  <Bar dataKey="revenue" fill="var(--color-chart-1)" radius={[2, 2, 0, 0]} maxBarSize={20} name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold tracking-wide">Gross Margin by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={marginByCategory} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="margin" strokeWidth={0}>
                      {marginByCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "2px", fontSize: "12px" }} formatter={(v: number) => [`${v}%`, "Margin"]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {marginByCategory.map((c, i) => (
                    <div key={c.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                        <span className="text-[12px] text-muted-foreground">{c.name}</span>
                      </div>
                      <span className="text-[12px] font-medium text-foreground">{c.margin}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold tracking-wide">Regional Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-5 pb-4">
              <div className="grid grid-cols-4 gap-4 text-[10px] text-muted-foreground tracking-[0.15em] uppercase pb-2 border-b border-border">
                <span className="col-span-2">Region</span>
                <span className="text-right">Revenue</span>
                <span className="text-right">Gross Margin</span>
              </div>
              <div className="divide-y divide-border">
                {salesByRegion.map((r) => (
                  <div key={r.region} className="grid grid-cols-4 gap-4 py-3 items-center">
                    <div className="col-span-2 flex items-center gap-3">
                      <span className="text-[13px] font-medium text-foreground">{r.region}</span>
                    </div>
                    <span className="text-[13px] text-right font-medium text-foreground">A${(r.revenue / 1000000).toFixed(2)}M</span>
                    <span className={`text-[12px] text-right font-medium ${r.margin >= 68 ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--tangelo)]"}`}>{r.margin}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
