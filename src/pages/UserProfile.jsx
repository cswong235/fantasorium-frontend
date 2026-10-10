import { useState, useEffect } from 'react';
import { Container, Col } from 'react-bootstrap';
import { apiFetch } from '../services/helpers';
import { useAuth } from '../context/AuthContext';
export default function UserProfile() {
  const { session } = useAuth();
  const token = session.access_token;

  const [user, setUser] = useState(null);
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
  }, [])

  return (
    <Container>
      <Col xs={9}>
        {loading && <Container><p>Loading user...</p></Container>}
        {error && <p>{error}</p>}

        {/* user is null until the fetch finishes */}
        {user && (
          <Container>
            <h1>{user.username}</h1>
            <p>Joined {new Date(user.created_at).toLocaleDateString()}</p>
          </Container>
        )}
      </Col>
    </Container>
  );
}
