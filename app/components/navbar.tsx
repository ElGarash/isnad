"use client";

import { Info, Link as LinkIcon, Search, Users } from "lucide-react";
import Link from "next/link";

function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b-4 border-black bg-white">
      <div className="flex h-16">
        <div className="flex flex-1 items-center justify-around">
          <Link
            href="/"
            className="group flex items-center space-x-2 rtl:space-x-reverse"
          >
            <div className="relative w-10 h-10 bg-parchment rotate-45 transform transition-transform group-hover:-skew-x-12 group-hover:rotate-0">
              <LinkIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45 text-black w-6 h-6" />
            </div>
            <span className="inline-block text-xl font-bold bg-black text-white px-2 py-1 transform -skew-x-12 transition-transform">
              إسناد
            </span>
          </Link>
          <nav className="flex items-center space-x-6 rtl:space-x-reverse text-sm">
            <Link
              href="/search"
              className="relative overflow-hidden group flex items-center gap-1"
            >
              <Search className="w-4 h-4" />
              <span className="relative z-10 transition-colors hover:text-foreground/80 mb-0.5">
                البحث
              </span>
              <span className="absolute bottom-0 left-0 w-full h-1 bg-parchment transform origin-left scale-x-0 transition-transform group-hover:scale-x-100"></span>
            </Link>
            <Link
              href="/scholars"
              className="relative overflow-hidden group flex items-center gap-1"
            >
              <Users className="w-4 h-4" />
              <span className="relative z-10 transition-colors hover:text-foreground/80 mb-0.5">
                الرواة
              </span>
              <span className="absolute bottom-0 left-0 w-full h-1 bg-parchment transform origin-left scale-x-0 transition-transform group-hover:scale-x-100"></span>
            </Link>
            <Link
              href="/about"
              className="relative overflow-hidden group flex items-center gap-1"
            >
              <Info className="w-4 h-4" />
              <span className="relative z-10 transition-colors hover:text-foreground/80 mb-0.5">
                عن المشروع
              </span>
              <span className="absolute bottom-0 left-0 w-full h-1 bg-parchment transform origin-left scale-x-0 transition-transform group-hover:scale-x-100"></span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
