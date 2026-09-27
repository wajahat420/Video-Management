export const config = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL,
  storageRoot: process.env.STORAGE_ROOT ?? './storage',
  video: {
    maxSizeBytes: Number(process.env.MAX_VIDEO_SIZE_BYTES ?? 100 * 1024 * 1024), // 100MB
    allowedMimeTypes: ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'application/octet-stream'],
    allowedExtensions: ['.mp4', '.mov', '.webm', '.avi'],
    thumbnailTimestamp: '10%',
    thumbnailWidth: 320,
  },
};
