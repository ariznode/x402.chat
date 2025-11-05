import { CommentForm } from "@/components/comment-form";
import { CommentList } from "@/components/comment-list";
import { ProfileHeader } from "@/components/profile-header";
import { getCommentCount, getComments } from "@/lib/queries/comments";

interface PageViewProps {
  params: Promise<{ owner_address: string }>;
  searchParams: Promise<{ page?: string; limit?: string }>;
}

export default async function PageView(props: PageViewProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  // Resolve ENS name or address to address
  const ownerIdentifier = params.owner_address;

  const page = Number.parseInt(searchParams.page || "1", 10);
  const limit = Number.parseInt(searchParams.limit || "30", 10);
  const offset = (page - 1) * limit;

  const [comments, commentCount] = await Promise.all([
    getComments(ownerIdentifier, limit, offset),
    getCommentCount(ownerIdentifier),
  ]);

  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <div className="space-y-4">
        {/* Profile Header */}
        <ProfileHeader ownerAddress={ownerIdentifier} />

        {/* Comment Form */}
        <div>
          <CommentForm
            ownerAddress={ownerIdentifier}
            existingCommentCount={commentCount}
          />
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length > 0 && (
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 px-1">
              Posts
            </h2>
          )}
          <CommentList comments={comments} />
        </div>
      </div>
    </main>
  );
}
