"use client"

import { useEffect, useState } from 'react'
import { ScheduleEditor } from '@/components/schedule-editor'
import { ZoneSelector } from '@/components/zone-selector'
import { Zone, Schedule } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, LogOut, Loader2 } from 'lucide-react'

// Mock user for MVP
const MOCK_USER = {
  email: 'hilton@example.com',
  accountId: 'QWNjb3VudCwsMXN4N242NTZyeTgv',
  accountName: 'Hilton Pattaya',
  role: 'user'
}

export default function Home() {
  const [zones, setZones] = useState<Zone[]>([])
  const [selectedZone, setSelectedZone] = useState<string>('')
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchZones()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedZone) {
      // Reset schedule state immediately when zone changes
      setSchedule({
        soundZoneId: selectedZone,
        rules: [],
        timeZone: 'Asia/Bangkok',
        baselineVolume: 8
      })
      // Then fetch the actual schedule
      fetchSchedule(selectedZone)
    }
  }, [selectedZone])

  const fetchZones = async () => {
    try {
      const response = await fetch(`/api/zones?accountId=${MOCK_USER.accountId}`)
      const data = await response.json()
      setZones(data.zones)
      if (data.zones.length > 0 && !selectedZone) {
        setSelectedZone(data.zones[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch zones:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSchedule = async (zoneId: string) => {
    try {
      console.log('Fetching schedule for zone:', zoneId)
      const response = await fetch(`/api/schedules?zoneId=${zoneId}`)
      const data = await response.json()
      console.log('Fetched schedule data:', data)
      setSchedule(data.schedule || {
        soundZoneId: zoneId,
        rules: [],
        timeZone: 'Asia/Bangkok',
        baselineVolume: 8
      })
    } catch (error) {
      console.error('Failed to fetch schedule:', error)
    }
  }

  const handleSaveSchedule = async (updatedSchedule: Schedule) => {
    setSaving(true)
    try {
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedSchedule,
          accountId: MOCK_USER.accountId
        })
      })
      
      if (response.ok) {
        setSchedule(updatedSchedule)
        // Show success toast/notification
      }
    } catch (error) {
      console.error('Failed to save schedule:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleTestVolume = async (volume: number) => {
    try {
      await fetch('/api/zones/test-volume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zoneId: selectedZone,
          volume
        })
      })
      // Show success notification
    } catch (error) {
      console.error('Failed to test volume:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Volume Scheduler</h1>
                <p className="text-sm text-muted-foreground">{MOCK_USER.accountName}</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <ZoneSelector
              zones={zones}
              selectedZone={selectedZone}
              onZoneSelect={setSelectedZone}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Volume Guide</CardTitle>
                <CardDescription>Recommended volume levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">0-5</span>
                    <span>Background music</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">6-8</span>
                    <span>Quiet atmosphere</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">9-11</span>
                    <span>Normal listening</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">12-14</span>
                    <span>Busy periods</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">15-16</span>
                    <span>Maximum volume</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {schedule && selectedZone && (
              <div className="relative">
                {saving && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-lg">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                )}
                <ScheduleEditor
                  schedule={schedule}
                  onSave={handleSaveSchedule}
                  onTest={handleTestVolume}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
