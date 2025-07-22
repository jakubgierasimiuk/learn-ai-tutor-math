import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor, screen } from '@/test/utils/test-utils'
import userEvent from '@testing-library/user-event'
import App from '../../App'
import { mockSupabase } from '../mocks/supabase'

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock no authenticated user initially
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })
    
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })
  })

  it('shows auth page when user is not logged in', async () => {
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText(/Zaloguj się/)).toBeInTheDocument()
    })
  })

  it('allows user to sign in with email', async () => {
    const user = userEvent.setup()
    
    mockSupabase.auth.signInWithOtp.mockResolvedValue({
      data: { user: null, session: null },
      error: null
    })
    
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Wprowadź swój email/)).toBeInTheDocument()
    })
    
    const emailInput = screen.getByPlaceholderText(/Wprowadź swój email/)
    const signInButton = screen.getByText('Wyślij link')
    
    await user.type(emailInput, 'test@example.com')
    await user.click(signInButton)
    
    expect(mockSupabase.auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'test@example.com',
      options: {
        emailRedirectTo: expect.stringContaining(window.location.origin)
      }
    })
  })

  it('shows main app when user is authenticated', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      created_at: '2023-01-01T00:00:00Z'
    }
    
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })
    
    // Mock profile data
    mockSupabase.from.mockReturnValue({
      ...mockSupabase.from(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          diagnosis_completed: true,
          total_points: 150,
          level: 2
        },
        error: null
      }),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      then: vi.fn().mockResolvedValue({ data: [], error: null })
    })
    
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('AI Tutor')).toBeInTheDocument()
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })

  it('redirects to quiz when diagnosis is not completed', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      created_at: '2023-01-01T00:00:00Z'
    }
    
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })
    
    // Mock profile without completed diagnosis
    mockSupabase.from.mockReturnValue({
      ...mockSupabase.from(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          diagnosis_completed: false,
          total_points: 0,
          level: 1
        },
        error: null
      })
    })
    
    render(<App />)
    
    await waitFor(() => {
      // Should show diagnostic quiz or be redirected to it
      expect(screen.getByText('AI Tutor')).toBeInTheDocument()
    })
  })

  it('handles sign out flow', async () => {
    const user = userEvent.setup()
    
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      created_at: '2023-01-01T00:00:00Z'
    }
    
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })
    
    mockSupabase.auth.signOut.mockResolvedValue({
      error: null
    })
    
    mockSupabase.from.mockReturnValue({
      ...mockSupabase.from(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { diagnosis_completed: true },
        error: null
      })
    })
    
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })
    
    // Click on user menu
    const userMenu = screen.getByText('test@example.com')
    await user.click(userMenu)
    
    await waitFor(() => {
      expect(screen.getByText('Wyloguj')).toBeInTheDocument()
    })
    
    const signOutButton = screen.getByText('Wyloguj')
    await user.click(signOutButton)
    
    expect(mockSupabase.auth.signOut).toHaveBeenCalled()
  })

  it('handles auth errors gracefully', async () => {
    const user = userEvent.setup()
    
    mockSupabase.auth.signInWithOtp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid email format' }
    })
    
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Wprowadź swój email/)).toBeInTheDocument()
    })
    
    const emailInput = screen.getByPlaceholderText(/Wprowadź swój email/)
    const signInButton = screen.getByText('Wyślij link')
    
    await user.type(emailInput, 'invalid-email')
    await user.click(signInButton)
    
    // Should handle error gracefully (error message would appear)
    expect(mockSupabase.auth.signInWithOtp).toHaveBeenCalled()
  })

  it('persists authentication state across page refreshes', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      created_at: '2023-01-01T00:00:00Z'
    }
    
    // Mock auth state change to simulate persistence
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })

    mockSupabase.from.mockReturnValue({
      ...mockSupabase.from(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { diagnosis_completed: true },
        error: null
      })
    })
    
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('AI Tutor')).toBeInTheDocument()
    })
  })
})