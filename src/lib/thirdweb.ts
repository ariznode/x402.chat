"use client";

import { createThirdwebClient } from "thirdweb";
import { base, mainnet, polygon } from "thirdweb/chains";
import { createWallet, inAppWallet } from "thirdweb/wallets";

export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
});

export const supportedChains = [mainnet, polygon, base];

export const wallets = [
  inAppWallet({
    auth: {
      options: ["email", "passkey"],
    },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("com.okex.wallet"),
  createWallet("io.zerion.wallet"),
  createWallet("com.trustwallet.app"),
];
