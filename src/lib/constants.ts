import { arbitrum, base, polygon } from "thirdweb/chains";
import type { TokenInfo } from "thirdweb/react";

export const chain = arbitrum;
export const tokenAddress = "0xf01E52B0BAC3E147f6CAf956a64586865A0aA928";
export const tokenInfo: TokenInfo = {
  address: tokenAddress,
  name: "x402.chat",
  symbol: "CHAT",
  icon: "https://x402.chat/icon.png",
};

// USDC token addresses for each supported payment chain
export const USDC_ADDRESSES: Record<number, string> = {
  [arbitrum.id]: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  [base.id]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  [polygon.id]: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
};
