import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(date: Date, timeZone: string = 'America/New_York'): string {
  const zonedDate = toZonedTime(date, timeZone);
  return format(zonedDate, 'HH:mm');
}

export function formatDateTime(date: Date, timeZone: string = 'America/New_York'): string {
  const zonedDate = toZonedTime(date, timeZone);
  return format(zonedDate, 'PPpp');
}

export function parseTime(timeString: string, timeZone: string = 'America/New_York'): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const now = new Date();
  now.setHours(hours, minutes, 0, 0);
  return fromZonedTime(now, timeZone);
}

export function getDayName(dayIndex: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex];
}

export function getNextOccurrence(dayOfWeek: number, time: string, timeZone: string = 'America/New_York'): Date {
  const now = new Date();
  const targetDate = new Date(now);
  
  // Find the next occurrence of the target day
  const currentDay = now.getDay();
  const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7;
  
  if (daysUntilTarget === 0) {
    // If it's the same day, check if the time has passed
    const [hours, minutes] = time.split(':').map(Number);
    const targetTime = new Date(now);
    targetTime.setHours(hours, minutes, 0, 0);
    
    if (targetTime <= now) {
      // Time has passed, schedule for next week
      targetDate.setDate(targetDate.getDate() + 7);
    }
  } else {
    targetDate.setDate(targetDate.getDate() + daysUntilTarget);
  }
  
  // Set the time
  const [hours, minutes] = time.split(':').map(Number);
  targetDate.setHours(hours, minutes, 0, 0);
  
  return fromZonedTime(targetDate, timeZone);
}