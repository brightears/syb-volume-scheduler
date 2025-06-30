'use client'

import { useState, useEffect } from 'react'
import { Select } from '@/components/ui/select'

interface Account {
  id: string
  name: string
}

interface AccountSwitcherProps {
  currentAccountId?: string
  onAccountChange: (accountId: string) => void
}

interface User {
  id: string
  email: string
  name: string | null
  role: 'admin' | 'client'
  accountId: string | null
}

export function AccountSwitcher({ currentAccountId, onAccountChange }: AccountSwitcherProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserAndAccounts()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserAndAccounts = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error('Failed to fetch user')
      }

      const data = await res.json()
      setUser(data.user)
      setAccounts(data.accounts)

      // Set initial account if not set
      if (!currentAccountId && data.accounts.length > 0) {
        onAccountChange(data.accounts[0].id)
      }
    } catch (error) {
      console.error('Error fetching user/accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  if (!user) return null

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-600">
        {user.role === 'admin' ? '👤 Admin' : '🏢 Client'}: {user.name || user.email}
      </span>
      
      {user.role === 'admin' && accounts.length > 1 && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Account:</label>
          <Select
            value={currentAccountId || ''}
            onValueChange={onAccountChange}
          >
            <option value="">Select Account</option>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </Select>
        </div>
      )}

      <button
        onClick={() => {
          localStorage.removeItem('auth_token')
          window.location.href = '/login'
        }}
        className="text-sm text-red-600 hover:text-red-800"
      >
        Logout
      </button>
    </div>
  )
}