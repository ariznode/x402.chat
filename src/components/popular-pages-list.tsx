import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { AccountAddress, AccountAvatar, AccountProvider } from "thirdweb/react";
import { shortenAddress } from "thirdweb/utils";
import { Card, CardContent } from "@/components/ui/card";
import type { PopularPage } from "@/lib/queries/pages";
import { client } from "@/lib/thirdweb";

interface PopularPagesListProps {
  pages: PopularPage[];
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

export function PopularPagesList({ pages }: PopularPagesListProps) {
  if (pages.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500 dark:text-zinc-400">
          No pages yet. Be the first to create one!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {pages.map((page) => (
        <Link
          key={page.ownerAddress}
          href={`/${page.ownerAddress}`}
          className="group"
        >
          <Card className="border-zinc-200 transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:hover:border-zinc-700">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <AccountProvider address={page.ownerAddress} client={client}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AccountAvatar className="h-6 w-6" />
                      <AccountAddress
                        formatFn={shortenAddress}
                        className="text-sm font-mono text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <MessageSquare className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                  </div>
                </AccountProvider>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {page.commentCount} comment
                    {page.commentCount !== 1 ? "s" : ""}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-500">
                    {formatDate(page.latestCommentAt)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
