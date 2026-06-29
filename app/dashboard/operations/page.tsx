"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Wrench, Truck, Users, AlertCircle } from "lucide-react"

const shipmentsData = [
  { month: "Jan", outbound: 142, inbound: 48 },
  { month: "Feb", outbound: 168, inbound: 62 },
  { month: "Mar", outbound: 214, inbound: 71 },
  { month: "Apr", outbound: 198, inbound: 58 },
  { month: "May", outbound: 231, inbound: 84 },
  { month: "Jun", outbound: 247, inbound: 91 },
]

const suppliers = [
  { name: "Shanghai Textile Co.", category: "Bedding", orders: 24, onTime: "96%", status: "Active" },
  { name: "Cairo Cotton Mills", category: "Towels", orders: 18, onTime: "92%", status: "Active" },
  { name: "Linen House EU", category: "Accessories", orders: 12, onTime: "98%", status: "Active" },
  { name: "Pacific Homeware", category: "Homeware", orders: 9, onTime: "88%", status: "Review" },
  { name: "Gift Co. AU", category: "Gift Sets", orders: 6, onTime: "100%", status: "Active" },
]

const activeProjects = [
  { project: "Warehouse Optimisation", owner: "Rachel K.", due: "31 Aug 2026", progress: 68, status: "On Track" },
  { project: "ERP Migration", owner: "Tom W.", due: "30 Sep 2026", progress: 34, status: "On Track" },
  { project: "Supplier Onboarding Portal", owner: "Mike D.", due: "15 Jul 2026", progress: 82, status: "At Risk" },
  { project: "Returns Processing SLA", owner: "Sarah M.", due: "30 Jul 2026", progress: 51, status: "On Track" },
]

export default function OperationsPage() {
  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Operations" description="Logistics, suppliers, procurement and project tracking" />
      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Active Suppliers" value="34" change={2.4} icon={<Wrench className="h-4 w-4" />} accent />
          <KpiCard title="Shipments This Month" value="247" change={6.9} icon={<Truck className="h-4 w-4" />} />
          <KpiCard title="On-Time Delivery" value="94.2%" change={1.4} icon={<Users className="h-4 w-4" />} />
          <KpiCard title="Issues Open" value="7" change={-3.1} icon={<AlertCircle className="h-4 w-4" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold tracking-wide">Shipments — Inbound vs Outbound</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={shipmentsData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "2px", fontSize: "12px" }} />
                  <Bar dataKey="outbound" fill="var(--color-chart-1)" radius={[2, 2, 0, 0]} maxBarSize={20} name="Outbound" />
                  <Bar dataKey="inbound" fill="var(--color-chart-2)" radius={[2, 2, 0, 0]} maxBarSize={20} name="Inbound" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold tracking-wide">Active Projects</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-5 pb-2 space-y-4 pt-2">
                {activeProjects.map((p) => (
                  <div key={p.project}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <p className="text-[13px] font-medium text-foreground">{p.project}</p>
                        <p className="text-[10px] text-muted-foreground">{p.owner} · Due {p.due}</p>
                      </div>
                      <Badge variant={p.status === "At Risk" ? "destructive" : "outline"} className="text-[9px] tracking-wide rounded-2xl h-5 px-1.5">{p.status}</Badge>
                    </div>
                    <div className="bg-muted rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-[var(--color-chart-1)] transition-all" style={{ width: `${p.progress}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{p.progress}% complete</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold tracking-wide">Key Suppliers</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-5 pb-2">
              <div className="grid grid-cols-5 gap-3 text-[10px] text-muted-foreground tracking-[0.15em] uppercase pb-2 border-b border-border">
                <span className="col-span-2">Supplier</span>
                <span>Category</span>
                <span className="text-center">On-Time</span>
                <span className="text-right">Status</span>
              </div>
              <div className="divide-y divide-border">
                {suppliers.map((s) => (
                  <div key={s.name} className="grid grid-cols-5 gap-3 py-2.5 items-center">
                    <div className="col-span-2">
                      <p className="text-[13px] font-medium text-foreground">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground">{s.orders} orders this FY</p>
                    </div>
                    <span className="text-[12px] text-muted-foreground">{s.category}</span>
                    <span className={`text-[12px] text-center font-medium ${parseFloat(s.onTime) >= 95 ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--tangelo)]"}`}>{s.onTime}</span>
                    <div className="flex justify-end">
                      <Badge variant={s.status === "Review" ? "secondary" : "outline"} className="text-[9px] tracking-wide rounded-2xl h-5 px-1.5">{s.status}</Badge>
                    </div>
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
