import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
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
      return { userId: session!.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      const url = `https://${process.env.UPLOADTHING_APP_ID}.ufs.sh/f/${file.key}`;
      await prisma.user.update({
        where: { id: metadata.userId },
        data: {
          image: url,
        },
      });

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { avatarUrl: url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
