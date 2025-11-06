"use client";

import { UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AccountAvatar,
  AccountProvider,
  useActiveAccount,
  useActiveWallet,
} from "thirdweb/react";
import { wrapFetchWithPayment } from "thirdweb/x402";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { client } from "@/lib/thirdweb";

interface CommentFormProps {
  ownerAddress: string;
  parentCommentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  ownerName?: string;
  existingCommentCount?: number;
}

const BASE_UNIT_PRICE = 0.01;

export function CommentForm({
  ownerAddress,
  parentCommentId,
  onSuccess,
  onCancel,
  placeholder,
  ownerName,
  existingCommentCount = 0,
}: CommentFormProps) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const router = useRouter();

  const MAX_LENGTH = 1000;

  // Calculate dynamic price based on existing comment count
  const price = (existingCommentCount * BASE_UNIT_PRICE).toFixed(2);
  const priceLabel = `$${price}`;

  // Generate contextual placeholder
  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    if (parentCommentId) return "Write a reply...";
    return ownerName
      ? `Write something to ${ownerName}...`
      : "Write something...";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet) {
      setError("Please connect your wallet first");
      return;
    }

    if (!account?.address) {
      setError("Please connect your wallet first");
      return;
    }

    if (!text.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    if (text.length > MAX_LENGTH) {
      setError(`Comment is too long (max ${MAX_LENGTH} characters)`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const fetchWithPayment = wrapFetchWithPayment(fetch, client, wallet);
    try {
      const url = parentCommentId ? "/api/reply" : "/api/comment";
      const result = await fetchWithPayment(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          parentCommentId
            ? {
                text,
                parentCommentId,
              }
            : {
                ownerAddress,
                text,
              },
        ),
      });

      if (result.status === 200) {
        setText("");
        router.refresh();
        onSuccess?.();
      } else {
        const errorData = (await result.json()) as { error: string };
        setError(errorData.error || "Failed to post comment");
      }
    } catch (err) {
      console.error("Error posting comment:", err);
      setError("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!account) {
    return (
      <Card className="shadow-md">
        <CardContent className="py-4">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Connect your wallet to post comments
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-3">
            <AccountProvider address={account.address} client={client}>
              <AccountAvatar
                className="h-10 w-10 rounded-full shrink-0"
                fallbackComponent={
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <UserIcon className="h-5 w-5 text-zinc-400" />
                  </div>
                }
                loadingComponent={
                  <Skeleton className="h-10 w-10 rounded-full" />
                }
              />
            </AccountProvider>
            <div className="flex-1 space-y-2 flex flex-col gap-2">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={getPlaceholder()}
                className="min-h-[80px] resize-none"
                disabled={isSubmitting}
                maxLength={MAX_LENGTH}
                rows={3}
              />
              <div className="flex items-top justify-between">
                <span className="text-xs text-zinc-400">
                  {text.length}/{MAX_LENGTH}
                </span>
                <div className="flex gap-2">
                  {onCancel && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={onCancel}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={isSubmitting || !text.trim()}
                    size="sm"
                    className="min-w-32 px-4"
                  >
                    {isSubmitting
                      ? "Posting..."
                      : parentCommentId
                        ? `Reply for ${priceLabel}`
                        : `Post for ${priceLabel}`}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 dark:text-red-400 ml-13">
              {error}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
