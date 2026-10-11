import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
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

  function fetchFriendships() {
    return apiFetch('/friendships', { token }).then((data) =>
      setFriendships(
        data.map((f) => ({ ...f, other_id: f.user_id === user.id ? f.friend_id : f.user_id }))
      )
    );
  }

  useEffect(() => {
    apiFetch('/users', { token }).then(setUsers);
    fetchFriendships();
  }, []);

  return (
    <Container>
      <h1>Friends</h1>
      <FriendRequests users={users} friendships={friendships} fetchFriendships={fetchFriendships} />
      <UserSearch users={users} friendships={friendships} fetchFriendships={fetchFriendships} />
      <FriendsList users={users} friendships={friendships} fetchFriendships={fetchFriendships} />
    </Container>
  );
}
