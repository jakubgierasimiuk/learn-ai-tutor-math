import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { mockAuthContext } from '../mocks/auth'

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Export screen from @testing-library/dom
export { screen } from '@testing-library/dom'

// Helper function to wait for async operations
export const waitFor = async (callback: () => void | Promise<void>, options?: { timeout?: number }) => {
  const timeout = options?.timeout || 1000
  const start = Date.now()
  
  while (Date.now() - start < timeout) {
    try {
      await callback()
      return
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 10))
    }
  }
  
  // Final attempt
  await callback()
}

// Mock data generators
export const createMockLesson = (overrides = {}) => ({
  id: 1,
  title: 'Test Lesson',
  description: 'Test lesson description',
  content_type: 'theory',
  difficulty_level: 1,
  topic_id: 1,
  is_active: true,
  content_data: {
    theory: 'Test theory content',
    examples: ['Example 1', 'Example 2'],
  },
  estimated_time_minutes: 15,
  lesson_order: 1,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  ...overrides,
})

export const createMockTopic = (overrides = {}) => ({
  id: 1,
  name: 'Test Topic',
  description: 'Test topic description',
  difficulty_level: 1,
  category: 'mathematics',
  learning_objectives: ['Objective 1', 'Objective 2'],
  prerequisites: [],
  estimated_time_minutes: 30,
  is_active: true,
  created_at: '2023-01-01T00:00:00Z',
  ...overrides,
})

export const createMockQuizQuestion = (overrides = {}) => ({
  id: 1,
  topic: 'Algebra',
  difficulty: 'easy',
  question: 'What is 2 + 2?',
  options: [
    { id: 'a', text: '3', correct: false },
    { id: 'b', text: '4', correct: true },
    { id: 'c', text: '5', correct: false },
    { id: 'd', text: '6', correct: false },
  ],
  explanation: 'Basic addition: 2 + 2 equals 4',
  ...overrides,
})

export const createMockUserProgress = (overrides = {}) => ({
  user_id: mockAuthContext.user.id,
  lesson_id: 1,
  topic_id: 1,
  status: 'completed',
  score: 85,
  completion_percentage: 100,
  time_spent_minutes: 20,
  started_at: '2023-01-01T10:00:00Z',
  completed_at: '2023-01-01T10:20:00Z',
  last_accessed_at: '2023-01-01T10:20:00Z',
  created_at: '2023-01-01T10:00:00Z',
  updated_at: '2023-01-01T10:20:00Z',
  ...overrides,
})

export const createMockProfile = (overrides = {}) => ({
  id: 'profile-id',
  user_id: mockAuthContext.user.id,
  email: mockAuthContext.user.email,
  name: 'Test User',
  total_points: 150,
  level: 2,
  diagnosis_completed: true,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  ...overrides,
})

// Helper function to wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

// Helper to simulate user interactions
export const simulateUserEvent = async (element: HTMLElement, event: string) => {
  const userEvent = await import('@testing-library/user-event')
  const user = userEvent.default.setup()
  
  switch (event) {
    case 'click':
      await user.click(element)
      break
    case 'type':
      await user.type(element, 'test input')
      break
    default:
      throw new Error(`Unsupported event: ${event}`)
  }
}