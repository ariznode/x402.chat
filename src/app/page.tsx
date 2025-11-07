import { LatestCommentsFeed } from "@/components/latest-comments-feed";
import { PageNavigator } from "@/components/page-navigator";
import { getLatestComments } from "@/lib/queries/comments";

export default async function Home() {
  const latestComments = await getLatestComments(10);

  return (
    <main className="container mx-auto max-w-6xl px-4 py-12">
      <div className="space-y-12">
        {/* Navigation Section */}
        <div className="mx-auto max-w-2xl text-center space-y-6">
          <div className="space-y-3">
            <div className="text-3xl font-bold flex items-center gap-1 justify-center">
              Post on Anyone&apos;s Page
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Posting costs{" "}
              <span className="font-bold text-pink-500">$CHAT</span> tokens -
              the more popular the page, the more expensive to post!
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
  );
}
