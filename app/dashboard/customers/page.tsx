"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Users, Star, TrendingUp, Search } from "lucide-react"

const customers = [
  { id: "C001", name: "Selfridges UK", region: "UK", tier: "Platinum", totalSpend: "£842,400", orders: 48, yoyGrowth: 18.4 },
  { id: "C002", name: "David Jones", region: "AU", tier: "Platinum", totalSpend: "A$1,240,000", orders: 72, yoyGrowth: 14.2 },
  { id: "C003", name: "Harvey Nichols", region: "UK", tier: "Gold", totalSpend: "£614,200", orders: 36, yoyGrowth: 9.8 },
  { id: "C004", name: "Net-a-Porter", region: "Global", tier: "Gold", totalSpend: "A$892,100", orders: 54, yoyGrowth: 22.6 },
  { id: "C005", name: "Myer AU", region: "AU", tier: "Gold", totalSpend: "A$748,600", orders: 44, yoyGrowth: 7.4 },
  { id: "C006", name: "Bloomingdale's", region: "US", tier: "Silver", totalSpend: "US$418,200", orders: 28, yoyGrowth: 31.8 },
  { id: "C007", name: "Brown Thomas", region: "EU", tier: "Silver", totalSpend: "€312,800", orders: 22, yoyGrowth: 12.1 },
  { id: "C008", name: "Harrods", region: "UK", tier: "Platinum", totalSpend: "£1,142,000", orders: 64, yoyGrowth: 8.9 },
  { id: "C009", name: "Tessuti", region: "AU", tier: "Silver", totalSpend: "A$214,400", orders: 18, yoyGrowth: 5.2 },
  { id: "C010", name: "Incu", region: "AU", tier: "Bronze", totalSpend: "A$98,200", orders: 12, yoyGrowth: 41.4 },
]

const tierColors: Record<string, "default" | "secondary" | "outline"> = {
  Platinum: "default",
  Gold: "secondary",
  Silver: "outline",
  Bronze: "outline",
}

const regionData = [
  { region: "AU", customers: 4, revenue: 2301200 },
  { region: "UK", customers: 3, revenue: 2598600 },
  { region: "Global", customers: 1, revenue: 892100 },
  { region: "US", customers: 1, revenue: 418200 },
  { region: "EU", customers: 1, revenue: 312800 },
]

export default function CustomersPage() {
  const [search, setSearch] = useState("")
  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.region.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Customers" description="Customer accounts, tiers and spend analytics" />
      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Active Accounts" value="84" change={7.2} icon={<Users className="h-4 w-4" />} accent />
          <KpiCard title="Platinum Accounts" value="12" change={2.1} icon={<Star className="h-4 w-4" />} />
          <KpiCard title="Avg Spend / Account" value="A$213K" change={9.4} icon={<TrendingUp className="h-4 w-4" />} />
          <KpiCard title="New This Quarter" value="8" change={14.3} icon={<Users className="h-4 w-4" />} />
        </div>

        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold tracking-wide">Revenue by Region</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={regionData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="region" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "2px", fontSize: "12px" }} formatter={(v: number) => [`A$${v.toLocaleString()}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="var(--color-chart-1)" radius={[2, 2, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-sm font-semibold tracking-wide">All Customers</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Search customers…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-8 text-sm rounded-xl" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-5 pb-2">
              <div className="grid grid-cols-6 gap-3 text-[10px] text-muted-foreground tracking-[0.15em] uppercase pb-2 border-b border-border">
                <span className="col-span-2">Customer</span>
                <span>Region</span>
                <span>Tier</span>
                <span className="text-right">Total Spend</span>
                <span className="text-right">YoY Growth</span>
              </div>
              <div className="divide-y divide-border">
                {filtered.map((c) => (
                  <div key={c.id} className="grid grid-cols-6 gap-3 py-2.5 items-center">
                    <div className="col-span-2">
                      <p className="text-[13px] font-medium text-foreground">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground">{c.orders} orders</p>
                    </div>
                    <span className="text-[12px] text-muted-foreground">{c.region}</span>
                    <Badge variant={tierColors[c.tier]} className="text-[9px] tracking-wide rounded-2xl h-5 px-1.5 w-fit">{c.tier}</Badge>
                    <span className="text-[13px] text-right font-medium text-foreground">{c.totalSpend}</span>
                    <span className={`text-[12px] text-right font-medium ${c.yoyGrowth >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                      +{c.yoyGrowth}%
                    </span>
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
