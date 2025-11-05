"use server";

import { and, asc, count, desc, eq, isNull } from "drizzle-orm";
import { getAddress } from "thirdweb";
import { db } from "@/db/client";
import { type Comment, comments } from "@/db/schema";

export interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[];
}

export async function getComments(
  ownerAddress?: string,
  limit = 30,
  offset = 0,
) {
  // checkSummed address
  const address = ownerAddress ? getAddress(ownerAddress) : undefined;
  try {
    // Build where conditions
    const whereConditions = address
      ? and(
          isNull(comments.parentCommentId),
          eq(comments.ownerAddress, address),
        )
      : isNull(comments.parentCommentId);

    const topLevelComments: Comment[] = await db
      .select()
      .from(comments)
      .where(whereConditions)
      .orderBy(desc(comments.createdAt))
      .limit(limit)
      .offset(offset);

    // Fetch replies for each comment
    return await Promise.all(
      topLevelComments.map(async (comment) => {
        const replies = await getCommentReplies(comment.id);
        return {
          ...comment,
          replies: replies,
        };
      }),
    );
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw new Error("Failed to fetch comments");
  }
}

export async function getCommentReplies(parentId: string): Promise<Comment[]> {
  try {
    const replies = await db
      .select()
      .from(comments)
      .where(eq(comments.parentCommentId, parentId))
      .orderBy(asc(comments.createdAt));

    return replies;
  } catch (error) {
    console.error("Error fetching replies:", error);
    return [];
  }
}

export async function getCommentById(id: string): Promise<Comment | null> {
  try {
    const result = await db
      .select()
      .from(comments)
      .where(eq(comments.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Error fetching comment:", error);
    return null;
  }
}

export interface CommentWithParent extends Comment {
  parentComment?: Comment | null;
}

export async function getLatestComments(
  limit = 10,
): Promise<CommentWithParent[]> {
  try {
    // Fetch all comments (including replies)
    const allComments = await db
      .select()
      .from(comments)
      .orderBy(desc(comments.createdAt))
      .limit(limit);

    // Fetch parent comments for replies
    const commentsWithParents = await Promise.all(
      allComments.map(async (comment) => {
        if (comment.parentCommentId) {
          const parentComment = await getCommentById(comment.parentCommentId);
          return {
            ...comment,
            parentComment,
          };
        }
        return {
          ...comment,
          parentComment: null,
        };
      }),
    );

    return commentsWithParents;
  } catch (error) {
    console.error("Error fetching latest comments:", error);
    throw new Error("Failed to fetch latest comments");
  }
}

export async function getCommentThread(
  threadId: string,
): Promise<CommentWithReplies | null> {
  try {
    // Fetch the comment
    const comment = await getCommentById(threadId);
    if (!comment) {
      return null;
    }

    // If this is a reply, fetch the parent thread instead
    if (comment.parentCommentId) {
      return getCommentThread(comment.parentCommentId);
    }

    // Fetch all replies for the top-level comment
    const replies = await getCommentReplies(comment.id);

    return {
      ...comment,
      replies,
    };
  } catch (error) {
    console.error("Error fetching comment thread:", error);
    return null;
  }
}

export async function getCommentCount(ownerAddress: string): Promise<number> {
  try {
    const address = getAddress(ownerAddress);
    const [{ count: commentCount }] = await db
      .select({ count: count() })
      .from(comments)
      .where(eq(comments.ownerAddress, address));

    return commentCount;
  } catch (error) {
    console.error("Error fetching comment count:", error);
    return 0;
  }
}
