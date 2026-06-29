"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Users2, UserCheck, BookOpen, Calendar, Search, Plus } from "lucide-react"

const team = [
  { name: "Sarah Martinez", role: "Head of Finance", dept: "Finance", location: "Sydney", status: "Active", avatar: "SM" },
  { name: "Tom Walker", role: "Financial Controller", dept: "Finance", location: "Melbourne", status: "Active", avatar: "TW" },
  { name: "Rachel Kim", role: "Management Accountant", dept: "Finance", location: "Sydney", status: "Active", avatar: "RK" },
  { name: "Mike Davis", role: "Head of Operations", dept: "Operations", location: "Sydney", status: "Active", avatar: "MD" },
  { name: "Emily Chen", role: "Supply Chain Manager", dept: "Operations", location: "Melbourne", status: "Active", avatar: "EC" },
  { name: "James Park", role: "HR Business Partner", dept: "People", location: "Sydney", status: "Active", avatar: "JP" },
  { name: "Anna Patel", role: "Finance Analyst", dept: "Finance", location: "London", status: "Active", avatar: "AP" },
  { name: "Chris Lee", role: "IT Systems Manager", dept: "Technology", location: "Sydney", status: "Leave", avatar: "CL" },
]

const upcomingLeave = [
  { name: "Chris Lee", type: "Annual Leave", from: "30 Jun 2026", to: "14 Jul 2026", days: 11 },
  { name: "Emily Chen", type: "Personal Leave", from: "7 Jul 2026", to: "8 Jul 2026", days: 2 },
  { name: "Tom Walker", type: "Annual Leave", from: "14 Jul 2026", to: "25 Jul 2026", days: 10 },
]

const deptColors: Record<string, string> = {
  Finance: "bg-[var(--color-chart-1)]/10 text-[var(--color-chart-1)]",
  Operations: "bg-[var(--color-chart-2)]/20 text-foreground",
  People: "bg-[var(--color-chart-3)]/20 text-foreground",
  Technology: "bg-[var(--color-chart-4)]/20 text-foreground",
}

export default function PeoplePage() {
  const [search, setSearch] = useState("")
  const filtered = team.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.role.toLowerCase().includes(search.toLowerCase()) ||
    p.dept.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="People & Culture" description="Team directory, learning and leave management">
        <Button size="sm" className="h-8 rounded-xl gap-2 text-xs">
          <Plus className="h-3.5 w-3.5" />
          Add Member
        </Button>
      </DashboardHeader>
      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Team Members" value="24" change={4.3} icon={<Users2 className="h-4 w-4" />} accent />
          <KpiCard title="Active" value="22" icon={<UserCheck className="h-4 w-4" />} />
          <KpiCard title="On Leave" value="2" icon={<Calendar className="h-4 w-4" />} />
          <KpiCard title="Learning Completions" value="148" change={22.1} icon={<BookOpen className="h-4 w-4" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 rounded-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-sm font-semibold tracking-wide">Team Directory</CardTitle>
                <div className="relative w-52">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Search team…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-8 text-sm rounded-xl" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-5 pb-2">
                <div className="divide-y divide-border">
                  {filtered.map((p) => (
                    <div key={p.name} className="flex items-center gap-4 py-3">
                      <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center text-[11px] font-semibold text-muted-foreground shrink-0">
                        {p.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-foreground">{p.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{p.role} · {p.location}</p>
                      </div>
                      <Badge className={`text-[9px] tracking-wide rounded-2xl h-5 px-1.5 border-0 ${deptColors[p.dept] || ""}`}>{p.dept}</Badge>
                      <Badge variant={p.status === "Leave" ? "secondary" : "outline"} className="text-[9px] tracking-wide rounded-2xl h-5 px-1.5">{p.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold tracking-wide">Upcoming Leave</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-5 pb-2 space-y-0 divide-y divide-border">
                {upcomingLeave.map((l) => (
                  <div key={l.name} className="py-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[13px] font-medium text-foreground">{l.name}</p>
                      <Badge variant="secondary" className="text-[9px] tracking-wide rounded-2xl h-5 px-1.5">{l.days}d</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{l.type}</p>
                    <p className="text-[10px] text-muted-foreground">{l.from} → {l.to}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
