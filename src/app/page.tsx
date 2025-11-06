import { LatestCommentsFeed } from "@/components/latest-comments-feed";
import { PageNavigator } from "@/components/page-navigator";
import { getLatestComments } from "@/lib/queries/comments";
import { PageHeader } from "../components/page-header";

export default async function Home() {
  const latestComments = await getLatestComments(10);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <PageHeader />

      {/* Main Content */}
      <main className="container mx-auto max-w-6xl px-4 py-12">
        <div className="space-y-12">
          {/* Navigation Section */}
          <div className="mx-auto max-w-2xl text-center space-y-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                Post on Anyone&apos;s Wall
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
