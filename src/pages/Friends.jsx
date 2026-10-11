import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { apiFetch } from '../services/helpers';
import { useAuth } from '../context/AuthContext';
import UserSearch from '../components/UserSearch';
import FriendsList from '../components/FriendsList';
import FriendRequests from '../components/FriendRequests';

export default function Friends() {
  const { session, user } = useAuth();
  const token = session.access_token;
  const [users, setUsers] = useState([]);
  const [friendships, setFriendships] = useState([]);
  const [loading, setLoading] = useState(true);

  function fetchFriendships() {
    return apiFetch('/friendships', { token }).then((data) =>
      setFriendships(
        data.map((f) => ({ ...f, other_id: f.user_id === user.id ? f.friend_id : f.user_id }))
      )
    );
  }

  useEffect(() => {
    Promise.all([apiFetch('/users', { token }).then(setUsers), fetchFriendships()])
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <h1 className="fs-page-title">Your Party</h1>
      {loading ? (
        <p className="fs-muted">Loading your party...</p>
      ) : (
      <Row>
        <Col xs={7}>
          <FriendRequests users={users} friendships={friendships} fetchFriendships={fetchFriendships} />
          <FriendsList users={users} friendships={friendships} fetchFriendships={fetchFriendships} />
        </Col>
        <Col xs={5}>
          <UserSearch users={users} friendships={friendships} fetchFriendships={fetchFriendships} />
        </Col>
      </Row>
      )}
    </>
  );
}
