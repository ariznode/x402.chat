"use client";

import Link from "next/link";
import { ViewTransition } from "react";
import { ChatBalanceButton } from "@/components/chat-balance-button";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletConnect } from "@/components/wallet-connect";

export function PageHeader() {
  return (
    <ViewTransition name="page-header">
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="container mx-auto flex h-18 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="transition-opacity hover:opacity-80">
              <Logo withText={false} size="md" />
            </Link>
            <div className="hidden flex-col sm:flex">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                x402.chat
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Decentralized social comments
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <ChatBalanceButton />
            <WalletConnect />
          </div>
        </div>
      </header>
    </ViewTransition>
  );
}
