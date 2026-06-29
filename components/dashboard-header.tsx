"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sun, Moon, Bell, Settings, LogOut, User } from "lucide-react"

interface DashboardHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
}

export function DashboardHeader({ title, description, children }: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 backdrop-blur-sm px-6">
      <div className="w-8 lg:hidden shrink-0" />

      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold tracking-tight text-foreground truncate">
          {title}
        </h1>
        {description && (
          <p className="text-[11px] text-muted-foreground tracking-wide hidden sm:block">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {children}

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 relative text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[9px] bg-[var(--tangelo)] text-white border-0">
            3
          </Badge>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 rounded-full p-0 ml-1" aria-label="User menu">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-[var(--citrus-green)] text-[var(--dark-green)] text-[10px] font-semibold">
                  FF
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">Account</span>
                <span className="text-xs text-muted-foreground font-normal">Finance Manager</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/dashboard/settings" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Profile
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/dashboard/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" /> Settings
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/auth/signout" className="flex items-center gap-2 text-[var(--tangelo)] focus:text-[var(--tangelo)]">
                <LogOut className="h-4 w-4" /> Sign Out
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
