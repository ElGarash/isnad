"use client";

import { Info, Link as LinkIcon, Menu, Search, Users, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b-4 border-black bg-white">
      <div className="container mx-auto flex h-16 md:h-20">
        <div className="flex flex-1 items-center justify-between px-4">
          <Link
            href="/"
            className="group flex items-center space-x-2 rtl:space-x-reverse"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="relative h-10 w-10 rotate-45 transform bg-parchment transition-transform group-hover:rotate-0 group-hover:-skew-x-12 md:h-12 md:w-12">
              <LinkIcon className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 -rotate-45 transform text-black md:h-7 md:w-7" />
            </div>
            <span className="inline-block -skew-x-12 transform bg-black px-2 py-1.5 text-xl font-bold text-white transition-transform md:px-3 md:py-2 md:text-2xl">
              إسناد
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center space-x-6 text-base md:flex rtl:space-x-reverse">
            <Link
              href="/search"
              className="group relative flex items-center gap-2 overflow-hidden"
            >
              <Search className="h-5 w-5" />
              <span className="relative z-10 mb-0.5 transition-colors hover:text-foreground/80">
                البحث
              </span>
              <span className="absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 transform bg-parchment transition-transform group-hover:scale-x-100"></span>
            </Link>
            <Link
              href="/narrator"
              className="group relative flex items-center gap-2 overflow-hidden"
            >
              <Users className="h-5 w-5" />
              <span className="relative z-10 mb-0.5 transition-colors hover:text-foreground/80">
                الرواة
              </span>
              <span className="absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 transform bg-parchment transition-transform group-hover:scale-x-100"></span>
            </Link>
            <Link
              href="/about"
              className="group relative flex items-center gap-2 overflow-hidden"
            >
              <Info className="h-5 w-5" />
              <span className="relative z-10 mb-0.5 transition-colors hover:text-foreground/80">
                عن المشروع
              </span>
              <span className="absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 transform bg-parchment transition-transform group-hover:scale-x-100"></span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 transition-colors hover:bg-parchment md:hidden"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <nav className="border-t-2 border-black bg-white md:hidden">
          <div className="container mx-auto flex flex-col gap-4 px-4 py-4">
            <Link
              href="/search"
              className="flex items-center gap-3 border-2 border-black p-3 transition-colors hover:bg-parchment"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Search className="h-5 w-5" />
              <span className="text-lg font-medium">البحث</span>
            </Link>
            <Link
              href="/narrator"
              className="flex items-center gap-3 border-2 border-black p-3 transition-colors hover:bg-parchment"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Users className="h-5 w-5" />
              <span className="text-lg font-medium">الرواة</span>
            </Link>
            <Link
              href="/about"
              className="flex items-center gap-3 border-2 border-black p-3 transition-colors hover:bg-parchment"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Info className="h-5 w-5" />
              <span className="text-lg font-medium">عن المشروع</span>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

export default Navbar;
