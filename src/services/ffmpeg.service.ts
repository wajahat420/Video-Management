import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import { config } from '../config';
import { ProbedVideoMetadata } from '../types/video.types';

if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}
ffmpeg.setFfprobePath(ffprobeStatic.path);

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function normalizedAspectRatio(width: number, height: number): string {
  const divisor = gcd(width, height) || 1;
  return `${width / divisor}:${height / divisor}`;
}

function parseFrameRate(rate: string | undefined): number | null {
  if (!rate) return null;
  const [num, den] = rate.split('/').map(Number);
  if (!den) return num || null;
  return num / den;
}

export function probeVideo(absoluteFilePath: string): Promise<ProbedVideoMetadata> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(absoluteFilePath, (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      const videoStream = data.streams.find((s) => s.codec_type === 'video');
      if (!videoStream || !videoStream.width || !videoStream.height) {
        reject(new Error('No video stream found in file'));
        return;
      }

      const durationSeconds = data.format.duration ?? 0;
      const formatBitrate = data.format.bit_rate ? Number(data.format.bit_rate) : null;
      const streamBitrate = videoStream.bit_rate ? Number(videoStream.bit_rate) : null;
      const bitrateBps = formatBitrate ?? streamBitrate;

      resolve({
        durationSeconds,
        width: videoStream.width,
        height: videoStream.height,
        aspectRatio: normalizedAspectRatio(videoStream.width, videoStream.height),
        codec: videoStream.codec_name ?? null,
        bitrateKbps: bitrateBps ? Math.round(bitrateBps / 1000) : null,
        fps: parseFrameRate(videoStream.r_frame_rate),
      });
    });
  });
}

export function generateThumbnail(
  absoluteFilePath: string,
  outputDir: string,
  filename: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg(absoluteFilePath)
      .on('end', () => resolve(`${outputDir}/${filename}`))
      .on('error', reject)
      .screenshots({
        timestamps: [config.video.thumbnailTimestamp],
        filename,
        folder: outputDir,
        size: `${config.video.thumbnailWidth}x?`,
      });
  });
}
