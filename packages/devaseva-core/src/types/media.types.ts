import { StreamStatus } from '../enums/status.enums';
import { SoftDelete } from './common.types';

export interface LiveStream extends SoftDelete {
  id: string;
  poojaId: string;
  templeId: string;
  priestId: string;
  streamUrl: string;
  status: StreamStatus;
  startedAt?: Date;
  endedAt?: Date;
  viewersCount: number;
  peakViewers: number;
}

export interface Recording extends SoftDelete {
  id: string;
  poojaId: string;
  streamId: string;
  videoUrl: string;
  durationSeconds: number;
  isPublished: boolean;
  createdAt: Date;
}
