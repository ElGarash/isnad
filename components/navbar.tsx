"use client";

import { Info, Link as LinkIcon, Search, Users } from "lucide-react";
import Link from "next/link";

function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b-4 border-black bg-white">
      <div className="container mx-auto flex h-20">
        <div className="flex flex-1 items-center justify-between px-4">
          <Link
            href="/"
            className="group flex items-center space-x-2 rtl:space-x-reverse"
          >
            <div className="relative h-12 w-12 rotate-45 transform bg-parchment transition-transform group-hover:rotate-0 group-hover:-skew-x-12">
              <LinkIcon className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 -rotate-45 transform text-black" />
            </div>
            <span className="inline-block -skew-x-12 transform bg-black px-3 py-2 text-2xl font-bold text-white transition-transform">
              إسناد
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-base rtl:space-x-reverse">
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
        </div>
      </div>
    </header>
  );
}

export default Navbar;
