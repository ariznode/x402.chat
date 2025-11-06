import { notFound } from "next/navigation";
import { BackToProfileButton } from "@/components/back-to-profile-button";
import { CommentCard } from "@/components/comment-card";
import { CommentForm } from "@/components/comment-form";
import { getCommentCount, getCommentThread } from "@/lib/queries/comments";

interface ThreadViewProps {
  params: Promise<{ owner_address: string; thread_id: string }>;
}

export default async function ThreadView(props: ThreadViewProps) {
  const params = await props.params;

  // Fetch the thread and comment count
  const [thread, commentCount] = await Promise.all([
    getCommentThread(params.thread_id),
    getCommentCount(params.owner_address),
  ]);

  // If thread not found, show 404
  if (!thread) {
    notFound();
  }

  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <div className="space-y-4">
        {/* Back navigation */}
        <BackToProfileButton ownerAddress={params.owner_address} />
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 px-1">
          Conversation
        </h2>

        {/* Top-level comment - Parent post */}
        <CommentCard
          comment={thread}
          hideActions={false}
          suppressReplies={true}
          disableNavigation={true}
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
                  disableNavigation={true}
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
            existingCommentCount={commentCount}
          />
        </div>
      </div>
    </main>
  );
}
