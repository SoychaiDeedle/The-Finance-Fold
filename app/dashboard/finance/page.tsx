"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { DollarSign, TrendingUp, FileText, CheckSquare } from "lucide-react"

const plData = [
  { month: "Jul", revenue: 1240000, cogs: 412000, grossProfit: 828000 },
  { month: "Aug", revenue: 1380000, cogs: 448000, grossProfit: 932000 },
  { month: "Sep", revenue: 1190000, cogs: 398000, grossProfit: 792000 },
  { month: "Oct", revenue: 1520000, cogs: 498000, grossProfit: 1022000 },
  { month: "Nov", revenue: 1680000, cogs: 541000, grossProfit: 1139000 },
  { month: "Dec", revenue: 2140000, cogs: 682000, grossProfit: 1458000 },
]

const marginTrend = plData.map(d => ({ month: d.month, margin: +((d.grossProfit / d.revenue) * 100).toFixed(1) }))

const reconciliationTasks = [
  { task: "Accounts Receivable Reconciliation", status: "Complete", assignee: "Sarah M.", due: "30 Jun" },
  { task: "Payroll Journal Entry", status: "Complete", assignee: "Tom W.", due: "30 Jun" },
  { task: "Bank Statement Reconciliation", status: "In Progress", assignee: "Rachel K.", due: "30 Jun" },
  { task: "Prepayments & Accruals", status: "In Progress", assignee: "Sarah M.", due: "30 Jun" },
  { task: "Inventory Valuation Check", status: "Pending", assignee: "Mike D.", due: "30 Jun" },
  { task: "Intercompany Eliminations", status: "Pending", assignee: "Tom W.", due: "30 Jun" },
  { task: "Depreciation Run", status: "Pending", assignee: "Rachel K.", due: "30 Jun" },
]

const invoices = [
  { id: "INV-4291", client: "Selfridges UK", amount: "£48,200", due: "14 Jul 2026", status: "Paid" },
  { id: "INV-4290", client: "David Jones", amount: "A$92,400", due: "14 Jul 2026", status: "Outstanding" },
  { id: "INV-4289", client: "Harvey Nichols", amount: "£31,600", due: "7 Jul 2026", status: "Paid" },
  { id: "INV-4288", client: "Harrods", amount: "£52,100", due: "30 Jun 2026", status: "Overdue" },
  { id: "INV-4287", client: "Net-a-Porter", amount: "A$54,100", due: "28 Jun 2026", status: "Paid" },
]

const statusConfig: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Complete: "default", Paid: "default",
  "In Progress": "secondary", Outstanding: "secondary",
  Pending: "outline", Overdue: "destructive",
}

export default function FinancePage() {
  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Finance & Reporting" description="P&L, reconciliation, invoices and cash flow" />
      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Gross Revenue" value="A$17.9M" change={14.2} icon={<DollarSign className="h-4 w-4" />} accent />
          <KpiCard title="Gross Margin" value="68.4%" change={2.1} icon={<TrendingUp className="h-4 w-4" />} />
          <KpiCard title="Outstanding Invoices" value="A$2.3M" change={-4.6} icon={<FileText className="h-4 w-4" />} />
          <KpiCard title="Month End Tasks" value="4 / 7" icon={<CheckSquare className="h-4 w-4" />} />
        </div>

        <Tabs defaultValue="pl">
          <TabsList className="rounded-xl">
            <TabsTrigger value="pl" className="rounded-lg text-xs">P&L</TabsTrigger>
            <TabsTrigger value="recon" className="rounded-lg text-xs">Month End</TabsTrigger>
            <TabsTrigger value="invoices" className="rounded-lg text-xs">Invoices</TabsTrigger>
          </TabsList>

          <TabsContent value="pl" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold tracking-wide">Revenue vs COGS vs Gross Profit</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={plData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "2px", fontSize: "12px" }} formatter={(v: number) => [`A$${v.toLocaleString()}`, ""]} />
                      <Bar dataKey="revenue" fill="var(--color-chart-1)" radius={[2, 2, 0, 0]} maxBarSize={20} name="Revenue" />
                      <Bar dataKey="cogs" fill="var(--color-chart-2)" radius={[2, 2, 0, 0]} maxBarSize={20} name="COGS" />
                      <Bar dataKey="grossProfit" fill="var(--color-chart-3)" radius={[2, 2, 0, 0]} maxBarSize={20} name="Gross Profit" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold tracking-wide">Gross Margin Trend (%)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={marginTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} domain={[60, 75]} />
                      <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "2px", fontSize: "12px" }} formatter={(v: number) => [`${v}%`, "Margin"]} />
                      <Line type="monotone" dataKey="margin" stroke="var(--color-chart-1)" strokeWidth={2} dot={{ fill: "var(--color-chart-1)", r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recon" className="mt-4">
            <Card className="rounded-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold tracking-wide">Month End Checklist — June 2026</CardTitle>
                  <Badge variant="secondary" className="rounded-2xl text-[10px]">4 / 7 Complete</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="px-5 pb-2">
                  <div className="grid grid-cols-5 gap-3 text-[10px] text-muted-foreground tracking-[0.15em] uppercase pb-2 border-b border-border">
                    <span className="col-span-2">Task</span>
                    <span>Assignee</span>
                    <span className="text-center">Due</span>
                    <span className="text-right">Status</span>
                  </div>
                  <div className="divide-y divide-border">
                    {reconciliationTasks.map((t) => (
                      <div key={t.task} className="grid grid-cols-5 gap-3 py-3 items-center">
                        <span className="col-span-2 text-[13px] font-medium text-foreground">{t.task}</span>
                        <span className="text-[12px] text-muted-foreground">{t.assignee}</span>
                        <span className="text-[12px] text-center text-muted-foreground">{t.due}</span>
                        <div className="flex justify-end">
                          <Badge variant={statusConfig[t.status]} className="text-[9px] tracking-wide rounded-2xl h-5 px-1.5">{t.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="mt-4">
            <Card className="rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold tracking-wide">Recent Invoices</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="px-5 pb-2">
                  <div className="grid grid-cols-5 gap-3 text-[10px] text-muted-foreground tracking-[0.15em] uppercase pb-2 border-b border-border">
                    <span>Invoice</span>
                    <span className="col-span-2">Client</span>
                    <span className="text-right">Amount</span>
                    <span className="text-right">Status</span>
                  </div>
                  <div className="divide-y divide-border">
                    {invoices.map((inv) => (
                      <div key={inv.id} className="grid grid-cols-5 gap-3 py-3 items-center">
                        <span className="text-[11px] font-mono text-muted-foreground">{inv.id}</span>
                        <div className="col-span-2">
                          <p className="text-[13px] font-medium text-foreground">{inv.client}</p>
                          <p className="text-[11px] text-muted-foreground">Due {inv.due}</p>
                        </div>
                        <span className="text-[13px] text-right font-medium text-foreground">{inv.amount}</span>
                        <div className="flex justify-end">
                          <Badge variant={statusConfig[inv.status] || "outline"} className="text-[9px] tracking-wide rounded-2xl h-5 px-1.5">{inv.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
