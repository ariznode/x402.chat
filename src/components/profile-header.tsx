"use client";

import {
  AccountAddress,
  AccountAvatar,
  AccountName,
  AccountProvider,
  Blobbie,
} from "thirdweb/react";
import { shortenAddress } from "thirdweb/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { client } from "@/lib/thirdweb.client";

interface ProfileHeaderProps {
  ownerAddress: string;
}

export function ProfileHeader({ ownerAddress }: ProfileHeaderProps) {
  return (
    <Card className="mb-6 shadow-md">
      <CardContent>
        <div className="flex items-center gap-6">
          <AccountProvider address={ownerAddress} client={client}>
            <AccountAvatar
              className="h-24 w-24 rounded-xl"
              fallbackComponent={
                <Blobbie
                  className="h-24 w-24 rounded-xl"
                  address={ownerAddress}
                />
              }
              loadingComponent={<Skeleton className="h-24 w-24 rounded-xl" />}
            />
            <div className="flex flex-col gap-2">
              <AccountName
                className="font-bold text-3xl text-zinc-900 dark:text-zinc-100"
                fallbackComponent={
                  <AccountAddress
                    className="font-bold text-3xl text-zinc-900 dark:text-zinc-100"
                    formatFn={shortenAddress}
                  />
                }
                loadingComponent={<Skeleton className="h-9 w-48 rounded-lg" />}
              />
              <AccountAddress
                className="text-sm text-zinc-500 dark:text-zinc-400"
                formatFn={shortenAddress}
              />
            </div>
          </AccountProvider>
        </div>
      </CardContent>
    </Card>
  );
}
