"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">España</span>
          <span className="text-lg font-medium text-foreground">English</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/search"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Search
          </Link>
          <Link
            href="/search?category=Healthcare"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Healthcare
          </Link>
          <Link
            href="/search?category=Legal"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Legal
          </Link>
          <Link
            href="/search?category=Business"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Business
          </Link>
        </nav>
        <Link
          href="/search"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
        >
          Find Services
        </Link>
      </div>
    </header>
  );
}
