import { useState } from 'react';
import { Button, Card, ListGroup } from 'react-bootstrap';
import { apiFetch } from '../services/helpers';
import { useAuth } from '../context/AuthContext';

export default function FriendRequests({ users, friendships, fetchFriendships }) {
  const { session, user } = useAuth();
  const [responding, setResponding] = useState(null);

  const requests = friendships.filter((f) => f.friend_id === user.id && f.status === 'pending');

  async function respond(id, status) {
    setResponding({ id, status });
    try {
      await apiFetch(`/friendships/${id}`, { method: 'PATCH', body: { status }, token: session.access_token });
      await fetchFriendships();
    } finally {
      setResponding(null);
    }
  }

  if (requests.length === 0) {
    return null;
  }

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>Friend requests</Card.Title>
        <ListGroup>
          {requests.map((f) => (
            <ListGroup.Item key={f.id} className="d-flex justify-content-between align-items-center">
              {users.find((u) => u.id === f.user_id)?.username}
              <div>
                <Button size="sm" className="me-2" onClick={() => respond(f.id, 'accepted')} disabled={responding?.id === f.id}>
                  {responding?.id === f.id && responding.status === 'accepted' ? 'Accepting...' : 'Accept'}
                </Button>
                <Button size="sm" variant="outline-secondary" onClick={() => respond(f.id, 'rejected')} disabled={responding?.id === f.id}>
                  {responding?.id === f.id && responding.status === 'rejected' ? 'Rejecting...' : 'Reject'}
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
}
