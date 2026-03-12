"use client";

import Link from "next/link";
import { MessageSquare, Shield, UserCircle } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-6">
          {/* Left: Brand */}
          <Link href="/" className="group flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/20 transition-transform duration-300 group-hover:scale-105">
              <Shield className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">SAARTHI</span>
          </Link>

          {/* Right: Navigation & CTA */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Desktop Navigation Links */}
            <div className="hidden sm:flex items-center gap-0.5">
              <Link
                href="/chat"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-all duration-200 hover:bg-slate-100/80 hover:text-slate-900"
              >
                <MessageSquare className="h-4 w-4" />
                Citizen Chat
              </Link>
            </div>

            {/* CSC Portal Login CTA */}
            <Link
              href="/operator/login"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/30 hover:brightness-110"
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
