"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Zone } from '@/types'
import { Music } from 'lucide-react'

interface ZoneSelectorProps {
  zones: Zone[]
  selectedZone?: string
  onZoneSelect: (zoneId: string) => void
}

export function ZoneSelector({ zones, selectedZone, onZoneSelect }: ZoneSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Select Sound Zone
        </CardTitle>
        <CardDescription>
          Choose which zone you want to configure volume schedules for
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={selectedZone} onValueChange={onZoneSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a sound zone" />
          </SelectTrigger>
          <SelectContent>
            {zones.map((zone) => (
              <SelectItem key={zone.id} value={zone.id}>
                <div className="flex items-center gap-2">
                  <span>{zone.name}</span>
                  {zone.isPaired && (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}