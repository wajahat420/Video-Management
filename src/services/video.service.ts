import path from 'path';
import prisma from '../lib/prisma';
import { generateThumbnail, probeVideo } from './ffmpeg.service';
import { resolvePath, thumbnailKey } from './storage.service';

export async function createVideoRecord(params: {
  id: string;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  storageKey: string;
}) {
  return prisma.video.create({
    data: {
      id: params.id,
      originalFilename: params.originalFilename,
      mimeType: params.mimeType,
      fileSizeBytes: BigInt(params.fileSizeBytes),
      storageKey: params.storageKey,
      status: 'PROCESSING',
    },
  });
}

export async function processVideo(videoId: string, storageKey: string) {
  const absoluteFilePath = resolvePath(storageKey);

  try {
    const metadata = await probeVideo(absoluteFilePath);

    const outputDir = path.dirname(absoluteFilePath);
    await generateThumbnail(absoluteFilePath, outputDir, 'thumbnail.jpg');

    return prisma.video.update({
      where: { id: videoId },
      data: {
        status: 'READY',
        durationSeconds: metadata.durationSeconds,
        width: metadata.width,
        height: metadata.height,
        aspectRatio: metadata.aspectRatio,
        codec: metadata.codec,
        bitrateKbps: metadata.bitrateKbps,
        fps: metadata.fps,
        thumbnailKey: thumbnailKey(videoId),
      },
    });
  } catch (err) {
    console.error(`Video processing failed for ${videoId}:`, err);
    return prisma.video.update({
      where: { id: videoId },
      data: { status: 'FAILED', errorMessage: 'This file could not be processed as a video.' },
    });
  }
}

export async function getVideoById(id: string): Promise<Awaited<ReturnType<typeof prisma.video.findUnique>>> {
  return prisma.video.findUnique({ where: { id } });
}

export async function listVideos(page: number, limit: number) {
  const [items, total] = await Promise.all([
    prisma.video.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.video.count(),
  ]);
  return { items, total, page, limit };
}

export function serializeVideo(video: Awaited<ReturnType<typeof getVideoById>>) {
  if (!video) return null;
  return {
    ...video,
    fileSizeBytes: video.fileSizeBytes.toString(),
    fileSizeMBs: Number((Number(video.fileSizeBytes) / (1024 * 1024)).toFixed(2)),
  };
}
