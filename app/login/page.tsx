"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<"password" | "magic">("password")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const supabase = createClient()

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      window.location.href = "/dashboard"
    }
    setLoading(false)
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setError(error.message)
    else setMessage("Check your email for a magic link.")
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-[11px] text-muted-foreground tracking-[0.2em] uppercase mb-2">Welcome to</p>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">The Finance Fold</h1>
          <p className="text-sm text-muted-foreground mt-2">Finance operations portal</p>
        </div>

        <Card className="rounded-2xl border border-border">
          <CardHeader className="pb-4 pt-6 px-6">
            <div className="flex gap-2">
              <Button
                variant={mode === "password" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("password")}
                className="flex-1 rounded-xl text-xs h-8"
              >
                Password
              </Button>
              <Button
                variant={mode === "magic" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("magic")}
                className="flex-1 rounded-xl text-xs h-8"
              >
                Magic Link
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <form onSubmit={mode === "password" ? handlePasswordLogin : handleMagicLink} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] text-muted-foreground tracking-[0.1em] uppercase">Email</label>
                <Input
                  type="email"
                  placeholder="you@thefold.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-xl h-10"
                />
              </div>

              {mode === "password" && (
                <div className="space-y-1.5">
                  <label className="text-[11px] text-muted-foreground tracking-[0.1em] uppercase">Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="rounded-xl h-10"
                  />
                </div>
              )}

              {error && (
                <p className="text-[12px] text-destructive">{error}</p>
              )}
              {message && (
                <p className="text-[12px] text-emerald-600 dark:text-emerald-400">{message}</p>
              )}

              <Button type="submit" className="w-full rounded-xl h-10" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "password" ? "Sign In" : "Send Magic Link"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-[11px] text-muted-foreground mt-6">
          The Fold London · Finance Operations
        </p>
      </div>
    </div>
  )
}
