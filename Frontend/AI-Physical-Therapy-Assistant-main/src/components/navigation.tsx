"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Dumbbell, User, BarChart2 } from "lucide-react"

export default function Navigation() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <nav className="bg-white shadow-sm border-b p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-600">
          FitApp
        </Link>

        <div className="flex gap-2">
          <Link href="/">
            <Button
              variant={isActive("/") ? "default" : "ghost"}
              size="sm"
              className={isActive("/") ? "bg-blue-600" : ""}
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
          <Link href="/exercises">
            <Button
              variant={isActive("/exercises") ? "default" : "ghost"}
              size="sm"
              className={isActive("/exercises") ? "bg-blue-600" : ""}
            >
              <Dumbbell className="w-4 h-4 mr-2" />
              Exercise
            </Button>
          </Link>
          <Link href="/history">
            <Button
              variant={isActive("/history") ? "default" : "ghost"}
              size="sm"
              className={isActive("/history") ? "bg-blue-600" : ""}
            >
              <BarChart2 className="w-4 h-4 mr-2" />
              History
            </Button>
          </Link>
          <Link href="/profile">
            <Button
              variant={isActive("/profile") ? "default" : "ghost"}
              size="sm"
              className={isActive("/profile") ? "bg-blue-600" : ""}
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
