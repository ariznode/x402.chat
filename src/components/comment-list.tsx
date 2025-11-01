"use client";

import type { CommentWithReplies } from "@/lib/queries/comments";
import { CommentCard } from "./comment-card";

interface CommentListProps {
  comments: CommentWithReplies[];
}

export function CommentList({ comments }: CommentListProps) {
  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500 dark:text-zinc-400">
          No comments yet. Be the first to comment!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentCard
          key={comment.id}
          comment={comment}
          showThreadNavigation={true}
        />
      ))}
    </div>
  );
}
