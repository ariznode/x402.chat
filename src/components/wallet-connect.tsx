"use client";

import { ConnectButton } from "thirdweb/react";
import { client } from "@/lib/thirdweb";

export function WalletConnect() {
  return (
    <ConnectButton
      client={client}
      connectButton={{
        label: "Connect Wallet",
      }}
    />
  );
}
