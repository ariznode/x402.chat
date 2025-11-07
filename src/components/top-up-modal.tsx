"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AccountAvatar,
  AccountName,
  AccountProvider,
  Blobbie,
  useActiveAccount,
  useInvalidateBalances,
  useWalletBalance,
} from "thirdweb/react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { chain, tokenAddress, tokenInfo } from "@/lib/constants";
import { client } from "@/lib/thirdweb.client";

interface TopUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  title?: string;
  description?: string;
}

export function TopUpModal({
  open,
  onOpenChange,
  onSuccess,
  title = "Insufficient Balance",
  description = "You need more CHAT tokens to post this comment.",
}: TopUpModalProps) {
  const account = useActiveAccount();
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const walletAddress = account?.address;
  const invalidateBalances = useInvalidateBalances();

  // Fetch current CHAT balance
  const { data: balance, isLoading: isLoadingBalance } = useWalletBalance({
    client,
    address: account?.address,
    tokenAddress,
    chain,
  });

  const pollTransactionStatus = async (transactionId: string) => {
    const toastId = toast.loading("Minting tokens...", {
      description: "Transaction is being processed",
    });

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/transaction-status?transactionId=${transactionId}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch transaction status");
        }

        const result = (await response.json()) as {
          status: string;
          transactionId: string;
        };

        if (result.status === "CONFIRMED") {
          clearInterval(pollInterval);
          toast.success("Tokens minted successfully!", {
            id: toastId,
            description: `10 ${tokenInfo.symbol} tokens have been added to your wallet`,
          });
          onSuccess?.();
        } else if (result.status === "FAILED") {
          clearInterval(pollInterval);
          toast.error("Transaction failed", {
            id: toastId,
            description: "Failed to mint tokens. Please try again.",
          });
        }
      } catch (err) {
        clearInterval(pollInterval);
        toast.error("Error checking transaction status", {
          id: toastId,
          description: "Please refresh the page to check your balance",
        });
        console.error("Error polling transaction status:", err);
      } finally {
        invalidateBalances({
          chainId: chain.id,
        });
      }
    }, 2000); // Poll every 2 seconds
  };

  const handleMint = async () => {
    if (!account) {
      setError("No wallet connected");
      return;
    }

    setIsMinting(true);
    setError(null);

    try {
      // Sign the message
      const signature = await account.signMessage({
        message: "minting 10 chat tokens",
      });

      // Call the mint API
      const response = await fetch("/api/mint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signature,
          address: walletAddress,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to mint tokens");
      }

      const result = (await response.json()) as {
        success: boolean;
        transactionId: string;
        message: string;
      };

      // Close modal immediately and start polling
      onOpenChange(false);
      pollTransactionStatus(result.transactionId);
    } catch (err) {
      console.error("Error minting tokens:", err);
      setError(err instanceof Error ? err.message : "Failed to mint tokens");
    } finally {
      setIsMinting(false);
    }
  };

  if (!walletAddress) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Wallet Info */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900">
            <AccountProvider address={walletAddress} client={client}>
              <AccountAvatar
                className="h-12 w-12 rounded-full shrink-0"
                fallbackComponent={
                  <Blobbie
                    className="h-12 w-12 rounded-full"
                    address={walletAddress}
                  />
                }
                loadingComponent={
                  <Skeleton className="h-12 w-12 rounded-full" />
                }
              />
              <div className="flex-1 min-w-0">
                <AccountName
                  className="font-medium text-sm text-zinc-900 dark:text-zinc-100"
                  loadingComponent={<Skeleton className="h-4 w-24" />}
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
              </div>
            </AccountProvider>
          </div>

          {/* Balance Display */}
          <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
              Current Balance
            </div>
            <div className="flex items-center gap-2">
              {isLoadingBalance ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <>
                  <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {balance?.displayValue || "-"}
                  </span>
                  <Logo withText={false} size="sm" />
                </>
              )}
            </div>
          </div>

          {/* Demo Message */}
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <span className="font-semibold">Demo Mode:</span> You can mint 10{" "}
              {tokenInfo.symbol} tokens for free to try out the platform!
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
              <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isMinting}
            className="flex-1"
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={handleMint}
            disabled={isMinting}
            className="flex-1"
          >
            {isMinting ? (
              "Minting..."
            ) : (
              <span className="flex items-center gap-1">
                Mint 10 <Logo withText={false} size="xs" />
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
