export interface Zone {
  id: string;
  name: string;
  isPaired: boolean;
  deviceId?: string;
}

export interface VolumeRule {
  from: string; // HH:MM format
  to: string;   // HH:MM format
  volume: number; // 0-16
}

export interface Schedule {
  soundZoneId: string;
  rules: VolumeRule[];
  timeZone: string;
  baselineVolume?: number;
}

export interface ScheduleFormData {
  name: string;
  zones: string[];
  dayOfWeek: number;
  time: string;
  volume: number;
  enabled: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface ScheduleStore {
  schedules: Schedule[];
  loading: boolean;
  error: string | null;
  fetchSchedules: () => Promise<void>;
  createSchedule: (schedule: ScheduleFormData) => Promise<void>;
  updateSchedule: (id: string, schedule: Partial<ScheduleFormData>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  toggleSchedule: (id: string) => Promise<void>;
}

export interface ZoneStore {
  zones: Zone[];
  loading: boolean;
  error: string | null;
  fetchZones: () => Promise<void>;
  updateZoneVolume: (zoneId: string, volume: number) => Promise<void>;
}