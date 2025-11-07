import { config } from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables
config({ path: join(__dirname, "..", ".env.local") });

// Configuration
const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY;
const SERVER_WALLET_ADDRESS = process.env.SERVER_WALLET_ADDRESS;
const TOKEN_ADDRESS = "0xf01E52B0BAC3E147f6CAf956a64586865A0aA928"; // CHAT token on Arbitrum
const CHAIN_ID = 42161; // Arbitrum
const TOKENS_PER_ADDRESS = "10000000000000000000"; // 10 tokens (assuming 18 decimals)
const BATCH_SIZE = 100;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

interface Recipient {
  address: string;
  quantity: string;
}

interface AirdropResponse {
  result: {
    transactionIds: string[];
  };
}

async function sendBatch(
  recipients: Recipient[],
  batchNumber: number,
  totalBatches: number,
) {
  const url = "https://api.thirdweb.com/v1/wallets/send";

  const payload = {
    from: SERVER_WALLET_ADDRESS,
    chainId: CHAIN_ID,
    tokenAddress: TOKEN_ADDRESS,
    recipients: recipients,
  };

  console.log(`\n📦 Batch ${batchNumber}/${totalBatches}`);
  console.log(`   Recipients: ${recipients.length}`);
  console.log(`   Total tokens: ${recipients.length * 10} CHAT`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-secret-key": THIRDWEB_SECRET_KEY || "",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as AirdropResponse;
    console.log(
      `   ✅ Success! Transaction IDs: ${data.result.transactionIds.join(", ")}`,
    );
    return data.result.transactionIds;
  } catch (error) {
    console.error(`   ❌ Error:`, error);
    throw error;
  }
}

async function main() {
  // Validation
  if (!THIRDWEB_SECRET_KEY) {
    throw new Error("THIRDWEB_SECRET_KEY environment variable is required");
  }
  if (!SERVER_WALLET_ADDRESS) {
    throw new Error("SERVER_WALLET_ADDRESS environment variable is required");
  }

  console.log("🚀 CHAT Token Airdrop Script");
  console.log("=".repeat(60));
  console.log(`Token: ${TOKEN_ADDRESS}`);
  console.log(`Chain: Arbitrum (${CHAIN_ID})`);
  console.log(`Amount per address: 10 CHAT`);
  console.log(`From wallet: ${SERVER_WALLET_ADDRESS}`);
  console.log("=".repeat(60));

  // Read the CSV file
  const csvPath = join(__dirname, "addresses.csv");
  const csvContent = readFileSync(csvPath, "utf-8");
  const lines = csvContent.trim().split("\n");

  // Skip header and parse addresses
  const addresses: string[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",");
    if (parts.length >= 2) {
      const resolvedAddress = parts[1].trim();
      // Filter out zero address and invalid addresses
      if (
        resolvedAddress &&
        resolvedAddress !== ZERO_ADDRESS &&
        resolvedAddress.startsWith("0x") &&
        resolvedAddress.length === 42
      ) {
        addresses.push(resolvedAddress);
      }
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Total addresses in CSV: ${lines.length - 1}`);
  console.log(`   Valid addresses for airdrop: ${addresses.length}`);
  console.log(`   Filtered out: ${lines.length - 1 - addresses.length}`);
  console.log(`   Total CHAT to distribute: ${addresses.length * 10}`);

  if (addresses.length === 0) {
    console.log("\n⚠️  No valid addresses found. Exiting.");
    return;
  }

  // Split into batches
  const batches: Recipient[][] = [];
  for (let i = 0; i < addresses.length; i += BATCH_SIZE) {
    const batchAddresses = addresses.slice(i, i + BATCH_SIZE);
    const recipients: Recipient[] = batchAddresses.map((address) => ({
      address,
      quantity: TOKENS_PER_ADDRESS,
    }));
    batches.push(recipients);
  }

  console.log(
    `\n📦 Will send in ${batches.length} batch(es) of up to ${BATCH_SIZE} addresses`,
  );
  console.log("\n⏳ Starting airdrop...");

  const transactionIds: string[] = [];

  // Send each batch
  for (let i = 0; i < batches.length; i++) {
    try {
      const txIds = await sendBatch(batches[i], i + 1, batches.length);
      transactionIds.push(...txIds);

      // Add delay between batches to avoid rate limiting
      if (i < batches.length - 1) {
        console.log("   ⏱️  Waiting 2 seconds before next batch...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`\n❌ Failed on batch ${i + 1}. Stopping.`);
      console.error("Error:", error);
      process.exit(1);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Airdrop Complete!");
  console.log("=".repeat(60));
  console.log(`Total batches sent: ${batches.length}`);
  console.log(`Total addresses: ${addresses.length}`);
  console.log(`Total CHAT distributed: ${addresses.length * 10}`);
  console.log("\n📋 Transaction IDs:");
  transactionIds.forEach((txId, index) => {
    console.log(`   Batch ${index + 1}: ${txId}`);
  });
  console.log("=".repeat(60));
}

main().catch((error) => {
  console.error("\n💥 Fatal error:", error);
  process.exit(1);
});
