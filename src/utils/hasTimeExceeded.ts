import { AUTO_RESPONSE_TIME_THRESHOLD } from '@/constants';

export function hasTimeExceeded(createdAt: string): boolean {
  const thresholdInSeconds = AUTO_RESPONSE_TIME_THRESHOLD || 60;
  const createdTime = new Date(createdAt).getTime();
  const currentTime = Date.now();
  const diffInSeconds = Math.abs(currentTime - createdTime) / 1000;
  return diffInSeconds > thresholdInSeconds;
}
