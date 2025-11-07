"use client";

import { Heart, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, ViewTransition } from "react";
import {
  AccountAddress,
  AccountAvatar,
  AccountName,
  AccountProvider,
  Blobbie,
  useActiveAccount,
} from "thirdweb/react";
import { shortenAddress } from "thirdweb/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toggleLike } from "@/lib/mutations/comments";
import type {
  CommentWithParent,
  CommentWithReplies,
} from "@/lib/queries/comments";
import { client } from "@/lib/thirdweb.client";
import { Skeleton } from "./ui/skeleton";

interface CommentCardProps {
  comment: CommentWithReplies | CommentWithParent;
  onReply?: (commentId: string) => void;
  isReply?: boolean;
  showPageInfo?: boolean;
  hideActions?: boolean;
  showThreadNavigation?: boolean;
  suppressReplies?: boolean;
  disableNavigation?: boolean;
}

export function CommentCard({
  comment,
  onReply,
  isReply = false,
  showPageInfo = false,
  hideActions = false,
  showThreadNavigation = false,
  suppressReplies = false,
  disableNavigation = false,
}: CommentCardProps) {
  const router = useRouter();
  const [likesCount, setLikesCount] = useState(comment.likesCount);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const account = useActiveAccount();

  const commentWithParent = comment as CommentWithParent;
  const commentWithReplies = comment as CommentWithReplies;

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isLiking) return;

    setIsLiking(true);
    const newIsLiked = !isLiked;

    // Optimistic update
    setIsLiked(newIsLiked);
    setLikesCount((prev) => prev + (newIsLiked ? 1 : -1));

    const result = await toggleLike(comment.id, newIsLiked);

    if (result.success && result.newCount !== undefined) {
      setLikesCount(result.newCount);
    } else {
      // Revert on error
      setIsLiked(!newIsLiked);
      setLikesCount((prev) => prev + (newIsLiked ? -1 : 1));
    }

    setIsLiking(false);
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
  };

  const cardContent = (
    <Card
      className={`shadow-md ${disableNavigation ? "" : "cursor-pointer"} ${
        isReply ? "bg-zinc-50/80 dark:bg-zinc-900/30" : ""
      }`}
    >
      <CardContent>
        <div className="flex gap-3">
          {/* Avatar Gutter */}
          <Link
            href={`/${comment.fromAddress}`}
            className="shrink-0 hover:opacity-80 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <AccountProvider address={comment.fromAddress} client={client}>
              <ViewTransition name={`comment-avatar-${comment.id}`}>
                <AccountAvatar
                  className="h-10 w-10 rounded-full"
                  fallbackComponent={
                    <Blobbie
                      className="h-10 w-10 rounded-full"
                      address={comment.fromAddress}
                    />
                  }
                  loadingComponent={
                    <Skeleton className="h-10 w-10 rounded-full" />
                  }
                />
              </ViewTransition>
            </AccountProvider>
          </Link>

          {/* Content Area */}
          <div className="flex-1 min-w-0 flex flex-col gap-2.5">
            {/* Author info and page context */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <Link
                href={`/${comment.fromAddress}`}
                className="hover:opacity-80 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <AccountProvider address={comment.fromAddress} client={client}>
                  <div className="flex flex-col gap-0.5">
                    <AccountName
                      className="font-semibold text-sm text-zinc-900 dark:text-zinc-100"
                      fallbackComponent={
                        <AccountAddress
                          className="font-semibold text-sm text-zinc-900 dark:text-zinc-100"
                          formatFn={shortenAddress}
                        />
                      }
                      loadingComponent={
                        <Skeleton className="h-5 w-24 rounded-sm" />
                      }
                    />
                    <ViewTransition name={`comment-date-${comment.id}`}>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {formatDate(comment.createdAt)}
                      </span>
                    </ViewTransition>
                  </div>
                </AccountProvider>
              </Link>

              {/* Page context info - for latest comments feed */}
              {showPageInfo && (
                <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                  {commentWithParent.parentComment && (
                    <>
                      <span>Replying to </span>
                      <Link
                        href={`/${commentWithParent.parentComment.fromAddress}`}
                        className="font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <AccountProvider
                          address={commentWithParent.parentComment.fromAddress}
                          client={client}
                        >
                          <AccountAvatar
                            className="h-4 w-4 rounded-full"
                            loadingComponent={
                              <Skeleton className="h-4 w-4 rounded-full" />
                            }
                            fallbackComponent={
                              <Blobbie
                                className="h-4 w-4 rounded-full"
                                address={
                                  commentWithParent.parentComment.fromAddress
                                }
                              />
                            }
                          />
                          <AccountName
                            fallbackComponent={
                              <AccountAddress formatFn={shortenAddress} />
                            }
                            loadingComponent={
                              <Skeleton className="h-4 w-12 rounded-sm" />
                            }
                          />
                        </AccountProvider>
                      </Link>
                    </>
                  )}
                  <span>on</span>
                  <Link
                    href={`/${comment.ownerAddress}`}
                    className="font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-1">
                      <AccountProvider
                        address={comment.ownerAddress}
                        client={client}
                      >
                        <AccountAvatar
                          className="h-4 w-4 rounded-full"
                          loadingComponent={
                            <Skeleton className="h-4 w-4 rounded-full" />
                          }
                          fallbackComponent={
                            <Blobbie
                              className="h-4 w-4 rounded-full"
                              address={comment.ownerAddress}
                            />
                          }
                        />
                        <AccountName
                          fallbackComponent={
                            <AccountAddress formatFn={shortenAddress} />
                          }
                          loadingComponent={
                            <Skeleton className="h-4 w-12 rounded-sm" />
                          }
                        />
                      </AccountProvider>
                    </div>
                  </Link>
                  <span className="-ml-1">&apos;s wall</span>
                </div>
              )}
            </div>

            {/* Comment text */}
            <ViewTransition name={`comment-text-${comment.id}`}>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap wrap-break-word leading-relaxed">
                {comment.text}
              </p>
            </ViewTransition>

            {/* Actions or static likes display */}
            {!hideActions ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  disabled={isLiking || !account}
                  className="h-8 px-3 gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      isLiked
                        ? "fill-red-500 text-red-500"
                        : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  />
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    {likesCount > 0 ? likesCount : "Like"}
                  </span>
                </Button>

                {showThreadNavigation && !isReply && (
                  <Link
                    href={`/${comment.ownerAddress}/${comment.id}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
                    >
                      <MessageCircle className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        {commentWithReplies.replies?.length
                          ? `${commentWithReplies.replies?.length} ${commentWithReplies.replies?.length === 1 ? "Reply" : "Replies"}`
                          : "Reply"}
                      </span>
                    </Button>
                  </Link>
                )}

                {onReply && !showThreadNavigation && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onReply(comment.id);
                    }}
                    disabled={!account}
                    className="h-8 px-3 gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
                  >
                    <MessageCircle className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Reply
                    </span>
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2">
                  <Heart className="h-4 w-4 text-zinc-400" />
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {`${comment.likesCount} ${
                      comment.likesCount === 1 ? "Like" : "Likes"
                    }`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={isReply ? "ml-[52px]" : ""}>
      <ViewTransition name={`comment-card-${comment.id}`}>
        {disableNavigation ? (
          cardContent
        ) : (
          // biome-ignore lint/a11y/noStaticElementInteractions: we want to use a div as a button
          // biome-ignore lint/a11y/useKeyWithClickEvents: we want to use a div as a button
          <div
            onClick={(e) => {
              e.preventDefault();
              router.push(`/${comment.ownerAddress}/${comment.id}`);
            }}
            className="block transition-opacity hover:opacity-90 w-full text-left"
          >
            {cardContent}
          </div>
        )}
      </ViewTransition>

      {/* Render replies - only when not using thread navigation */}
      {!showPageInfo &&
        !showThreadNavigation &&
        !suppressReplies &&
        commentWithReplies.replies &&
        commentWithReplies.replies.length > 0 && (
          <ViewTransition update="none">
            <div className="space-y-3 mt-3 replies-expand-animation">
              {commentWithReplies.replies.map((reply) => (
                <CommentCard
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  isReply={true}
                />
              ))}
            </div>
          </ViewTransition>
        )}
    </div>
  );
}
