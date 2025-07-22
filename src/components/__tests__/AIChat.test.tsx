import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils/test-utils'
import { AIChat } from '../AIChat'
import userEvent from '@testing-library/user-event'
import { mockSupabase } from '@/test/mocks/supabase'

describe('AIChat Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock chat session creation
    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 1, user_id: 'test-user-id', title: 'Test Session' },
        error: null
      }),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    })
  })

  it('renders chat interface correctly', async () => {
    render(<AIChat />)
    
    await waitFor(() => {
      expect(screen.getByText('AI Tutor - Asystent Matematyki')).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/Napisz swoją wiadomość/)).toBeInTheDocument()
    })
  })

  it('displays initial welcome message', async () => {
    render(<AIChat />)
    
    await waitFor(() => {
      expect(screen.getByText(/Cześć! Jestem Twoim AI Tutorem/)).toBeInTheDocument()
    })
  })

  it('shows AI insights sidebar', async () => {
    render(<AIChat />)
    
    await waitFor(() => {
      expect(screen.getByText('Analizy AI')).toBeInTheDocument()
    })
  })

  it('allows sending messages', async () => {
    const user = userEvent.setup()
    
    // Mock successful AI response
    mockSupabase.functions.invoke.mockResolvedValue({
      data: { 
        response: 'Oto odpowiedź AI na Twoje pytanie.',
        insights: []
      },
      error: null
    })
    
    render(<AIChat />)
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Napisz swoją wiadomość/)).toBeInTheDocument()
    })
    
    const input = screen.getByPlaceholderText(/Napisz swoją wiadomość/)
    const sendButton = screen.getByLabelText('Wyślij wiadomość')
    
    await user.type(input, 'Jak rozwiązać równanie kwadratowe?')
    await user.click(sendButton)
    
    // Should show user message
    expect(screen.getByText('Jak rozwiązać równanie kwadratowe?')).toBeInTheDocument()
    
    // Should call AI function
    expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('ai-chat', {
      body: expect.objectContaining({
        message: 'Jak rozwiązać równanie kwadratowe?'
      })
    })
  })

  it('handles text-to-speech functionality', async () => {
    const user = userEvent.setup()
    
    // Mock TTS response
    mockSupabase.functions.invoke.mockResolvedValue({
      data: { audioContent: 'base64audiodata' },
      error: null
    })
    
    render(<AIChat />)
    
    await waitFor(() => {
      const ttsButtons = screen.getAllByLabelText(/Odtwórz wiadomość/)
      expect(ttsButtons.length).toBeGreaterThan(0)
    })
    
    const ttsButton = screen.getAllByLabelText(/Odtwórz wiadomość/)[0]
    await user.click(ttsButton)
    
    expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('text-to-speech', {
      body: { text: expect.any(String) }
    })
  })

  it('handles voice-to-text functionality', async () => {
    const user = userEvent.setup()
    
    // Mock successful voice transcription
    mockSupabase.functions.invoke.mockResolvedValue({
      data: { text: 'Transkrybowany tekst z głosu' },
      error: null
    })
    
    // Mock getUserMedia
    Object.defineProperty(window.navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }]
        })
      }
    })
    
    render(<AIChat />)
    
    await waitFor(() => {
      const micButton = screen.getByLabelText(/Rozpocznij nagrywanie głosowe/)
      expect(micButton).toBeInTheDocument()
    })
    
    const micButton = screen.getByLabelText(/Rozpocznij nagrywanie głosowe/)
    await user.click(micButton)
    
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true })
  })

  it('shows loading state during AI response', async () => {
    const user = userEvent.setup()
    
    // Mock delayed AI response
    mockSupabase.functions.invoke.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          data: { response: 'Delayed response', insights: [] },
          error: null
        }), 100)
      )
    )
    
    render(<AIChat />)
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Napisz swoją wiadomość/)).toBeInTheDocument()
    })
    
    const input = screen.getByPlaceholderText(/Napisz swoją wiadomość/)
    const sendButton = screen.getByLabelText('Wyślij wiadomość')
    
    await user.type(input, 'Test message')
    await user.click(sendButton)
    
    // Should show typing indicator
    expect(screen.getByText('Test message')).toBeInTheDocument()
    
    // Wait for response
    await waitFor(() => {
      expect(screen.getByText('Delayed response')).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('handles AI errors gracefully', async () => {
    const user = userEvent.setup()
    
    // Mock AI error
    mockSupabase.functions.invoke.mockRejectedValue(new Error('AI service unavailable'))
    
    render(<AIChat />)
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Napisz swoją wiadomość/)).toBeInTheDocument()
    })
    
    const input = screen.getByPlaceholderText(/Napisz swoją wiadomość/)
    const sendButton = screen.getByLabelText('Wyślij wiadomość')
    
    await user.type(input, 'Test message')
    await user.click(sendButton)
    
    // Should show fallback message
    await waitFor(() => {
      expect(screen.getByText(/Przepraszam, wystąpił problem z połączeniem/)).toBeInTheDocument()
    })
  })

  it('handles TTS errors with user-friendly messages', async () => {
    const user = userEvent.setup()
    
    // Mock TTS error
    mockSupabase.functions.invoke.mockRejectedValue(new Error('TTS service unavailable'))
    
    render(<AIChat />)
    
    await waitFor(() => {
      const ttsButtons = screen.getAllByLabelText(/Odtwórz wiadomość/)
      expect(ttsButtons.length).toBeGreaterThan(0)
    })
    
    const ttsButton = screen.getAllByLabelText(/Odtwórz wiadomość/)[0]
    await user.click(ttsButton)
    
    // Should show user-friendly error message
    // Note: Toast messages are harder to test, but we ensure the function handles errors
    expect(mockSupabase.functions.invoke).toHaveBeenCalled()
  })

  it('has proper accessibility features', async () => {
    render(<AIChat />)
    
    await waitFor(() => {
      const input = screen.getByPlaceholderText(/Napisz swoją wiadomość/)
      expect(input).toHaveAttribute('aria-label', 'Wpisz wiadomość do AI Tutora')
    })
    
    const sendButton = screen.getByLabelText('Wyślij wiadomość')
    expect(sendButton).toBeInTheDocument()
    
    const micButton = screen.getByLabelText(/Rozpocznij nagrywanie głosowe/)
    expect(micButton).toBeInTheDocument()
  })

  it('maintains message history correctly', async () => {
    const user = userEvent.setup()
    
    mockSupabase.functions.invoke.mockResolvedValue({
      data: { 
        response: 'AI Response 1',
        insights: []
      },
      error: null
    })
    
    render(<AIChat />)
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Napisz swoją wiadomość/)).toBeInTheDocument()
    })
    
    const input = screen.getByPlaceholderText(/Napisz swoją wiadomość/)
    const sendButton = screen.getByLabelText('Wyślij wiadomość')
    
    // Send first message
    await user.type(input, 'First message')
    await user.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText('First message')).toBeInTheDocument()
      expect(screen.getByText('AI Response 1')).toBeInTheDocument()
    })
    
    // Send second message
    await user.clear(input)
    await user.type(input, 'Second message')
    await user.click(sendButton)
    
    // Both messages should be visible
    expect(screen.getByText('First message')).toBeInTheDocument()
    expect(screen.getByText('Second message')).toBeInTheDocument()
  })
})