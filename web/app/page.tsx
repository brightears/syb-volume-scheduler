"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ScheduleEditor } from '@/components/schedule-editor'
import { ZoneSelector } from '@/components/zone-selector'
import { Zone, Schedule } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, LogOut, Loader2, Settings } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string | null
  role: 'admin' | 'client'
  accountId: string | null
}

interface Account {
  id: string
  name: string
}

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [currentAccountId, setCurrentAccountId] = useState<string>('')
  const [zones, setZones] = useState<Zone[]>([])
  const [selectedZone, setSelectedZone] = useState<string>('')
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Check if account ID is passed in URL params
    const urlParams = new URLSearchParams(window.location.search)
    const accountParam = urlParams.get('account')
    if (accountParam) {
      setCurrentAccountId(accountParam)
    }
    checkAuth()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (currentAccountId) {
      fetchZones()
    }
  }, [currentAccountId]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!res.ok) {
        router.push('/login')
        return
      }

      const data = await res.json()
      setUser(data.user)
      setAccounts(data.accounts)

      // Set initial account
      if (data.user.role === 'client' && data.user.accountId) {
        setCurrentAccountId(data.user.accountId)
      } else if (data.accounts.length > 0) {
        setCurrentAccountId(data.accounts[0].id)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    }
  }

  const fetchZones = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/zones?accountId=${currentAccountId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
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
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...updatedSchedule,
          accountId: currentAccountId
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
      const token = localStorage.getItem('auth_token')
      await fetch('/api/zones/test-volume', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
                <p className="text-sm text-muted-foreground">
                  {user?.role === 'admin' ? 'Admin Dashboard' : accounts.find(a => a.id === currentAccountId)?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user?.role === 'admin' && accounts.length > 1 && (
                <select
                  value={currentAccountId}
                  onChange={(e) => {
                    setCurrentAccountId(e.target.value)
                    setSelectedZone('')
                  }}
                  className="px-3 py-1 border rounded-md"
                >
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              )}
              <span className="text-sm text-muted-foreground">
                {user?.name || user?.email}
              </span>
              {user?.role === 'admin' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/admin')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Admin Panel
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  localStorage.removeItem('auth_token')
                  document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
                  window.location.href = '/login'
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
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
