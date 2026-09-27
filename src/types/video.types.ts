export interface ProbedVideoMetadata {
  durationSeconds: number;
  width: number;
  height: number;
  aspectRatio: string;
  codec: string | null;
  bitrateKbps: number | null;
  fps: number | null;
}
