import { type NextRequest, NextResponse } from "next/server";
import { Engine, getContract, isAddress, toWei } from "thirdweb";
import { arbitrum, base, polygon } from "thirdweb/chains";
import { transfer } from "thirdweb/extensions/erc20";
import * as x402 from "thirdweb/x402";
import { chain, tokenAddress } from "@/lib/constants";
import { serverClient } from "@/lib/thirdweb.server";

// Map of supported payment chain IDs to chain objects
const SUPPORTED_CHAINS = {
  [arbitrum.id]: arbitrum,
  [base.id]: base,
  [polygon.id]: polygon,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, paymentChainId } = body;

    // Validate amount
    if (typeof amount !== "number" || amount < 1 || amount > 1000) {
      return NextResponse.json(
        { error: "Amount must be between 1 and 1000" },
        { status: 400 },
      );
    }

    // Validate payment chain
    if (!paymentChainId || !SUPPORTED_CHAINS[paymentChainId]) {
      return NextResponse.json(
        { error: "Invalid or unsupported payment chain" },
        { status: 400 },
      );
    }

    const paymentChain = SUPPORTED_CHAINS[paymentChainId];

    // Get the server wallet address from environment
    const serverWalletAddress = process.env.SERVER_WALLET_ADDRESS;
    if (!serverWalletAddress) {
      console.error("SERVER_WALLET_ADDRESS not configured");
      return NextResponse.json(
        { error: "Server wallet not configured" },
        { status: 500 },
      );
    }

    // Create facilitator
    const facilitator = x402.facilitator({
      client: serverClient,
      serverWalletAddress,
    });

    // Get payment data from headers
    const paymentData = req.headers.get("x-payment");

    // Calculate price in USD (0.001 per token)
    const priceInUSD = (amount * 0.001).toString();

    // Settle payment
    const result = await x402.settlePayment({
      resourceUrl: "https://x402.chat/api/mint",
      routeConfig: {
        resource: "https://x402.chat/api/mint",
        discoverable: true,
        description: "Mint CHAT tokens by paying with USDC.",
        inputSchema: {
          bodyFields: {
            amount: {
              type: "number",
              description: "Number of CHAT tokens to mint (1-1000)",
              required: true,
              minimum: 1,
              maximum: 1000,
            },
            paymentChainId: {
              type: "number",
              description: "Chain ID to pay on (Arbitrum, Base, or Polygon)",
              required: true,
            },
          },
        },
        outputSchema: {
          transactionId: {
            type: "string",
            description: "The transaction ID for the mint operation",
            required: true,
          },
        },
      },
      method: "POST",
      paymentData,
      payTo: serverWalletAddress,
      network: paymentChain,
      price: priceInUSD,
      facilitator,
    });

    // If payment is required, return the payment response
    if (result.status !== 200) {
      return NextResponse.json(result.responseBody, {
        status: result.status,
        headers: result.responseHeaders,
      });
    }

    // Extract payer address from payment receipt
    const payerAddress = result.paymentReceipt.payer;
    if (!payerAddress || !isAddress(payerAddress)) {
      return NextResponse.json(
        { error: "No valid payer address found in payment receipt" },
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

    // Create the transfer transaction for the purchased CHAT tokens
    const transaction = transfer({
      contract,
      to: payerAddress,
      amountWei: toWei(amount.toString()),
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
        message: `Successfully minted ${amount} CHAT tokens`,
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
