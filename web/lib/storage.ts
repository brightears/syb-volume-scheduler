// Simple in-memory storage for MVP
// In production, this would be replaced with a proper database

import { Schedule } from '@/types'

const schedules = new Map<string, Schedule>()

export const storage = {
  getSchedule: async (zoneId: string): Promise<Schedule | null> => {
    return schedules.get(zoneId) || null
  },
  
  saveSchedule: async (schedule: Schedule): Promise<Schedule> => {
    schedules.set(schedule.soundZoneId, schedule)
    return schedule
  },
  
  deleteSchedule: async (zoneId: string): Promise<boolean> => {
    return schedules.delete(zoneId)
  },
  
  getAllSchedules: async (): Promise<Schedule[]> => {
    return Array.from(schedules.values())
  }
}