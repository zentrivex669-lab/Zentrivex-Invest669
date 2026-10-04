import type { ReactNode } from "react";
import { Link } from "wouter";
import { Building2 } from "lucide-react";

export default function PublicPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-card-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 size={16} />
            </span>
            <span className="text-lg font-bold tracking-tight">Zentrivex</span>
          </Link>
          <nav aria-label="Main navigation" className="flex items-center gap-3 text-sm sm:gap-5">
            <Link href="/about" className="text-muted-foreground transition-colors hover:text-foreground">About</Link>
            <Link href="/terms" className="text-muted-foreground transition-colors hover:text-foreground">Terms</Link>
            <Link href="/privacy" className="text-muted-foreground transition-colors hover:text-foreground">Privacy</Link>
            <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-5 py-12 sm:py-16">
        {children}
      </main>

      <footer className="border-t border-card-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-muted-foreground sm:flex-row">
          <span>© 2026 Zentrivex Ltd. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-foreground">About Us</Link>
            <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}