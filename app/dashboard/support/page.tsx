"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LifeBuoy, Clock, CheckCircle, AlertTriangle, Search, Plus } from "lucide-react"

const tickets = [
  { id: "TKT-1082", subject: "Invoice INV-4288 payment query", category: "Finance", priority: "High", status: "Open", assignee: "Sarah M.", created: "29 Jun 2026" },
  { id: "TKT-1081", subject: "Incorrect item shipped — ORD-8836", category: "Operations", priority: "High", status: "In Progress", assignee: "Tom W.", created: "28 Jun 2026" },
  { id: "TKT-1080", subject: "Stock reconciliation discrepancy", category: "Inventory", priority: "Medium", status: "In Progress", assignee: "Rachel K.", created: "28 Jun 2026" },
  { id: "TKT-1079", subject: "System access request — new hire", category: "People", priority: "Low", status: "Open", assignee: "Mike D.", created: "27 Jun 2026" },
  { id: "TKT-1078", subject: "Month end report not generating", category: "Finance", priority: "High", status: "Resolved", assignee: "Sarah M.", created: "26 Jun 2026" },
  { id: "TKT-1077", subject: "Credit limit increase request — Incu", category: "Finance", priority: "Medium", status: "Resolved", assignee: "Tom W.", created: "25 Jun 2026" },
  { id: "TKT-1076", subject: "Supplier portal login issue", category: "Operations", priority: "Low", status: "Resolved", assignee: "Rachel K.", created: "24 Jun 2026" },
]

const priorityConfig: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  High: "destructive",
  Medium: "secondary",
  Low: "outline",
}

const statusConfig: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Open: "outline",
  "In Progress": "secondary",
  Resolved: "default",
}

export default function SupportPage() {
  const [search, setSearch] = useState("")
  const filtered = tickets.filter(t =>
    t.subject.toLowerCase().includes(search.toLowerCase()) ||
    t.id.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  )

  const open = tickets.filter(t => t.status === "Open").length
  const inProgress = tickets.filter(t => t.status === "In Progress").length
  const resolved = tickets.filter(t => t.status === "Resolved").length
  const highPriority = tickets.filter(t => t.priority === "High" && t.status !== "Resolved").length

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Support Tickets" description="Internal support requests and issue tracking">
        <Button size="sm" className="h-8 rounded-xl gap-2 text-xs">
          <Plus className="h-3.5 w-3.5" />
          New Ticket
        </Button>
      </DashboardHeader>
      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Open" value={String(open)} icon={<LifeBuoy className="h-4 w-4" />} accent />
          <KpiCard title="In Progress" value={String(inProgress)} icon={<Clock className="h-4 w-4" />} />
          <KpiCard title="Resolved" value={String(resolved)} icon={<CheckCircle className="h-4 w-4" />} />
          <KpiCard title="High Priority" value={String(highPriority)} icon={<AlertTriangle className="h-4 w-4" />} />
        </div>

        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-sm font-semibold tracking-wide">All Tickets</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Search tickets…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-8 text-sm rounded-xl" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-5 pb-2">
              <div className="grid grid-cols-7 gap-3 text-[10px] text-muted-foreground tracking-[0.15em] uppercase pb-2 border-b border-border">
                <span>ID</span>
                <span className="col-span-3">Subject</span>
                <span>Priority</span>
                <span>Assignee</span>
                <span className="text-right">Status</span>
              </div>
              <div className="divide-y divide-border">
                {filtered.map((t) => (
                  <div key={t.id} className="grid grid-cols-7 gap-3 py-3 items-center">
                    <span className="text-[10px] font-mono text-muted-foreground">{t.id}</span>
                    <div className="col-span-3">
                      <p className="text-[13px] font-medium text-foreground leading-tight">{t.subject}</p>
                      <p className="text-[10px] text-muted-foreground">{t.category} · {t.created}</p>
                    </div>
                    <Badge variant={priorityConfig[t.priority]} className="text-[9px] tracking-wide rounded-2xl h-5 px-1.5 w-fit">{t.priority}</Badge>
                    <span className="text-[12px] text-muted-foreground">{t.assignee}</span>
                    <div className="flex justify-end">
                      <Badge variant={statusConfig[t.status]} className="text-[9px] tracking-wide rounded-2xl h-5 px-1.5">{t.status}</Badge>
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
