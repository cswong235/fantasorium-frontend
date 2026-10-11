import { test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Friends from './Friends.jsx'
import { apiFetch } from '../services/helpers'

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ session: { access_token: 'fake-token' }, user: { id: 'me' } }),
}))
vi.mock('../services/helpers', () => ({ apiFetch: vi.fn() }))

const users = [
  { id: 'alice', username: 'alice' },
  { id: 'bob', username: 'bob' },
]
let friendships

// A fake backend that remembers friendships, so changes show up after a refresh
beforeEach(() => {
  vi.clearAllMocks()
  friendships = []
  apiFetch.mockImplementation(async (path, { method = 'GET', body } = {}) => {
    if (path === '/users') return users
    if (path === '/friendships' && method === 'GET') return friendships
    if (path === '/friendships' && method === 'POST') {
      friendships = [...friendships, { id: 99, user_id: 'me', friend_id: body.friend_id, status: 'pending' }]
      return {}
    }
    if (method === 'PATCH') {
      const id = Number(path.split('/').pop())
      friendships = friendships.map((f) => (f.id === id ? { ...f, status: body.status } : f))
      return {}
    }
  })
})

test('searching shows only the matching users', async () => {
  render(<Friends />)
  fireEvent.change(screen.getByPlaceholderText('Search by username'), { target: { value: 'ali' } })
  expect(await screen.findByText('alice')).toBeTruthy()
  expect(screen.queryByText('bob')).toBeNull()
})

test('sending a friend request marks the user as pending', async () => {
  render(<Friends />)
  fireEvent.change(screen.getByPlaceholderText('Search by username'), { target: { value: 'bob' } })
  fireEvent.click(await screen.findByText('Add friend'))
  expect(await screen.findByText('Pending')).toBeTruthy()
  expect(apiFetch).toHaveBeenCalledWith('/friendships', {
    method: 'POST',
    body: { friend_id: 'bob' },
    token: 'fake-token',
  })
})

test('accepting a friend request adds them to the friends list', async () => {
  friendships = [{ id: 1, user_id: 'alice', friend_id: 'me', status: 'pending' }]
  render(<Friends />)
  fireEvent.click(await screen.findByText('Accept'))
  expect(await screen.findByText('Unfriend')).toBeTruthy()
  expect(screen.getByText('alice')).toBeTruthy()
  expect(screen.queryByText('Friend requests')).toBeNull()
})

test('rejecting a friend request removes it without adding a friend', async () => {
  friendships = [{ id: 1, user_id: 'alice', friend_id: 'me', status: 'pending' }]
  render(<Friends />)
  fireEvent.click(await screen.findByText('Reject'))
  await waitFor(() => expect(screen.queryByText('Friend requests')).toBeNull())
  expect(screen.getByText('No friends yet.')).toBeTruthy()
  expect(apiFetch).toHaveBeenCalledWith('/friendships/1', {
    method: 'PATCH',
    body: { status: 'rejected' },
    token: 'fake-token',
  })
})
