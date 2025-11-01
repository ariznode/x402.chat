"use client";

import { createThirdwebClient } from "thirdweb";
import { base, mainnet, polygon } from "thirdweb/chains";

export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
});

export const supportedChains = [mainnet, polygon, base];
