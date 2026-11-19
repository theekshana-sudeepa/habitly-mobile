export type HabitFrequency = "DAILY" | "WEEKLY" | "MONTHLY";

export interface Habit {
  id: string;
  name: string;
  color: string;
  frequency: HabitFrequency;
}

export interface HabitLog {
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface UserProfile {
  id?: number | string;
  fullName: string;
  username: string;
  email: string;
  profileImage?: string | null;
}
