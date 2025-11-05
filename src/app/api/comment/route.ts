import { count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAddress, isAddress } from "thirdweb";
import { base } from "thirdweb/chains";
import * as x402 from "thirdweb/x402";
import z from "zod";
import { db } from "@/db/client";
import { comments } from "@/db/schema";
import { serverClient } from "@/lib/server-client";

const BASE_UNIT_PRICE = 0.01;

const addressSchema = z
  .string()
  .refine((val) => isAddress(val), {
    message: "Invalid address",
  })
  .transform((val) => getAddress(val));

const commentSchema = z.object({
  ownerAddress: addressSchema,
  fromAddress: addressSchema,
  text: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length > 0 && val.length <= 1000, {
      message: "Comment must be between 1 and 1000 characters",
    }),
});

export async function POST(request: Request) {
  const data = await request.json();

  const validatedData = commentSchema.safeParse(data);
  if (!validatedData.success) {
    return Response.json(
      { error: validatedData.error.message },
      { status: 400 },
    );
  }

  const facilitator = x402.facilitator({
    client: serverClient,
    serverWalletAddress: process.env.SERVER_WALLET_ADDRESS || "",
  });

  const paymentData = request.headers.get("x-payment");

  // Count existing comments for this owner
  const [{ count: existingCommentsCount }] = await db
    .select({ count: count() })
    .from(comments)
    .where(eq(comments.ownerAddress, validatedData.data.ownerAddress));

  // Calculate dynamic price based on existing comments
  const dynamicPrice = `$${(existingCommentsCount * BASE_UNIT_PRICE).toFixed(2)}`;

  const result = await x402.settlePayment({
    resourceUrl: "https://x402.chat/api/comment",
    routeConfig: {
      resource: "https://x402.chat/api/comment",
      discoverable: true,
      description: "Leave a comment on a wallet.",
      inputSchema: {
        bodyFields: {
          ownerAddress: {
            type: "string",
            description: "The wallet address of the owner of the page.",
            required: true,
          },
          fromAddress: {
            type: "string",
            description: "The wallet address of the commenter.",
            required: true,
          },
          text: {
            type: "string",
            description: "The text of the comment.",
            required: true,
            maxLength: 1000,
          },
        },
      },
      outputSchema: {
        commentId: {
          type: "string",
          description: "The ID of the comment.",
          required: true,
        },
      },
    },
    method: "POST",
    paymentData: paymentData,
    payTo: validatedData.data.ownerAddress,
    network: base,
    price: dynamicPrice,
    facilitator: facilitator,
  });
  if (result.status !== 200) {
    // Payment required
    return Response.json(result.responseBody, {
      status: result.status,
      headers: result.responseHeaders,
    });
  }

  // actually create the comment and then revalidate the pages
  const insertResult = await db
    .insert(comments)
    .values({
      ownerAddress: validatedData.data.ownerAddress,
      fromAddress: validatedData.data.fromAddress,
      text: validatedData.data.text,
    })
    .returning();

  if (!insertResult[0]) {
    return Response.json(
      { error: "Failed to create comment" },
      { status: 500 },
    );
  }

  // revalidate the pages
  revalidatePath(`/${validatedData.data.ownerAddress}`);
  revalidatePath("/");

  return Response.json(
    { success: true, commentId: insertResult[0].id },
    { status: 200 },
  );
}
