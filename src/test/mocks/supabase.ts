import { vi } from 'vitest'

// Mock Supabase client
export const mockSupabase = {
  auth: {
    getUser: vi.fn(),
    signInWithOtp: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } }
    })),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    then: vi.fn().mockResolvedValue({ data: [], error: null }),
  })),
  functions: {
    invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
}

// Mock the supabase client module
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}))

export default mockSupabase