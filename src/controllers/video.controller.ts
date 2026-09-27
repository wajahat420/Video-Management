import { Request, Response } from 'express';
import {
  createVideoRecord,
  getVideoById,
  listVideos,
  processVideo,
  serializeVideo,
} from '../services/video.service';
import { deleteVideoDir, extensionOf, videoKey } from '../services/storage.service';

export async function uploadVideo(req: Request, res: Response): Promise<void> {
  const file = req.file;
  const videoId = req.videoId;

  if (!file || !videoId) {
    res.status(400).json({ status: 'error', message: 'No video file provided' });
    return;
  }

  const storageKey = videoKey(videoId, extensionOf(file.originalname));

  let video;
  try {
    video = await createVideoRecord({
      id: videoId,
      originalFilename: file.originalname,
      mimeType: file.mimetype,
      fileSizeBytes: file.size,
      storageKey,
    });
  } catch (err) {
    deleteVideoDir(videoId);
    const message = err instanceof Error ? err.message : 'Failed to create video record';
    res.status(500).json({ status: 'error', message });
    return;
  }

  video = await processVideo(videoId, storageKey);

  res.status(201).json({ status: 'ok', video: serializeVideo(video) });
}

export async function getVideo(req: Request, res: Response): Promise<void> {
  const video = await getVideoById(String(req.params.id));
  if (!video) {
    res.status(404).json({ status: 'error', message: 'Video not found' });
    return;
  }
  res.json({ status: 'ok', video: serializeVideo(video) });
}

export async function listVideosHandler(req: Request, res: Response): Promise<void> {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

  const result = await listVideos(page, limit);
  res.json({
    status: 'ok',
    page: result.page,
    limit: result.limit,
    total: result.total,
    videos: result.items.map(serializeVideo),
  });
}
