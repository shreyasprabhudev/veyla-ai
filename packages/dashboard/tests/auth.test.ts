import { createClient } from '@supabase/supabase-js'
import { expect, test, describe, beforeAll, afterAll } from 'vitest'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const TEST_USER = {
  email: 'test@example.com',
  password: 'test123456',
}

describe('Authentication Flow', () => {
  beforeAll(async () => {
    // Clean up any existing test user
    const { data: { user } } = await supabase.auth.signInWithPassword(TEST_USER)
    if (user) {
      await supabase.auth.admin.deleteUser(user.id)
    }
  })

  afterAll(async () => {
    const { data: { user } } = await supabase.auth.signInWithPassword(TEST_USER)
    if (user) {
      await supabase.auth.admin.deleteUser(user.id)
    }
  })

  test('should sign up a new user', async () => {
    const { data: { user }, error } = await supabase.auth.signUp(TEST_USER)
    
    expect(error).toBeNull()
    expect(user).not.toBeNull()
    expect(user?.email).toBe(TEST_USER.email)
  })

  test('should sign in existing user', async () => {
    const { data: { user }, error } = await supabase.auth.signInWithPassword(TEST_USER)
    
    expect(error).toBeNull()
    expect(user).not.toBeNull()
    expect(user?.email).toBe(TEST_USER.email)
  })

  test('should create profile on signup', async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single()
    
    expect(error).toBeNull()
    expect(profile).not.toBeNull()
    expect(profile.id).toBe(user?.id)
  })

  test('should have default role', async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data: roles, error } = await supabase
      .from('user_roles')
      .select(`
        role:roles (
          name,
          permissions
        )
      `)
      .eq('user_id', user?.id)
    
    expect(error).toBeNull()
    expect(roles).not.toBeNull()
    expect(roles?.[0]?.role.name).toBe('user')
  })
})
