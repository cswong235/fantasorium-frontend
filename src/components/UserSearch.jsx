import { useState } from 'react';
import { Button, Card, Form, ListGroup } from 'react-bootstrap';
import { apiFetch } from '../services/helpers';
import { useAuth } from '../context/AuthContext';

export default function UserSearch({ users, friendships, fetchFriendships }) {
  const { session } = useAuth();
  const token = session.access_token;
  const [search, setSearch] = useState('');
  const [sending, setSending] = useState(null);

  const results = search
    ? users.filter((u) => u.username.toLowerCase().includes(search.toLowerCase()))
    : [];

  async function sendRequest(userId, status) {
    setSending(userId);
    try {
      if (status === 'rejected') {
        await apiFetch(`/friendships/${userId}`, { method: 'DELETE', token });
      }
      await apiFetch('/friendships', { method: 'POST', body: { friend_id: userId }, token });
      await fetchFriendships();
    } finally {
      setSending(null);
    }
  }

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>Find people</Card.Title>
        <Form.Control
          placeholder="Search by username"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3"
        />
        <ListGroup>
          {results.map((u) => {
            const status = friendships.find((f) => f.other_id === u.id)?.status;
            return (
              <ListGroup.Item key={u.id} className="d-flex justify-content-between align-items-center">
                {u.username}
                {status === 'pending' || status === 'accepted' ? (
                  <Button size="sm" variant="secondary" disabled>
                    {status === 'pending' ? 'Pending' : 'Friends'}
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => sendRequest(u.id, status)} disabled={sending === u.id}>
                    {sending === u.id ? 'Sending...' : 'Add friend'}
                  </Button>
                )}
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </Card.Body>
    </Card>
  );
}
