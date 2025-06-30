'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Plus, Users, Building2, Loader2 } from 'lucide-react'

interface Account {
  id: string
  name: string
  isActive: boolean
  subscriptionPlan: string | null
  _count?: {
    users: number
    schedules: number
  }
}

export default function AdminPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddAccount, setShowAddAccount] = useState(false)
  const [newAccountId, setNewAccountId] = useState('')
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    checkAuth()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
      
      // Only admins can access this page
      if (data.user.role !== 'admin') {
        router.push('/')
        return
      }

      fetchAccounts()
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    }
  }

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch('/api/admin/accounts', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        setAccounts(data.accounts)
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAccount = async () => {
    if (!newAccountId.trim()) {
      setError('Please enter an account ID')
      return
    }

    setImporting(true)
    setError('')

    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch('/api/admin/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ accountId: newAccountId.trim() })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to add account')
        return
      }

      // Success - refresh accounts list
      setNewAccountId('')
      setShowAddAccount(false)
      fetchAccounts()
    } catch {
      setError('An error occurred while adding the account')
    } finally {
      setImporting(false)
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="ml-4">
                <h1 className="text-2xl font-bold">Admin Panel</h1>
                <p className="text-sm text-muted-foreground">Manage client accounts</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Client Accounts</h2>
          <Button onClick={() => setShowAddAccount(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>

        {showAddAccount && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Client Account</CardTitle>
              <CardDescription>
                Enter the Soundtrack account ID to import zones and create access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Soundtrack Account ID
                  </label>
                  <Input
                    value={newAccountId}
                    onChange={(e) => setNewAccountId(e.target.value)}
                    placeholder="e.g., QWNjb3VudCwsMXN4N242NTZyeTgv"
                    disabled={importing}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    You can find this in the Soundtrack API or from the client
                  </p>
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                    {error}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleAddAccount}
                    disabled={importing}
                  >
                    {importing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      'Import Account'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddAccount(false)
                      setNewAccountId('')
                      setError('')
                    }}
                    disabled={importing}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{account.name}</CardTitle>
                    <CardDescription className="mt-1">
                      ID: {account.id}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        // Set this account as current and go to main dashboard
                        window.location.href = `/?account=${account.id}`
                      }}
                    >
                      Manage Schedules
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{account._count?.users || 0} users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{account._count?.schedules || 0} schedules</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Plan:</span> {account.subscriptionPlan || 'Basic'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>{' '}
                    <span className={account.isActive ? 'text-green-600' : 'text-red-600'}>
                      {account.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {accounts.length === 0 && !showAddAccount && (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No client accounts yet</p>
              <Button
                className="mt-4"
                onClick={() => setShowAddAccount(true)}
              >
                Add First Account
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}