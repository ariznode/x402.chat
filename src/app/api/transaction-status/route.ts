import { type NextRequest, NextResponse } from "next/server";
import { Engine } from "thirdweb";
import { serverClient } from "@/lib/thirdweb.server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get("transactionId");

    if (!transactionId) {
      return NextResponse.json(
        { error: "Missing transactionId" },
        { status: 400 },
      );
    }

    // Get transaction status from Engine
    const executionResult = await Engine.getTransactionStatus({
      client: serverClient,
      transactionId,
    });

    return NextResponse.json(
      {
        status: executionResult.status,
        transactionId,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching transaction status:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
