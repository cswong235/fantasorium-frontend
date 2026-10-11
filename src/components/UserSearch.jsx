import { useEffect, useState } from 'react';
import { Button, Card, Form, ListGroup } from 'react-bootstrap';
import { apiFetch } from '../services/helpers';
import { useAuth } from '../context/AuthContext';

export default function UserSearch({ users, friendships, fetchFriendships }) {
  const { session } = useAuth();
  const token = session.access_token;
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(null);

  function handleSearch(value) {
    setSearch(value);
    // Show the loading state while typing, or clear the results if the box was emptied
    setLoading(Boolean(value));
    if (!value) {
      setResults([]);
    }
  }

  useEffect(() => {
    if (!search) {
      return;
    }

    // Debounce: only search once the user stops typing for 500ms
    const getData = setTimeout(() => {
      // Find from the users array where the username matches the search query
      setResults(users.filter((u) => u.username.toLowerCase().includes(search.toLowerCase())));
      setLoading(false);
    }, 500);

    // Clean up debouncing
    return () => clearTimeout(getData);
  }, [search, users]);

  // Delete
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
    <Card className="fs-panel">
      <Card.Header>Find people</Card.Header>
      <Card.Body>
        <Form.Control
          placeholder="Search by username"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="mb-3"
        />
        {loading && <p className="fs-muted mb-0">Searching...</p>}
        {!loading && search && results.length === 0 && <p className="fs-muted mb-0">No adventurers found.</p>}
        <ListGroup>
          {!loading && results.map((u) => {
            const status = friendships.find((f) => f.other_id === u.id)?.status;
            return (
              <ListGroup.Item key={u.id} className="d-flex justify-content-between align-items-center">
                {u.username}
                {status === 'pending' || status === 'accepted' ? (
                  <Button size="sm" variant="fs-silver" disabled>
                    {status === 'pending' ? 'Pending' : 'Friends'}
                  </Button>
                ) : (
                  <Button size="sm" variant="fs-gold" onClick={() => sendRequest(u.id, status)} disabled={sending === u.id}>
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
