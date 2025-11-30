import { Status } from './types';

export const STATUS_COLORS = {
  [Status.Done]: 'bg-emerald-500',     // Green
  [Status.Partial]: 'bg-yellow-500',   // Yellow
  [Status.Missed]: 'bg-red-500',       // Red
  [Status.None]: 'bg-[#e8e4d9] dark:bg-neutral-800' // Warm Beige / Adaptive Grey
};

// Initial state - Empty to allow user to start fresh
export const DEFAULT_HABITS_TEMPLATE = [];