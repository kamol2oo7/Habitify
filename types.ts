export enum Status {
  Done = 'DONE',
  Partial = 'PARTIAL',
  Missed = 'MISSED',
  None = 'NONE'
}

export interface Habit {
  id: string;
  name: string;
  type: 'build' | 'break'; // 'build' = do it, 'break' = avoid it (e.g. smoking)
}

export interface DailyLog {
  [dateIso: string]: {
    [habitId: string]: Status;
  };
}

export interface DailyMetric {
  date: string; // ISO Date YYYY-MM-DD
  day?: number; // Helper for charts
  sleep: number; // 1-10
  mood: number; // 1-10
  satisfaction: number; // 1-10
}
