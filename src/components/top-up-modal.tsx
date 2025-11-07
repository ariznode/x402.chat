"use client";

import { ArrowLeftIcon, CheckCircle2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { toast } from "sonner";
import { arbitrum, base, polygon } from "thirdweb/chains";
import {
  BuyWidget,
  ChainIcon,
  ChainName,
  ChainProvider,
  useActiveAccount,
  useActiveWallet,
  useInvalidateBalances,
  useWalletBalance,
} from "thirdweb/react";
import { wrapFetchWithPayment } from "thirdweb/x402";
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  chain,
  tokenAddress,
  tokenInfo,
  USDC_ADDRESSES,
} from "@/lib/constants";
import { client } from "@/lib/thirdweb.client";

const PAYMENT_CHAINS = [
  { chain: arbitrum, label: "Arbitrum" },
  { chain: base, label: "Base" },
  { chain: polygon, label: "Polygon" },
];

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
  const wallet = useActiveWallet();
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenAmount, setTokenAmount] = useState(10);
  const [selectedChainId, setSelectedChainId] = useState(arbitrum.id);
  const [modalView, setModalView] = useState<"mint" | "fund">("mint");
  const walletAddress = account?.address;
  const invalidateBalances = useInvalidateBalances();
  const theme = useTheme();

  // Fetch current CHAT balance
  const { data: balance, isLoading: isLoadingBalance } = useWalletBalance({
    client,
    address: account?.address,
    tokenAddress,
    chain,
  });

  // Calculate price in USD
  const priceInUSD = tokenAmount * 0.001;

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
            description: `${tokenAmount} ${tokenInfo.symbol} tokens have been added to your wallet`,
          });

          // Invalidate balances to refresh
          invalidateBalances({
            chainId: chain.id,
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
      }
    }, 2000); // Poll every 2 seconds
  };

  const handleMint = async () => {
    if (!wallet) {
      setError("No wallet connected");
      return;
    }

    setIsMinting(true);
    setError(null);

    try {
      const fetchWithPayment = wrapFetchWithPayment(fetch, client, wallet);
      // Call the mint API
      const response = await fetchWithPayment("/api/mint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: tokenAmount,
          paymentChainId: selectedChainId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (errorData.error === "insufficient_funds") {
          // Switch to fund view to show BuyWidget
          setModalView("fund");
          setIsMinting(false);
          return;
        }

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

  // Get the selected payment chain
  const selectedChain = PAYMENT_CHAINS.find(
    (c) => c.chain.id === selectedChainId,
  )?.chain;

  // Handle modal close - reset view
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setModalView("mint");
      setError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {modalView === "mint" && (
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {title}
            </DialogTitle>
            <DialogDescription className="text-left">
              {description}
            </DialogDescription>
          </DialogHeader>
        )}

        {modalView === "fund" ? (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setModalView("mint")}
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back</span>
            </button>
            {selectedChain && (
              <BuyWidget
                client={client}
                chain={selectedChain}
                theme={theme.theme === "dark" ? "dark" : "light"}
                tokenAddress={USDC_ADDRESSES[selectedChainId] as `0x${string}`}
                amount={priceInUSD.toString()}
                title="Insufficient Funds"
                description="Top up USDC to mint CHAT tokens"
                onSuccess={() => {
                  toast.success("USDC purchase successful!", {
                    description: "You can now retry minting CHAT tokens",
                  });
                  setModalView("mint");
                }}
              />
            )}
          </div>
        ) : (
          <div className="space-y-4">
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

            {/* Token Amount Input */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Select amount
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Logo withText={false} size="sm" />
                </div>
                <Input
                  type="number"
                  min={1}
                  max={1000}
                  value={tokenAmount}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value, 10);
                    if (!Number.isNaN(value) && value >= 1 && value <= 1000) {
                      setTokenAmount(value);
                    }
                  }}
                  autoFocus={false}
                  className="text-lg font-bold pl-12"
                />
              </div>
              <div className="flex gap-2 pt-1">
                {[10, 50, 100, 500, 1000].map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setTokenAmount(amount)}
                    className="flex-1 rounded-full"
                  >
                    {amount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Chain Selector */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Payment Network
              </div>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_CHAINS.map(({ chain: paymentChain }) => (
                  <Button
                    key={paymentChain.id}
                    type="button"
                    variant={
                      selectedChainId === paymentChain.id
                        ? "outline"
                        : "secondary"
                    }
                    size="sm"
                    onClick={() => setSelectedChainId(paymentChain.id)}
                    className="flex flex-col h-auto py-2 gap-1 relative"
                  >
                    {selectedChainId === paymentChain.id && (
                      <CheckCircle2 className="absolute -top-1 -right-1 h-4 w-4 text-green-500 fill-white dark:fill-zinc-950" />
                    )}
                    <ChainProvider chain={paymentChain}>
                      <ChainIcon
                        className="h-6 w-6"
                        client={client}
                        loadingComponent={<Skeleton className="h-6 w-6" />}
                      />
                      <ChainName
                        className="text-xs"
                        loadingComponent={<Skeleton className="h-4 w-16" />}
                      />
                    </ChainProvider>
                  </Button>
                ))}
              </div>
            </div>

            {/* Demo Message */}
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <span className="font-semibold">
                  The CHAT token has a fixed price of $0.001 USDC per token and
                  is not subject to market volatility.
                </span>
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                <p className="text-sm text-red-900 dark:text-red-100">
                  {error}
                </p>
              </div>
            )}
          </div>
        )}

        {modalView === "mint" && (
          <DialogFooter className="flex-row gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
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
                  Mint {tokenAmount} <Logo withText={false} size="xs" /> for $
                  {priceInUSD}
                </span>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
