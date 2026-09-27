-- Remove unused UPLOADING value from VideoStatus enum; default becomes PROCESSING
ALTER TYPE "VideoStatus" RENAME TO "VideoStatus_old";
CREATE TYPE "VideoStatus" AS ENUM ('PROCESSING', 'READY', 'FAILED');
ALTER TABLE "videos" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "videos" ALTER COLUMN "status" TYPE "VideoStatus" USING ("status"::text::"VideoStatus");
ALTER TABLE "videos" ALTER COLUMN "status" SET DEFAULT 'PROCESSING';
DROP TYPE "VideoStatus_old";
