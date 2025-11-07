"use client";

import { useState } from "react";
import { useActiveAccount, useWalletBalance } from "thirdweb/react";
import { Logo } from "@/components/logo";
import { TopUpModal } from "@/components/top-up-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { chain, tokenAddress } from "@/lib/constants";
import { client } from "@/lib/thirdweb.client";

export function ChatBalanceButton() {
  const account = useActiveAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch current CHAT balance
  const { data: balance, isLoading: isLoadingBalance } = useWalletBalance({
    client,
    address: account?.address,
    tokenAddress,
    chain,
  });

  // Only show when wallet is connected
  if (!account) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
        title="Get CHAT tokens"
      >
        {isLoadingBalance ? (
          <Skeleton className="h-5 w-16" />
        ) : (
          <>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {balance?.displayValue || "0"}
            </span>
            <Logo withText={false} size="xs" />
          </>
        )}
      </button>

      <TopUpModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Get CHAT Tokens"
        description="You'll need CHAT tokens to post messages"
        onSuccess={() => {
          // Balance will automatically refresh via the hook
        }}
      />
    </>
  );
}
