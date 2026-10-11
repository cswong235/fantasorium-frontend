import { test, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PostForm from './PostForm.jsx'
import { apiFetch } from '../services/helpers'

// Mock Supabase, the logged in user, and the backend
vi.mock('../supabaseClient', () => ({ supabase: {} }))
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ session: { access_token: 'fake-token' }, user: { id: 'user-1' } }),
}))
vi.mock('../services/helpers', () => ({ apiFetch: vi.fn() }))

test('sends a friends only post and refreshes the feed', async () => {
  apiFetch.mockResolvedValue({ message: 'Post added successfully' })
  const fetchPosts = vi.fn()

  render(<PostForm fetchPosts={fetchPosts} />)
  fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Hello' } })
  fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'Just for friends' } })
  fireEvent.click(screen.getByLabelText('Friends only'))
  fireEvent.click(screen.getByText('Post'))

  // Wait for the async submit to finish before checking
  await waitFor(() => expect(fetchPosts).toHaveBeenCalled())
  expect(apiFetch).toHaveBeenCalledWith('/posts', {
    method: 'POST',
    body: { title: 'Hello', content: 'Just for friends', visibility: 'friends_only', image: null },
    token: 'fake-token',
  })
})
