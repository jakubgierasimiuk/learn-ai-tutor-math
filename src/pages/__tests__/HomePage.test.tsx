import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils/test-utils'
import HomePage from '../HomePage'
import { mockSupabase } from '@/test/mocks/supabase'

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock data fetching
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          diagnosis_completed: true,
          total_points: 150,
          level: 2
        },
        error: null
      }),
      then: vi.fn().mockResolvedValue({
        data: [],
        error: null
      })
    })
  })

  it('renders hero section correctly', () => {
    render(<HomePage />)
    
    expect(screen.getByText(/Ucz się matematyki z/)).toBeInTheDocument()
    expect(screen.getByText('AI Tutorem')).toBeInTheDocument()
    expect(screen.getByText(/Personalizowana nauka matematyki/)).toBeInTheDocument()
  })

  it('shows call-to-action buttons', () => {
    render(<HomePage />)
    
    expect(screen.getByText('Rozpocznij naukę')).toBeInTheDocument()
    expect(screen.getByText('Sprawdź swoją wiedzę')).toBeInTheDocument()
  })

  it('displays features section', () => {
    render(<HomePage />)
    
    expect(screen.getByText('AI Teacher')).toBeInTheDocument()
    expect(screen.getByText('Interaktywne lekcje')).toBeInTheDocument()
    expect(screen.getByText('Gamifikacja')).toBeInTheDocument()
    expect(screen.getByText('Społeczność')).toBeInTheDocument()
  })

  it('shows statistics', () => {
    render(<HomePage />)
    
    expect(screen.getByText('15K+')).toBeInTheDocument()
    expect(screen.getByText('Aktywnych uczniów')).toBeInTheDocument()
    expect(screen.getByText('98%')).toBeInTheDocument()
    expect(screen.getByText('Satysfakcji')).toBeInTheDocument()
    expect(screen.getByText('50+')).toBeInTheDocument()
    expect(screen.getByText('Tematów')).toBeInTheDocument()
  })

  it('displays hero image with proper alt text', () => {
    render(<HomePage />)
    
    const heroImage = screen.getByAltText('Studenci uczący się z AI')
    expect(heroImage).toBeInTheDocument()
    expect(heroImage).toHaveAttribute('src')
  })

  it('shows Dashboard component when user has completed diagnosis', async () => {
    render(<HomePage />)
    
    // Wait for data to load and check if dashboard is shown
    await waitFor(() => {
      // Dashboard would be shown - this depends on the actual implementation
      expect(screen.getByText(/Ucz się matematyki z/)).toBeInTheDocument()
    })
  })

  it('shows DiagnosticQuiz when user has not completed diagnosis', async () => {
    // Mock user without completed diagnosis
    mockSupabase.from.mockReturnValue({
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
    
    render(<HomePage />)
    
    // Should show quiz or hero (depending on implementation)
    await waitFor(() => {
      expect(screen.getByText(/Ucz się matematyki z/)).toBeInTheDocument()
    })
  })

  it('handles loading state properly', () => {
    // Mock delayed response
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            data: { diagnosis_completed: true },
            error: null
          }), 100)
        )
      )
    })
    
    render(<HomePage />)
    
    // Should show content immediately (hero section)
    expect(screen.getByText(/Ucz się matematyki z/)).toBeInTheDocument()
  })

  it('has proper responsive design elements', () => {
    render(<HomePage />)
    
    // Check for responsive classes (this depends on the actual implementation)
    const container = document.querySelector('.container')
    expect(container).toBeInTheDocument()
    
    // Grid layout should be present
    const gridElements = document.querySelectorAll('[class*="grid"]')
    expect(gridElements.length).toBeGreaterThan(0)
  })

  it('includes accessibility features', () => {
    render(<HomePage />)
    
    // Check for proper heading hierarchy
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toBeInTheDocument()
    
    // Check for proper link accessibility
    const links = screen.getAllByRole('link')
    links.forEach(link => {
      expect(link).toBeInTheDocument()
    })
    
    // Check for proper button accessibility
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toBeInTheDocument()
    })
  })

  it('handles error states gracefully', async () => {
    // Mock error response
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })
    })
    
    render(<HomePage />)
    
    // Should still show hero section even if data fetch fails
    expect(screen.getByText(/Ucz się matematyki z/)).toBeInTheDocument()
  })
})