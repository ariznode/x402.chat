import { arbitrum } from "thirdweb/chains";
import type { TokenInfo } from "thirdweb/react";

export const chain = arbitrum;
export const tokenAddress = "0xf01E52B0BAC3E147f6CAf956a64586865A0aA928";
export const tokenInfo: TokenInfo = {
  address: tokenAddress,
  name: "x402.chat",
  symbol: "CHAT",
  icon: "https://x402.chat/icon.png",
};
