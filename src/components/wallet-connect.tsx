"use client";

import { useTheme } from "next-themes";
import { ConnectButton } from "thirdweb/react";
import { client, wallets } from "@/lib/thirdweb";

export function WalletConnect() {
  const theme = useTheme();
  const themeMode = theme.theme === "dark" ? "dark" : "light";
  return (
    <ConnectButton
      client={client}
      theme={themeMode}
      wallets={wallets}
      connectModal={{
        title: "x402.chat",
        titleIcon: "/icon.png",
      }}
    />
  );
}
