import { vi } from 'vitest'

export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2023-01-01T00:00:00Z',
}

export const mockAuthContext = {
  user: mockUser,
  loading: false,
  signIn: vi.fn(),
  signOut: vi.fn(),
}

// Mock useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}))

export default mockAuthContext