"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useSession } from "next-auth/react";
import UserAvatar from "@/components/UserAvatar";
import "./style.css";
import LoadingButton from "@/components/LoadingButton";
import { useSubmitPostMutation } from "@/components/posts/mutations";

export default function PostEditor() {
  const { data: session } = useSession();
  const mutation = useSubmitPostMutation();
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "How is your day?",
      }),
    ],
    immediatelyRender: false,
  });
  const input = editor?.getText({ blockSeparator: "\n" }) ?? "";

  async function onSubmit() {
    mutation.mutate(
      { content: input },
      {
        onSuccess() {
          editor?.commands.clearContent();
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex gap-5">
        <UserAvatar
          avatarUrl={session!.user?.image}
          className="hidden sm:inline"
        />
        <EditorContent
          editor={editor}
          className="max-h-[20rem] w-full overflow-y-auto rounded-2xl bg-background px-5 py-3"
        />
      </div>
      <div className="flex justify-end">
        <LoadingButton
          onClick={onSubmit}
          disabled={!input.trim()}
          loading={mutation.isPending}
          className="min-w-20"
        >
          Post
        </LoadingButton>
      </div>
    </div>
  );
}
