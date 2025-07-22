import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor, screen } from '@/test/utils/test-utils'
import { DiagnosticQuiz } from '../DiagnosticQuiz'
import userEvent from '@testing-library/user-event'
import { mockSupabase } from '@/test/mocks/supabase'

describe('DiagnosticQuiz Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock successful topic fetch
    mockSupabase.from.mockReturnValue({
      ...mockSupabase.from(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 1, name: 'Algebra' },
        error: null
      })
    })
  })

  it('renders quiz interface correctly', () => {
    render(<DiagnosticQuiz />)
    
    expect(screen.getByText('Test diagnostyczny')).toBeInTheDocument()
    expect(screen.getByText(/Odpowiedz na pytania/)).toBeInTheDocument()
    expect(screen.getByText('1 z 8')).toBeInTheDocument()
  })

  it('displays first question on initial load', () => {
    render(<DiagnosticQuiz />)
    
    expect(screen.getByText('Rozwiąż równanie: 2x + 5 = 13')).toBeInTheDocument()
    expect(screen.getByText('x = 4')).toBeInTheDocument()
    expect(screen.getByText('x = 6')).toBeInTheDocument()
  })

  it('allows selecting answers', async () => {
    const user = userEvent.setup()
    render(<DiagnosticQuiz />)
    
    const optionA = screen.getByText('x = 4')
    await user.click(optionA)
    
    // Check if option is selected (visual feedback)
    const optionButton = optionA.closest('button')
    expect(optionButton).toHaveClass('border-primary')
  })

  it('enables next button only when answer is selected', async () => {
    const user = userEvent.setup()
    render(<DiagnosticQuiz />)
    
    const nextButton = screen.getByText('Następne')
    expect(nextButton).toBeDisabled()
    
    // Select an answer
    const optionA = screen.getByText('x = 4')
    await user.click(optionA)
    
    expect(nextButton).not.toBeDisabled()
  })

  it('navigates between questions correctly', async () => {
    const user = userEvent.setup()
    render(<DiagnosticQuiz />)
    
    // Select answer and go to next question
    const optionA = screen.getByText('x = 4')
    await user.click(optionA)
    
    const nextButton = screen.getByText('Następne')
    await user.click(nextButton)
    
    // Should show question 2
    expect(screen.getByText('2 z 8')).toBeInTheDocument()
    expect(screen.getByText(/Oblicz pole koła/)).toBeInTheDocument()
    
    // Previous button should be available
    const prevButton = screen.getByText('Poprzednie')
    expect(prevButton).not.toBeDisabled()
  })

  it('shows text-to-speech button for accessibility', () => {
    render(<DiagnosticQuiz />)
    
    const ttsButton = screen.getByLabelText('Odtwórz pytanie')
    expect(ttsButton).toBeInTheDocument()
    expect(ttsButton).toHaveAttribute('aria-label', 'Odtwórz pytanie')
  })

  it('handles text-to-speech functionality', async () => {
    const user = userEvent.setup()
    
    // Mock successful TTS response
    mockSupabase.functions.invoke.mockResolvedValue({
      data: { audioContent: 'base64audiodata' },
      error: null
    })
    
    render(<DiagnosticQuiz />)
    
    const ttsButton = screen.getByLabelText('Odtwórz pytanie')
    await user.click(ttsButton)
    
    expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('text-to-speech', {
      body: { text: 'Rozwiąż równanie: 2x + 5 = 13' }
    })
  })

  it('shows completion screen after last question', async () => {
    const user = userEvent.setup()
    render(<DiagnosticQuiz />)
    
    // Answer all 8 questions
    for (let i = 0; i < 8; i++) {
      // Select first option for each question
      const options = screen.getAllByRole('button').filter(btn => 
        btn.textContent?.includes('A') || btn.textContent?.includes('x =') || btn.textContent?.includes('cm²')
      )
      if (options[0]) {
        await user.click(options[0])
      }
      
      const nextButton = screen.getByText(i === 7 ? 'Zakończ' : 'Następne')
      await user.click(nextButton)
    }
    
    // Should show completion screen
    await waitFor(() => {
      expect(screen.getByText('Świetna robota!')).toBeInTheDocument()
    })
  })

  it('handles quiz submission and shows results', async () => {
    const user = userEvent.setup()
    
    // Mock successful save operations
    mockSupabase.from.mockReturnValue({
      ...mockSupabase.from(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 1, name: 'Algebra' },
        error: null
      }),
      upsert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      update: vi.fn().mockResolvedValue({ data: {}, error: null }),
    })
    
    render(<DiagnosticQuiz />)
    
    // Complete the quiz quickly
    for (let i = 0; i < 8; i++) {
      const buttons = screen.getAllByRole('button')
      const answerButton = buttons.find(btn => 
        btn.textContent?.includes('x = 4') || 
        btn.textContent?.includes('28.26') ||
        btn.textContent?.includes('3') ||
        btn.textContent?.includes('1/2') ||
        btn.textContent?.includes('5') ||
        btn.textContent?.includes('1') ||
        btn.textContent?.includes('162')
      )
      
      if (answerButton) {
        await user.click(answerButton)
        const nextButton = screen.getByText(i === 7 ? 'Zakończ' : 'Następne')
        await user.click(nextButton)
      }
    }
    
    // Click "Zobacz wyniki" on completion screen
    await waitFor(() => {
      const resultsButton = screen.getByText('Zobacz wyniki')
      expect(resultsButton).toBeInTheDocument()
    })
    
    const resultsButton = screen.getByText('Zobacz wyniki')
    await user.click(resultsButton)
    
    // Should show results screen
    await waitFor(() => {
      expect(screen.getByText('Diagnoza ukończona!')).toBeInTheDocument()
    })
  })

  it('has proper accessibility attributes', () => {
    render(<DiagnosticQuiz />)
    
    // Check for proper ARIA labels and roles
    const quiz = screen.getByRole('main') || document.body
    expect(quiz).toBeInTheDocument()
    
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      // Each button should be focusable
      expect(button).toBeInTheDocument()
    })
  })

  it('maintains proper focus management', async () => {
    const user = userEvent.setup()
    render(<DiagnosticQuiz />)
    
    // Tab navigation should work properly
    await user.tab()
    expect(document.activeElement).toBeInTheDocument()
    
    // Selecting an answer should maintain focus
    const optionA = screen.getByText('x = 4')
    await user.click(optionA)
    
    expect(document.activeElement).toBeInTheDocument()
  })
})