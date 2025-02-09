"use client"
import Link from "next/link"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Navbar() {
  const { setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center">
        <div className="flex flex-1 items-center justify-between max-w-6xl mx-auto px-4">
          <Link href="/" className="flex items-center mr-4 rtl:ml-4 rtl:mr-0">
            <span className="inline-block font-bold">إسناد</span>
          </Link>
          <nav className="flex items-center space-x-6 rtl:space-x-reverse text-sm">
            <Link href="/scholars" className="transition-colors hover:text-foreground/80">
              الرواة
            </Link>
            <Link href="/search" className="transition-colors hover:text-foreground/80">
              البحث
            </Link>
            <Link href="/about" className="transition-colors hover:text-foreground/80">
              عن المشروع
            </Link>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end"
                  className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <DropdownMenuItem onClick={() => setTheme("light")}>فاتح</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>داكن</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>تلقائي</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}

