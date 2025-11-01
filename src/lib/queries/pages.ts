"use server";

import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { comments } from "@/db/schema";

export interface PopularPage {
  ownerAddress: string;
  commentCount: number;
  latestCommentAt: Date;
}

export async function getPopularPages(limit = 10): Promise<PopularPage[]> {
  try {
    const result = await db
      .select({
        ownerAddress: comments.ownerAddress,
        commentCount: sql<number>`count(*)::int`,
        latestCommentAt: sql<Date>`max(${comments.createdAt})`,
      })
      .from(comments)
      .groupBy(comments.ownerAddress)
      .orderBy(sql`count(*) DESC`)
      .limit(limit);

    return result;
  } catch (error) {
    console.error("Error fetching popular pages:", error);
    return [];
  }
}
