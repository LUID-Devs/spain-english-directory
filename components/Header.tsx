"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">SpainEnglishDirectory</span>
          <span className="text-sm font-medium text-foreground">.com</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-md border border-border bg-white px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            List Your Business
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
