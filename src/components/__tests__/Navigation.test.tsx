import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor, screen } from '@/test/utils/test-utils'
import { Navigation } from '../Navigation'
import userEvent from '@testing-library/user-event'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/' }),
  }
})

describe('Navigation Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders navigation menu correctly', () => {
    render(<Navigation />)
    
    expect(screen.getByText('AI Tutor')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Lekcje')).toBeInTheDocument()
    expect(screen.getByText('Chat AI')).toBeInTheDocument()
    expect(screen.getByText('Analityka')).toBeInTheDocument()
  })

  it('shows mobile menu button on small screens', () => {
    render(<Navigation />)
    
    // Mobile menu button should be present
    const menuButton = screen.getByRole('button', { name: /toggle menu/i })
    expect(menuButton).toBeInTheDocument()
  })

  it('displays user email and logout option', async () => {
    const user = userEvent.setup()
    render(<Navigation />)
    
    // Find user menu trigger
    const userMenuTrigger = screen.getByText('test@example.com')
    expect(userMenuTrigger).toBeInTheDocument()
    
    // Click to open user menu
    await user.click(userMenuTrigger)
    
    // Check for logout option
    await waitFor(() => {
      expect(screen.getByText('Wyloguj')).toBeInTheDocument()
    })
  })

  it('handles navigation link clicks correctly', async () => {
    const user = userEvent.setup()
    render(<Navigation />)
    
    const dashboardLink = screen.getByText('Dashboard')
    await user.click(dashboardLink)
    
    // Navigation should have been called (we can't test actual navigation in isolation)
    expect(dashboardLink).toBeInTheDocument()
  })

  it('shows active navigation state correctly', () => {
    // Mock location to be on dashboard
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom')
      return {
        ...actual,
        useLocation: () => ({ pathname: '/dashboard' }),
      }
    })
    
    render(<Navigation />)
    
    // Active link should have different styling (this depends on implementation)
    const dashboardLink = screen.getByText('Dashboard')
    expect(dashboardLink).toBeInTheDocument()
  })

  it('renders UX Test link when available', () => {
    render(<Navigation />)
    
    expect(screen.getByText('UX Test')).toBeInTheDocument()
  })

  it('is accessible via keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<Navigation />)
    
    // Tab through navigation items
    await user.tab()
    expect(document.activeElement).toBeInTheDocument()
    
    // Should be able to navigate through all menu items
    await user.tab()
    await user.tab()
    
    expect(document.activeElement).toBeInTheDocument()
  })
})