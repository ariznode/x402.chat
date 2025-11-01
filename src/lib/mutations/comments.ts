"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { comments } from "@/db/schema";

export async function toggleLike(
  commentId: string,
  increment: boolean,
): Promise<{ success: boolean; error?: string; newCount?: number }> {
  try {
    // First get the current likes count
    const result = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1);

    if (!result[0]) {
      return { success: false, error: "Comment not found" };
    }

    const newCount = Math.max(0, result[0].likesCount + (increment ? 1 : -1));

    const updated = await db
      .update(comments)
      .set({
        likesCount: newCount,
        updatedAt: new Date(),
      })
      .where(eq(comments.id, commentId))
      .returning();

    if (!updated[0]) {
      return { success: false, error: "Failed to update like" };
    }

    const comment = result[0];
    // Revalidate the specific page to show updated like count
    revalidatePath(`/${comment.ownerAddress.toLowerCase()}`);

    return { success: true, newCount: updated[0].likesCount };
  } catch (error) {
    console.error("Error toggling like:", error);
    return { success: false, error: "Failed to update like" };
  }
}
