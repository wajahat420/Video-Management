import fs from 'fs';
import path from 'path';
import multer, { FileFilterCallback } from 'multer';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { ensureDirForKey, extensionOf, resolvePath, videoKey } from '../services/storage.service';

declare global {
  namespace Express {
    interface Request {
      videoId?: string;
    }
  }
}

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const { createId } = await import('@paralleldrive/cuid2');
      const id = createId();
      req.videoId = id;
      const key = videoKey(id, extensionOf(file.originalname));
      ensureDirForKey(key);
      cb(null, path.dirname(resolvePath(key)));
    } catch (err) {
      cb(err as Error, '');
    }
  },
  filename: (req, file, cb) => {
    cb(null, `original${extensionOf(file.originalname)}`);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const ext = extensionOf(file.originalname);
  const extensionAllowed = config.video.allowedExtensions.includes(ext);
  const mimeTypeAllowed = config.video.allowedMimeTypes.includes(file.mimetype);

  if (!extensionAllowed || !mimeTypeAllowed) {
    cb(new Error(`Unsupported file type: ${file.originalname} (${file.mimetype})`));
    return;
  }

  cb(null, true);
};

export const uploadVideo = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.video.maxSizeBytes },
}).single('video');

export function handleUploadError(err: unknown, req: Request, res: Response, next: NextFunction): void {
  if (!err) {
    next();
    return;
  }

  if (req.videoId) {
    const dir = resolvePath(`videos/${req.videoId}`);
    fs.rm(dir, { recursive: true, force: true }, () => {});
  }

  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    res.status(413).json({ status: 'error', message: 'File exceeds maximum allowed size' });
    return;
  }

  const message = err instanceof Error ? err.message : 'Upload failed';
  res.status(400).json({ status: 'error', message });
}
