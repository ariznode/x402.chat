import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentCard } from "@/components/comment-card";
import { CommentForm } from "@/components/comment-form";
import { Button } from "@/components/ui/button";
import { getCommentThread } from "@/lib/queries/comments";

interface ThreadViewProps {
  params: Promise<{ owner_address: string; thread_id: string }>;
}

export default async function ThreadView(props: ThreadViewProps) {
  const params = await props.params;

  // Fetch the thread
  const thread = await getCommentThread(params.thread_id);

  // If thread not found, show 404
  if (!thread) {
    notFound();
  }

  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <div className="space-y-4">
        {/* Back navigation */}
        <Link href={`/${params.owner_address}`}>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Profile
          </Button>
        </Link>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 px-1">
          Conversation
        </h2>

        {/* Top-level comment - Parent post */}
        <CommentCard
          comment={thread}
          hideActions={false}
          suppressReplies={true}
        />

        {/* Replies section */}
        {thread.replies && thread.replies.length > 0 && (
          <div className="space-y-4 ml-12">
            <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 px-1">
              Replies ({thread.replies.length})
            </h3>
            <div className="space-y-3">
              {thread.replies.map((reply) => (
                <CommentCard
                  key={reply.id}
                  comment={reply}
                  hideActions={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Reply form */}
        <div className="ml-12">
          <CommentForm
            ownerAddress={thread.ownerAddress}
            parentCommentId={thread.id}
            placeholder="Write a reply..."
          />
        </div>
      </div>
    </main>
  );
}
