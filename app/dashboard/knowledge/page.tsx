"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { BookOpen, FileText, GitBranch, Layout, Search, Plus, Clock, User } from "lucide-react"

const documents = [
  { id: "DOC-001", title: "Month End Reconciliation SOP", category: "Finance", type: "SOP", author: "Sarah M.", updated: "28 Jun 2026", tags: ["reconciliation", "month-end"] },
  { id: "DOC-002", title: "Invoice Processing Workflow", category: "Finance", type: "WI", author: "Tom W.", updated: "24 Jun 2026", tags: ["invoices", "AP"] },
  { id: "DOC-003", title: "Expense Approval Policy", category: "Operations", type: "Policy", author: "Rachel K.", updated: "20 Jun 2026", tags: ["expenses", "approval"] },
  { id: "DOC-004", title: "New Employee Onboarding Checklist", category: "People", type: "Checklist", author: "Mike D.", updated: "18 Jun 2026", tags: ["onboarding", "HR"] },
  { id: "DOC-005", title: "Stock Count Procedure", category: "Inventory", type: "SOP", author: "Sarah M.", updated: "15 Jun 2026", tags: ["inventory", "stock-count"] },
  { id: "DOC-006", title: "Customer Credit Limit Assessment", category: "Finance", type: "Policy", author: "Tom W.", updated: "12 Jun 2026", tags: ["credit", "customers"] },
  { id: "DOC-007", title: "Supplier Payment Terms Guide", category: "Operations", type: "WI", author: "Rachel K.", updated: "10 Jun 2026", tags: ["suppliers", "payments"] },
  { id: "DOC-008", title: "Annual Budget Process", category: "Finance", type: "SOP", author: "Mike D.", updated: "5 Jun 2026", tags: ["budget", "planning"] },
]

const typeConfig: Record<string, "default" | "secondary" | "outline"> = {
  SOP: "default",
  Policy: "secondary",
  WI: "outline",
  Checklist: "outline",
}

const categoryIcons: Record<string, React.ReactNode> = {
  Finance: <FileText className="h-4 w-4" />,
  Operations: <GitBranch className="h-4 w-4" />,
  People: <User className="h-4 w-4" />,
  Inventory: <Layout className="h-4 w-4" />,
}

export default function KnowledgePage() {
  const [search, setSearch] = useState("")
  const filtered = documents.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.category.toLowerCase().includes(search.toLowerCase()) ||
    d.tags.some(t => t.includes(search.toLowerCase()))
  )

  const stats = [
    { label: "Documents", value: "48", icon: <FileText className="h-4 w-4" /> },
    { label: "SOPs", value: "18", icon: <BookOpen className="h-4 w-4" /> },
    { label: "Flowcharts", value: "12", icon: <GitBranch className="h-4 w-4" /> },
    { label: "Templates", value: "9", icon: <Layout className="h-4 w-4" /> },
  ]

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Knowledge Library" description="SOPs, policies, flowcharts and work instructions">
        <Button size="sm" className="h-8 rounded-xl gap-2 text-xs">
          <Plus className="h-3.5 w-3.5" />
          New Document
        </Button>
      </DashboardHeader>
      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label} className="rounded-2xl">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">{s.icon}</div>
                  <div>
                    <p className="text-2xl font-semibold text-foreground">{s.value}</p>
                    <p className="text-[11px] text-muted-foreground tracking-wide uppercase">{s.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-sm font-semibold tracking-wide">All Documents</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Search documents…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-8 text-sm rounded-xl" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-5 pb-2">
              <div className="grid grid-cols-6 gap-3 text-[10px] text-muted-foreground tracking-[0.15em] uppercase pb-2 border-b border-border">
                <span className="col-span-3">Document</span>
                <span>Category</span>
                <span>Type</span>
                <span className="text-right">Updated</span>
              </div>
              <div className="divide-y divide-border">
                {filtered.map((doc) => (
                  <div key={doc.id} className="grid grid-cols-6 gap-3 py-3 items-center cursor-pointer hover:bg-muted/40 rounded-lg px-0 -mx-0 transition-colors">
                    <div className="col-span-3">
                      <p className="text-[13px] font-medium text-foreground">{doc.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {doc.tags.map(t => (
                          <span key={t} className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                      {categoryIcons[doc.category]}
                      {doc.category}
                    </div>
                    <Badge variant={typeConfig[doc.type] || "outline"} className="text-[9px] tracking-wide rounded-2xl h-5 px-1.5 w-fit">{doc.type}</Badge>
                    <div className="flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {doc.updated}
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
