import { PostData, PostDataSimple, UserData } from "@/types/post";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import { cn, formatRelativeDate } from "@/lib/utils";
import { useSession } from "next-auth/react";
import PostMoreButton from "./PostMoreButton";
import Linkify from "@/components/Linkify";
import LinkWithToolTipOption from "@/components/LinkWithToolTipOption";
import { Media } from "@prisma/client";
import Image from "next/image";

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
      {!!post.attachments.length && (
        <MediaPreviews attachments={post.attachments} />
      )}
    </article>
  );
}

interface MediaPreviewsProps {
  attachments: Media[];
}

function MediaPreviews({ attachments }: MediaPreviewsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        attachments.length > 1 && "sm;grid-cols-2 sm:grid",
      )}
    >
      {attachments.map((m) => (
        <MediaPreview key={m.id} media={m} />
      ))}
    </div>
  );
}

function MediaPreview({ media }: { media: Media }) {
  if (media.type === "IMAGE") {
    return (
      <Image
        src={media.url}
        alt="attachment"
        width={500}
        height={500}
        className="mx-auto size-fit max-h-[30rem] rounded-2xl"
      />
    );
  }
  if (media.type === "VIDEO") {
    return (
      <div>
        <video
          src={media.url}
          controls
          className="mx-auto size-fit max-h-[30rem] rounded-2xl"
        />
      </div>
    );
  }
  return <p className="text-destructive">Unsupported media.</p>;
}
