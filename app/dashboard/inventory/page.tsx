"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Package, AlertTriangle, DollarSign, TrendingDown } from "lucide-react"

const categoryStock = [
  { category: "Bedding", inStock: 4820, lowStock: 142, value: 2840000 },
  { category: "Towels", inStock: 2140, lowStock: 67, value: 890000 },
  { category: "Accessories", inStock: 1680, lowStock: 89, value: 420000 },
  { category: "Homeware", inStock: 940, lowStock: 31, value: 310000 },
  { category: "Gift Sets", inStock: 380, lowStock: 18, value: 148000 },
]

const stockChart = categoryStock.map(c => ({ name: c.category, units: c.inStock }))

const lowStockItems = [
  { sku: "TFF-BD-001-W-K", name: "Linen Duvet Cover - White King", stock: 4, reorder: 20 },
  { sku: "TFF-TW-002-S-L", name: "Egyptian Cotton Towel - Stone Large", stock: 7, reorder: 30 },
  { sku: "TFF-BD-008-N-Q", name: "Percale Sheet Set - Navy Queen", stock: 3, reorder: 15 },
  { sku: "TFF-AC-014-G", name: "Linen Pillowcase Set - Sage", stock: 9, reorder: 25 },
  { sku: "TFF-HW-003-C", name: "Candle Diffuser - Cedar", stock: 5, reorder: 20 },
]

export default function InventoryPage() {
  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Inventory & Product" description="Stock levels, valuation and low-stock alerts" />
      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Total SKUs" value="9,960" change={4.2} icon={<Package className="h-4 w-4" />} accent />
          <KpiCard title="Inventory Value" value="A$4.61M" change={7.8} icon={<DollarSign className="h-4 w-4" />} />
          <KpiCard title="Low Stock Items" value="347" change={12.4} icon={<AlertTriangle className="h-4 w-4" />} />
          <KpiCard title="Out of Stock" value="28" change={-6.1} icon={<TrendingDown className="h-4 w-4" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold tracking-wide">Stock by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stockChart} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} width={80} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "2px", fontSize: "12px" }} />
                  <Bar dataKey="units" fill="var(--color-chart-1)" radius={[0, 2, 2, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold tracking-wide">Category Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-5 pb-2">
                <div className="grid grid-cols-4 gap-3 text-[10px] text-muted-foreground tracking-[0.15em] uppercase pb-2 border-b border-border">
                  <span className="col-span-2">Category</span>
                  <span className="text-right">Units</span>
                  <span className="text-right">Value</span>
                </div>
                <div className="divide-y divide-border">
                  {categoryStock.map((c) => (
                    <div key={c.category} className="grid grid-cols-4 gap-3 py-2.5 items-center">
                      <div className="col-span-2">
                        <p className="text-[13px] font-medium text-foreground">{c.category}</p>
                        {c.lowStock > 0 && (
                          <p className="text-[10px] text-[var(--tangelo)]">{c.lowStock} low stock</p>
                        )}
                      </div>
                      <span className="text-[13px] text-right font-medium text-foreground">{c.inStock.toLocaleString()}</span>
                      <span className="text-[11px] text-right text-muted-foreground">A${(c.value / 1000).toFixed(0)}k</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold tracking-wide flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[var(--tangelo)]" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-5 pb-2">
              <div className="grid grid-cols-5 gap-3 text-[10px] text-muted-foreground tracking-[0.15em] uppercase pb-2 border-b border-border">
                <span>SKU</span>
                <span className="col-span-2">Product</span>
                <span className="text-right">Stock</span>
                <span className="text-right">Reorder At</span>
              </div>
              <div className="divide-y divide-border">
                {lowStockItems.map((item) => (
                  <div key={item.sku} className="grid grid-cols-5 gap-3 py-2.5 items-center">
                    <span className="text-[10px] font-mono text-muted-foreground">{item.sku}</span>
                    <span className="col-span-2 text-[13px] font-medium text-foreground">{item.name}</span>
                    <div className="flex justify-end">
                      <Badge variant="destructive" className="text-[9px] tracking-wide rounded-2xl h-5 px-1.5">{item.stock} left</Badge>
                    </div>
                    <span className="text-[12px] text-right text-muted-foreground">{item.reorder} units</span>
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
