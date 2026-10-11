import { useState } from 'react';
import { Button, Card, ListGroup } from 'react-bootstrap';
import { apiFetch } from '../services/helpers';
import { useAuth } from '../context/AuthContext';

export default function FriendsList({ users, friendships, fetchFriendships }) {
  const { session } = useAuth();
  const [removing, setRemoving] = useState(null);

  const friends = friendships.filter((f) => f.status === 'accepted');

  async function unfriend(userId) {
    setRemoving(userId);
    try {
      await apiFetch(`/friendships/${userId}`, { method: 'DELETE', token: session.access_token });
      await fetchFriendships();
    } finally {
      setRemoving(null);
    }
  }

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>Your friends</Card.Title>
        {friends.length === 0 ? (
          <p className="mb-0">No friends yet.</p>
        ) : (
          <ListGroup>
            {friends.map((f) => (
              <ListGroup.Item key={f.id} className="d-flex justify-content-between align-items-center">
                {users.find((u) => u.id === f.other_id)?.username}
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => unfriend(f.other_id)}
                  disabled={removing === f.other_id}
                >
                  {removing === f.other_id ? 'Removing...' : 'Unfriend'}
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
}
