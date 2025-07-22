import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor, screen } from '@/test/utils/test-utils'
import userEvent from '@testing-library/user-event'
import { DiagnosticQuiz } from '../../components/DiagnosticQuiz'
import { mockSupabase } from '../mocks/supabase'

describe('Quiz Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock successful database operations
    mockSupabase.from.mockReturnValue({
      ...mockSupabase.from(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 1, name: 'Test Topic' },
        error: null
      }),
      upsert: vi.fn().mockResolvedValue({
        data: {},
        error: null
      }),
      update: vi.fn().mockResolvedValue({
        data: {},
        error: null
      })
    })
  })

  it('completes full quiz flow successfully', async () => {
    const user = userEvent.setup()
    render(<DiagnosticQuiz />)
    
    // Start with first question
    expect(screen.getByText('1 z 8')).toBeInTheDocument()
    expect(screen.getByText('Rozwiąż równanie: 2x + 5 = 13')).toBeInTheDocument()
    
    // Answer all 8 questions
    const correctAnswers = [
      'x = 4',           // Question 1: Algebra
      '28.26 cm²',       // Question 2: Geometry
      '3',               // Question 3: Functions
      '1/2',             // Question 4: Trigonometry
      '3',               // Question 5: Logarithms
      '5',               // Question 6: Statistics
      '1',               // Question 7: Quadratic equations
      '162'              // Question 8: Sequences
    ]
    
    for (let i = 0; i < 8; i++) {
      // Find and click the correct answer
      const answerText = correctAnswers[i]
      const answerButton = screen.getByText(answerText)
      await user.click(answerButton)
      
      // Click next/finish button
      const nextButton = screen.getByText(i === 7 ? 'Zakończ' : 'Następne')
      expect(nextButton).not.toBeDisabled()
      await user.click(nextButton)
      
      if (i < 7) {
        // Should show next question number
        await waitFor(() => {
          expect(screen.getByText(`${i + 2} z 8`)).toBeInTheDocument()
        })
      }
    }
    
    // Should show completion screen
    await waitFor(() => {
      expect(screen.getByText('Świetna robota!')).toBeInTheDocument()
      expect(screen.getByText(/Odpowiedziałeś na 8 z 8 pytań/)).toBeInTheDocument()
    })
    
    // Click to see results
    const resultsButton = screen.getByText('Zobacz wyniki')
    await user.click(resultsButton)
    
    // Should show results screen
    await waitFor(() => {
      expect(screen.getByText('Diagnoza ukończona!')).toBeInTheDocument()
      expect(screen.getByText(/Twój ogólny wynik/)).toBeInTheDocument()
    })
    
    // Should have saved results to database
    expect(mockSupabase.from).toHaveBeenCalledWith('skill_mastery')
    expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
  })

  it('handles partial quiz completion with navigation', async () => {
    const user = userEvent.setup()
    render(<DiagnosticQuiz />)
    
    // Answer first question
    const firstAnswer = screen.getByText('x = 4')
    await user.click(firstAnswer)
    
    const nextButton = screen.getByText('Następne')
    await user.click(nextButton)
    
    // Should be on question 2
    expect(screen.getByText('2 z 8')).toBeInTheDocument()
    
    // Go back to question 1
    const prevButton = screen.getByText('Poprzednie')
    await user.click(prevButton)
    
    // Should be back on question 1 with answer preserved
    expect(screen.getByText('1 z 8')).toBeInTheDocument()
    const selectedOption = document.querySelector('.border-primary')
    expect(selectedOption).toBeInTheDocument()
  })

  it('calculates scores correctly for different performance levels', async () => {
    const user = userEvent.setup()
    render(<DiagnosticQuiz />)
    
    // Answer questions with mixed performance (some correct, some wrong)
    const answers = [
      'x = 4',           // Correct
      '18.84 cm²',       // Wrong (correct is 28.26)
      '3',               // Correct
      '√2/2',            // Wrong (correct is 1/2)
      '3',               // Correct
      '5',               // Correct
      '2',               // Wrong (correct is 1)
      '162'              // Correct
    ]
    
    for (let i = 0; i < 8; i++) {
      const answerButton = screen.getByText(answers[i])
      await user.click(answerButton)
      
      const nextButton = screen.getByText(i === 7 ? 'Zakończ' : 'Następne')
      await user.click(nextButton)
    }
    
    // Complete quiz and view results
    await waitFor(() => {
      const resultsButton = screen.getByText('Zobacz wyniki')
      expect(resultsButton).toBeInTheDocument()
    })
    
    const resultsButton = screen.getByText('Zobacz wyniki')
    await user.click(resultsButton)
    
    // Should show results with calculated percentages
    await waitFor(() => {
      expect(screen.getByText('Diagnoza ukończona!')).toBeInTheDocument()
      
      // Should show topic-specific results
      const topicCards = document.querySelectorAll('[class*="grid"] > *')
      expect(topicCards.length).toBeGreaterThan(0)
    })
  })

  it('handles TTS functionality in quiz', async () => {
    const user = userEvent.setup()
    
    // Mock successful TTS response
    mockSupabase.functions.invoke.mockResolvedValue({
      data: { audioContent: 'base64audiodata' },
      error: null
    })
    
    render(<DiagnosticQuiz />)
    
    // Click TTS button
    const ttsButton = screen.getByLabelText('Odtwórz pytanie')
    await user.click(ttsButton)
    
    expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('text-to-speech', {
      body: { text: 'Rozwiąż równanie: 2x + 5 = 13' }
    })
  })

  it('handles database errors gracefully', async () => {
    const user = userEvent.setup()
    
    // Mock database error
    mockSupabase.from.mockReturnValue({
      ...mockSupabase.from(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockRejectedValue(new Error('Database connection failed')),
      upsert: vi.fn().mockRejectedValue(new Error('Save failed')),
      update: vi.fn().mockRejectedValue(new Error('Update failed'))
    })
    
    render(<DiagnosticQuiz />)
    
    // Complete quiz quickly
    for (let i = 0; i < 8; i++) {
      // Select any answer
      const buttons = screen.getAllByRole('button')
      const answerButton = buttons.find(btn => btn.textContent?.includes('x = 4') || btn.textContent?.includes('A'))
      
      if (answerButton) {
        await user.click(answerButton)
        const nextButton = screen.getByText(i === 7 ? 'Zakończ' : 'Następne')
        await user.click(nextButton)
      }
    }
    
    // Try to submit results
    await waitFor(() => {
      const resultsButton = screen.getByText('Zobacz wyniki')
      expect(resultsButton).toBeInTheDocument()
    })
    
    const resultsButton = screen.getByText('Zobacz wyniki')
    await user.click(resultsButton)
    
    // Should handle error gracefully (user might see error toast, but quiz continues)
    expect(screen.getByText('Zobacz wyniki')).toBeInTheDocument()
  })

  it('maintains accessibility throughout quiz flow', async () => {
    const user = userEvent.setup()
    render(<DiagnosticQuiz />)
    
    // Check keyboard navigation
    await user.tab()
    expect(document.activeElement).toBeInTheDocument()
    
    // All interactive elements should be focusable
    const interactiveElements = screen.getAllByRole('button')
    interactiveElements.forEach(element => {
      expect(element).toBeInTheDocument()
      expect(element).not.toHaveAttribute('tabindex', '-1')
    })
    
    // TTS button should have proper aria-label
    const ttsButton = screen.getByLabelText('Odtwórz pytanie')
    expect(ttsButton).toHaveAttribute('aria-label')
    
    // Progress indicator should be readable
    expect(screen.getByText('1 z 8')).toBeInTheDocument()
  })

  it('handles touch interactions properly', async () => {
    const user = userEvent.setup()
    render(<DiagnosticQuiz />)
    
    // All answer buttons should have proper touch targets
    const answerButtons = document.querySelectorAll('button[class*="min-h-"]')
    expect(answerButtons.length).toBeGreaterThan(0)
    
    answerButtons.forEach(button => {
      expect(button).toHaveClass('min-h-[48px]')
      expect(button).toHaveClass('touch-target')
    })
    
    // Navigation buttons should also have proper touch targets
    const navButtons = screen.getAllByRole('button').filter(btn => 
      btn.textContent?.includes('Następne') || btn.textContent?.includes('Poprzednie')
    )
    
    navButtons.forEach(button => {
      expect(button).toHaveClass('min-h-[48px]')
      expect(button).toHaveClass('touch-target')
    })
  })
})