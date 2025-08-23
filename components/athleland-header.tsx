"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AthlelandHeader() {
  return (
    <header className="w-full bg-black border-b border-white/10 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-white text-xl font-light tracking-[0.2em]">ATHLELAND</h1>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/5">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
