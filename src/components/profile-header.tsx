"use client";

import { UserIcon } from "lucide-react";
import {
  AccountAddress,
  AccountAvatar,
  AccountName,
  AccountProvider,
} from "thirdweb/react";
import { shortenAddress } from "thirdweb/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { client } from "@/lib/thirdweb";

interface ProfileHeaderProps {
  ownerAddress: string;
}

export function ProfileHeader({ ownerAddress }: ProfileHeaderProps) {
  return (
    <Card className="mb-6 shadow-md">
      <CardContent className="py-8">
        <div className="flex items-center gap-6">
          <AccountProvider address={ownerAddress} client={client}>
            <AccountAvatar
              className="h-24 w-24 rounded-xl"
              fallbackComponent={
                <div className="flex items-center justify-center h-24 w-24 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                  <UserIcon className="h-12 w-12 text-zinc-400" />
                </div>
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
            </div>
          </AccountProvider>
        </div>
      </CardContent>
    </Card>
  );
}
