"use client";

import { useTheme } from "next-themes";
import {
  AccountAvatar,
  AccountProvider,
  Blobbie,
  ConnectButton,
  useActiveAccount,
} from "thirdweb/react";
import { chain, tokenInfo } from "@/lib/constants";
import { client, wallets } from "@/lib/thirdweb.client";
import { Skeleton } from "./ui/skeleton";

export function WalletConnect() {
  const theme = useTheme();
  const themeMode = theme.theme === "dark" ? "dark" : "light";
  const account = useActiveAccount();
  return (
    <ConnectButton
      client={client}
      theme={themeMode}
      wallets={wallets}
      connectModal={{
        title: "x402.chat",
        titleIcon: "/icon.png",
      }}
      supportedTokens={{
        [chain.id]: [tokenInfo],
      }}
      chain={chain}
      detailsButton={{
        displayBalanceToken: {
          [chain.id]: tokenInfo.address,
        },
        render() {
          if (!account?.address) {
            return <p>No wallet connected</p>;
          }
          return (
            <AccountProvider address={account.address} client={client}>
              <AccountAvatar
                className="h-10 w-10 rounded-full shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                fallbackComponent={
                  <Blobbie
                    className="h-10 w-10 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                    address={account.address}
                  />
                }
                loadingComponent={
                  <Skeleton className="h-10 w-10 rounded-full" />
                }
              />
            </AccountProvider>
          );
        },
      }}
      detailsModal={{
        assetTabs: ["token"],
        hideBuyFunds: true,
        hideReceiveFunds: true,
      }}
    />
  );
}
