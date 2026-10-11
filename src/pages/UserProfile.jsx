import { useState, useEffect } from 'react';
import { Alert, Card } from 'react-bootstrap';
import { apiFetch } from '../services/helpers';
import { useAuth } from '../context/AuthContext';
export default function UserProfile() {
  const { session } = useAuth();
  const token = session.access_token;

  const [user, setUser] = useState(null);
  const [friendCount, setFriendCount] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function fetchUser(){
    return apiFetch(`/profile`, { token })
      // /profile sends back a single user object, so store it as is
      .then((data) => setUser(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchUser();
    apiFetch('/friendships', { token })
      .then((data) => setFriendCount(data.filter((f) => f.status === 'accepted').length));
  }, [])

  return (
    <>
      <h1 className="fs-page-title">Adventurer Profile</h1>
      {loading && <p className="fs-muted">Loading user...</p>}
      {error && <Alert className="fs-alert">{error}</Alert>}

      {user && (
        <Card className="fs-panel">
          <Card.Header>Character Sheet</Card.Header>
          <Card.Body>
            <h2 className="fs-profile-name">{user.username}</h2>
            <h3 className="fs-meta mb-1">Joined the tavern on <strong>{new Date(user.created_at).toLocaleDateString()}</strong></h3>
            <p className="fs-meta mb-1">Email: <strong>{session.user.email}</strong></p>
            <p className="fs-meta mb-1">Friends: <strong>{friendCount}</strong></p>
          </Card.Body>
        </Card>
      )}
    </>
  );
}
