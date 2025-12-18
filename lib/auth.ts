import { supabase } from './supabase'
import bcrypt from 'bcryptjs'

export async function createUser(username: string, password: string, name: string): Promise<{ id: string; username: string; name: string } | null> {
  try {
    // Check if username already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single()

    if (existing) {
      return null // Username already taken
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate user ID
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create user
    const { data, error } = await supabase
      .from('users')
      .insert({
        id,
        username,
        password: hashedPassword,
        name,
      })
      .select('id, username, name')
      .single()

    if (error) {
      console.error('Error creating user:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in createUser:', error)
    return null
  }
}

export async function verifyUser(username: string, password: string): Promise<{ id: string; username: string; name: string } | null> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, password, name')
      .eq('username', username)
      .single()

    if (error || !user) {
      return null
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return null
    }

    return {
      id: user.id,
      username: user.username,
      name: user.name || username,
    }
  } catch (error) {
    console.error('Error in verifyUser:', error)
    return null
  }
}

export async function getUserById(id: string): Promise<{ id: string; username: string; name: string } | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, name')
      .eq('id', id)
      .single()

    if (error || !data) {
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getUserById:', error)
    return null
  }
}
