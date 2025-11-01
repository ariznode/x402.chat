import { LatestCommentsFeed } from "@/components/latest-comments-feed";
import { Logo } from "@/components/logo";
import { PageNavigator } from "@/components/page-navigator";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletConnect } from "@/components/wallet-connect";
import { getLatestComments } from "@/lib/queries/comments";

export default async function Home() {
  const latestComments = await getLatestComments(10);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex flex-col gap-1">
            <Logo withText />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Decentralized social comments
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-6xl px-4 py-12">
        <div className="space-y-12">
          {/* Navigation Section */}
          <div className="mx-auto max-w-2xl text-center space-y-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                Find a Wall to Post On
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Enter any wallet address or ENS name to view or post on their
                wall
              </p>
            </div>
            <PageNavigator />
          </div>

          {/* Latest Comments Section */}
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                Latest Posts
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Recent activity from across x402.chat
              </p>
            </div>
            <LatestCommentsFeed comments={latestComments} />
          </div>
        </div>
      </main>
    </div>
  );
}
