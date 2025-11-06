"use client";

import Link from "next/link";
import { AccountAddress, AccountName, AccountProvider } from "thirdweb/react";
import { shortenAddress } from "thirdweb/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { client } from "@/lib/thirdweb";

interface BackToProfileButtonProps {
  ownerAddress: string;
}

export function BackToProfileButton({
  ownerAddress,
}: BackToProfileButtonProps) {
  return (
    <Link href={`/${ownerAddress}`}>
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to{" "}
        <AccountProvider address={ownerAddress} client={client}>
          <AccountName
            fallbackComponent={<AccountAddress formatFn={shortenAddress} />}
            loadingComponent={<Skeleton className="h-4 w-12 rounded-sm" />}
          />
        </AccountProvider>
      </Button>
    </Link>
  );
}
