'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, UserPlus, Key, Trash2, Loader2, Copy, CheckCircle } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  isActive: boolean
  lastLogin: string | null
}

interface Account {
  id: string
  name: string
}

export default function AccountUsersPage() {
  const router = useRouter()
  const params = useParams()
  const accountId = params.accountId as string
  
  const [account, setAccount] = useState<Account | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState({ email: '', name: '', password: '' })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [copiedPassword, setCopiedPassword] = useState(false)

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

      fetchAccountAndUsers()
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    }
  }

  const fetchAccountAndUsers = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      
      // Fetch account info
      const accountRes = await fetch(`/api/admin/accounts/${accountId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (accountRes.ok) {
        const accountData = await accountRes.json()
        setAccount(accountData.account)
      }

      // Fetch users
      const usersRes = await fetch(`/api/admin/accounts/${accountId}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewUser({ ...newUser, password })
  }

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password) {
      setError('Email and password are required')
      return
    }

    setCreating(true)
    setError('')

    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch(`/api/admin/accounts/${accountId}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create user')
        return
      }

      // Success
      setShowAddUser(false)
      setNewUser({ email: '', name: '', password: '' })
      fetchAccountAndUsers()
    } catch {
      setError('An error occurred while creating the user')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      fetchAccountAndUsers()
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedPassword(true)
    setTimeout(() => setCopiedPassword(false), 2000)
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
                onClick={() => router.push('/admin')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
              <div className="ml-4">
                <h1 className="text-2xl font-bold">{account?.name || 'Account'} Users</h1>
                <p className="text-sm text-muted-foreground">Manage user access for this account</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Users</h2>
          <Button onClick={() => setShowAddUser(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        {showAddUser && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
              <CardDescription>
                Create login credentials for {account?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="user@example.com"
                    disabled={creating}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Name (optional)
                  </label>
                  <Input
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="John Doe"
                    disabled={creating}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Password
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Enter or generate password"
                      disabled={creating}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generatePassword}
                      disabled={creating}
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Generate
                    </Button>
                    {newUser.password && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(newUser.password)}
                        disabled={creating}
                      >
                        {copiedPassword ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                    {error}
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Login URL:</strong> {window.location.origin}/login<br />
                    <strong>Email:</strong> {newUser.email || '(enter email)'}<br />
                    <strong>Password:</strong> {newUser.password || '(enter password)'}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateUser}
                    disabled={creating}
                  >
                    {creating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create User'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddUser(false)
                      setNewUser({ email: '', name: '', password: '' })
                      setError('')
                    }}
                    disabled={creating}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{user.name || user.email}</CardTitle>
                    <CardDescription>
                      {user.email}
                      {user.name && ` • ${user.email}`}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-muted-foreground">Status:</span>{' '}
                    <span className={user.isActive ? 'text-green-600' : 'text-red-600'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Login:</span>{' '}
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {users.length === 0 && !showAddUser && (
          <Card>
            <CardContent className="text-center py-12">
              <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No users yet for this account</p>
              <Button
                className="mt-4"
                onClick={() => setShowAddUser(true)}
              >
                Create First User
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}