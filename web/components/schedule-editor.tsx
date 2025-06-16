"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Clock, Volume2 } from 'lucide-react'
import { Schedule, VolumeRule } from '@/types'

interface ScheduleEditorProps {
  schedule: Schedule
  onSave: (schedule: Schedule) => void
  onTest?: (volume: number) => void
}

export function ScheduleEditor({ schedule, onSave, onTest }: ScheduleEditorProps) {
  const [rules, setRules] = useState<VolumeRule[]>(schedule.rules)
  const [baselineVolume, setBaselineVolume] = useState(schedule.baselineVolume || 8)

  const addRule = () => {
    const newRule: VolumeRule = {
      from: '09:00',
      to: '10:00',
      volume: 10
    }
    setRules([...rules, newRule])
  }

  const updateRule = (index: number, field: keyof VolumeRule, value: string | number) => {
    const updatedRules = [...rules]
    updatedRules[index] = { ...updatedRules[index], [field]: value }
    setRules(updatedRules)
  }

  const deleteRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    onSave({
      ...schedule,
      rules,
      baselineVolume
    })
  }

  const volumeOptions = Array.from({ length: 17 }, (_, i) => i)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Schedule Rules</CardTitle>
          <CardDescription>
            Set volume levels for specific time periods. Volume will automatically adjust at these times.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {rules.map((rule, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="time"
                    value={rule.from}
                    onChange={(e) => updateRule(index, 'from', e.target.value)}
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">to</span>
                  <Input
                    type="time"
                    value={rule.to}
                    onChange={(e) => updateRule(index, 'to', e.target.value)}
                    className="w-32"
                  />
                  <Volume2 className="h-4 w-4 text-muted-foreground ml-4" />
                  <Select
                    value={rule.volume.toString()}
                    onValueChange={(value) => updateRule(index, 'volume', parseInt(value))}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {volumeOptions.map((vol) => (
                        <SelectItem key={vol} value={vol.toString()}>
                          {vol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {onTest && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onTest(rule.volume)}
                    >
                      Test
                    </Button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteRule(index)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button onClick={addRule} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Time Rule
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default Volume</CardTitle>
          <CardDescription>
            Volume level when no time rules are active
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Volume2 className="h-5 w-5 text-muted-foreground" />
            <Select
              value={baselineVolume.toString()}
              onValueChange={(value) => setBaselineVolume(parseInt(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {volumeOptions.map((vol) => (
                  <SelectItem key={vol} value={vol.toString()}>
                    {vol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {onTest && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTest(baselineVolume)}
              >
                Test Volume
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => setRules(schedule.rules)}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Schedule
        </Button>
      </div>
    </div>
  )
}