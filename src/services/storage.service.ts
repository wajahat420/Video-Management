import fs from 'fs';
import path from 'path';
import { config } from '../config';

const STORAGE_ROOT = path.resolve(process.cwd(), config.storageRoot);

export function resolvePath(key: string): string {
  return path.join(STORAGE_ROOT, key);
}

export function ensureDirForKey(key: string): void {
  const dir = path.dirname(resolvePath(key));
  fs.mkdirSync(dir, { recursive: true });
}

export function videoKey(id: string, ext: string): string {
  return `videos/${id}/original${ext}`;
}

export function extensionOf(filename: string): string {
  return path.extname(filename).toLowerCase();
}

export function thumbnailKey(id: string): string {
  return `videos/${id}/thumbnail.jpg`;
}

export function deleteVideoDir(id: string): void {
  const dir = resolvePath(`videos/${id}`);
  fs.rmSync(dir, { recursive: true, force: true });
}
