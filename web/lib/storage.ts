import { Schedule } from '@/types'
import { prisma } from './prisma'
import { Prisma } from '@prisma/client'

export const storage = {
  getSchedule: async (zoneId: string): Promise<Schedule | null> => {
    if (!process.env.DATABASE_URL) {
      // Fallback to in-memory storage if no database
      return inMemoryStorage.getSchedule(zoneId)
    }
    
    const dbSchedule = await prisma.schedule.findUnique({
      where: { soundZoneId: zoneId }
    })
    
    if (!dbSchedule) return null
    
    return {
      soundZoneId: dbSchedule.soundZoneId,
      rules: JSON.parse(JSON.stringify(dbSchedule.rules)) as Schedule['rules'],
      timeZone: dbSchedule.timeZone,
      baselineVolume: dbSchedule.baselineVolume
    }
  },
  
  saveSchedule: async (schedule: Schedule & { accountId?: string }): Promise<Schedule> => {
    if (!process.env.DATABASE_URL) {
      return inMemoryStorage.saveSchedule(schedule)
    }
    
    const saved = await prisma.schedule.upsert({
      where: { soundZoneId: schedule.soundZoneId },
      update: {
        rules: schedule.rules as Prisma.InputJsonValue,
        timeZone: schedule.timeZone,
        baselineVolume: schedule.baselineVolume || 8
      },
      create: {
        soundZoneId: schedule.soundZoneId,
        accountId: schedule.accountId || 'default',
        zoneName: 'Zone', // You might want to pass this in
        rules: schedule.rules as Prisma.InputJsonValue,
        timeZone: schedule.timeZone,
        baselineVolume: schedule.baselineVolume || 8
      }
    })
    
    return {
      soundZoneId: saved.soundZoneId,
      rules: JSON.parse(JSON.stringify(saved.rules)) as Schedule['rules'],
      timeZone: saved.timeZone,
      baselineVolume: saved.baselineVolume
    }
  },
  
  deleteSchedule: async (zoneId: string): Promise<boolean> => {
    if (!process.env.DATABASE_URL) {
      return inMemoryStorage.deleteSchedule(zoneId)
    }
    
    try {
      await prisma.schedule.delete({
        where: { soundZoneId: zoneId }
      })
      return true
    } catch {
      return false
    }
  },
  
  getAllSchedules: async (): Promise<Schedule[]> => {
    if (!process.env.DATABASE_URL) {
      return inMemoryStorage.getAllSchedules()
    }
    
    const schedules = await prisma.schedule.findMany()
    return schedules.map(s => ({
      soundZoneId: s.soundZoneId,
      rules: JSON.parse(JSON.stringify(s.rules)) as Schedule['rules'],
      timeZone: s.timeZone,
      baselineVolume: s.baselineVolume
    }))
  }
}

// In-memory fallback
const schedules = new Map<string, Schedule>()
const inMemoryStorage = {
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