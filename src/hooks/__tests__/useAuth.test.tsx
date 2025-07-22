import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAuth, AuthProvider } from '../useAuth'
import { mockSupabase } from '@/test/mocks/supabase'
import React from 'react'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset auth state
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  )

  it('initializes with no user and loading state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    expect(result.current.user).toBeNull()
    expect(result.current.loading).toBe(true)
  })

  it('sets user when authenticated', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      created_at: '2023-01-01T00:00:00Z'
    }
    
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.user).toEqual(mockUser)
  })

  it('handles sign in with OTP', async () => {
    mockSupabase.auth.signInWithOtp.mockResolvedValue({
      data: { user: null, session: null },
      error: null
    })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    await result.current.signIn('test@example.com')
    
    expect(mockSupabase.auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'test@example.com',
      options: {
        emailRedirectTo: expect.stringContaining(window.location.origin)
      }
    })
  })

  it('handles sign in errors', async () => {
    mockSupabase.auth.signInWithOtp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid email address' }
    })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    await expect(result.current.signIn('invalid-email')).rejects.toThrow('Invalid email address')
  })

  it('handles sign out', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({
      error: null
    })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    await result.current.signOut()
    
    expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('handles auth state changes', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      created_at: '2023-01-01T00:00:00Z'
    }
    
    // Mock onAuthStateChange to immediately call the callback
    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      callback('SIGNED_IN', { user: mockUser })
      return {
        data: { subscription: { unsubscribe: vi.fn() } }
      }
    })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.loading).toBe(false)
    })
  })

  it('handles auth errors during initialization', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Network error' }
    })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.user).toBeNull()
  })

  it('creates profile for new users', async () => {
    const mockUser = {
      id: 'new-user-123',
      email: 'newuser@example.com',
      created_at: '2023-01-01T00:00:00Z',
      user_metadata: { name: 'New User' }
    }
    
    // Mock profile creation
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' } // Not found
      }),
      insert: vi.fn().mockResolvedValue({
        data: { id: 'profile-123' },
        error: null
      })
    })
    
    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      callback('SIGNED_IN', { user: mockUser })
      return {
        data: { subscription: { unsubscribe: vi.fn() } }
      }
    })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
    })
    
    // Should have attempted to create profile
    expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
  })

  it('cleans up subscription on unmount', () => {
    const unsubscribeMock = vi.fn()
    
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: unsubscribeMock } }
    })
    
    const { unmount } = renderHook(() => useAuth(), { wrapper })
    
    unmount()
    
    expect(unsubscribeMock).toHaveBeenCalled()
  })
})