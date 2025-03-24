import { PostData, PostDataSimple, UserData } from "@/types/post";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import { formatRelativeDate } from "@/lib/utils";
import { useSession } from "next-auth/react";
import PostMoreButton from "./PostMoreButton";
import Linkify from "@/components/Linkify";
import LinkWithToolTipOption from "@/components/LinkWithToolTipOption";
interface PostProps {
  post: PostData | PostDataSimple;
  withTooltip?: boolean;
}

export default function Post({ post, withTooltip = true }: PostProps) {
  const { data: session } = useSession();
  const isAuthor = session!.user.id === post.user.id;

  return (
    <article className="group/post space-y-3 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex justify-between">
        <div className="flex flex-wrap gap-3">
          <LinkWithToolTipOption
            href={`/users/${post.user.name}`}
            tooltip={withTooltip}
            user={withTooltip ? (post.user as UserData) : null}
          >
            <UserAvatar avatarUrl={post.user.image} />
          </LinkWithToolTipOption>
          <div>
            <LinkWithToolTipOption
              href={`/users/${post.user.name}`}
              className="block font-medium hover:underline"
              tooltip={withTooltip}
              user={withTooltip ? (post.user as UserData) : null}
            >
              {post.user.displayName}
            </LinkWithToolTipOption>
            <Link
              href={`/posts/${post.id}`}
              className="block text-sm text-muted-foreground hover:underline"
            >
              {formatRelativeDate(new Date(post.createdAt))}
            </Link>
          </div>
        </div>
        {isAuthor && (
          <PostMoreButton
            postId={post.id}
            className="opacity-0 transition-opacity group-hover/post:opacity-100"
          />
        )}
      </div>
      <Linkify>
        <div className="whitespace-pre-line break-words">{post.content}</div>
      </Linkify>
    </article>
  );
}
