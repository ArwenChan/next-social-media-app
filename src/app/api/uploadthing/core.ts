import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  avatar: f({
    image: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: "512KB",
      maxFileCount: 1,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      // This code runs on your server before upload
      const session = await auth();
      if (!session?.user)
        throw new UploadThingError(
          "You must be logged in to upload a profile picture",
        );
      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { user: session!.user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      const oldAvatar = metadata.user.image;
      if (oldAvatar) {
        const key = oldAvatar.split("/").pop() as string;
        await new UTApi().deleteFiles(key);
      }
      const url = `https://${process.env.UPLOADTHING_APP_ID}.ufs.sh/f/${file.key}`;
      await prisma.user.update({
        where: { id: metadata.user.id },
        data: {
          image: url,
        },
      });

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { avatarUrl: url };
    }),
  attachment: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    video: { maxFileSize: "64MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user)
        throw new UploadThingError("You must be logged in to upload things.");
      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: session!.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      const url = `https://${process.env.UPLOADTHING_APP_ID}.ufs.sh/f/${file.key}`;
      const media = await prisma.media.create({
        data: {
          url,
          type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
        },
      });
      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { mediaId: media.id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
