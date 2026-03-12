"use client";

import Link from "next/link";
import { MessageSquare, Shield, UserCircle } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-3.5 sm:px-6">
        <div className="flex items-center justify-between gap-6">
          {/* Left: Brand */}
          <Link href="/" className="flex items-center gap-2 transition hover:opacity-80">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 shadow-sm">
              <Shield className="h-5 w-5 text-emerald-500" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">SAARTHI</span>
          </Link>

          {/* Right: Navigation & CTA */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Desktop Navigation Links */}
            <div className="hidden sm:flex items-center gap-0.5">
              <Link
                href="/chat"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <MessageSquare className="h-4 w-4" />
                Citizen Chat
              </Link>
            </div>

            {/* CSC Portal Login CTA */}
            <Link
              href="/operator/login"
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
            >
              <UserCircle className="h-4 w-4" />
              <span className="hidden sm:inline">CSC Portal</span>
              <span className="sm:hidden">Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
