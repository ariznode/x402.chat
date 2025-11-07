import { type NextRequest, NextResponse } from "next/server";
import { Engine, getContract, toWei } from "thirdweb";
import { verifySignature } from "thirdweb/auth";
import { transfer } from "thirdweb/extensions/erc20";
import { getWalletBalance } from "thirdweb/wallets";
import { chain, tokenAddress } from "@/lib/constants";
import { serverClient } from "@/lib/thirdweb.server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { signature, address } = body;

    if (!signature || !address) {
      return NextResponse.json(
        { error: "Missing signature or address" },
        { status: 400 },
      );
    }

    // Verify the signature
    const isValid = await verifySignature({
      message: "minting 10 chat tokens",
      signature,
      address,
      client: serverClient,
      chain,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Get the server wallet address from environment
    const serverWalletAddress = process.env.SERVER_WALLET_ADDRESS;
    if (!serverWalletAddress) {
      console.error("SERVER_WALLET_ADDRESS not configured");
      return NextResponse.json(
        { error: "Server wallet not configured" },
        { status: 500 },
      );
    }

    // Get the token contract
    const contract = getContract({
      client: serverClient,
      chain,
      address: tokenAddress,
    });

    // Create the server wallet
    const wallet = Engine.serverWallet({
      client: serverClient,
      address: serverWalletAddress,
    });

    // Create the transfer transaction for 10 CHAT tokens
    const transaction = transfer({
      contract,
      to: address,
      amountWei: toWei("10"),
    });

    // Enqueue the transaction
    const { transactionId } = await wallet.enqueueTransaction({
      transaction,
      //   simulate: true, TODO - reenable after upgrading sdk
    });

    return NextResponse.json(
      {
        success: true,
        transactionId,
        message: "Successfully minted 10 CHAT tokens",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error minting tokens:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
