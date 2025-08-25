"use client";

import { clsx } from "clsx";
import Link from "next/link";
import React from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import type { User } from "@supabase/supabase-js";
import { TemplateButton } from "./button";
import { ClientOnly } from "@/components/ClientOnly";

export function TemplateNavbar({ 
  children, 
  ...props 
}: React.ComponentProps<"div">) {
  return (
    <nav
      className={clsx(
        "sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/80",
        "supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60"
      )}
      {...props}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-x-8">
            <Link href="/" className="flex items-center gap-x-2">
              <span className="text-2xl">🇫🇷</span>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Spoken
              </span>
            </Link>
            {children}
          </div>
          <SiteNavigation />
        </div>
      </div>
    </nav>
  );
}

function SiteNavigation() {
  return (
    <ClientOnly fallback={
      <div className="flex items-center gap-x-4">
        <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded-full h-9 w-20"></div>
        <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded-full h-9 w-20"></div>
      </div>
    }>
      <AuthNavigation />
    </ClientOnly>
  );
}

function AuthNavigation() {
  const { user, loading } = useAuth();

  // Show loading skeleton during initial auth load
  if (loading) {
    return (
      <div className="flex items-center gap-x-4">
        <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded-full h-9 w-20"></div>
        <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded-full h-9 w-20"></div>
      </div>
    );
  }
  
  return <AuthenticatedNavigation user={user} />;
}

function AuthenticatedNavigation({ user }: { user: User | null }) {
  const { signOut } = useAuth();
  
  return (
    <div className="flex items-center gap-x-4">
      {user ? (
        <>
          <Link 
            href="/dashboard" 
            className="text-sm font-medium text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors"
          >
            Dashboard
          </Link>
          <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {user.email}
          </span>
          <button
            onClick={signOut}
            className="text-sm font-medium text-slate-700 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-95"
          >
            Sign out
          </button>
        </>
      ) : (
        <>
          <Link href="/sign-in">
            <TemplateButton 
              variant="secondary" 
              className="bg-white/80 text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 dark:ring-slate-600 dark:hover:bg-slate-700 transition-all duration-200 active:scale-95"
            >
              Sign In
            </TemplateButton>
          </Link>
          <Link href="/sign-up">
            <TemplateButton className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95">
              Sign Up
            </TemplateButton>
          </Link>
        </>
      )}
    </div>
  );
}