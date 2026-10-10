import { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { apiFetch } from '../services/helpers';
import { useAuth } from '../context/AuthContext';
import PostForm from '../components/PostForm';
export default function Feed() {
  const { session } = useAuth();
  const token = session.access_token;

  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function fetchPosts(){
    return apiFetch('/posts', { token })
      // If successful, set the fetched data in setPosts as an array
      .then((data) => setPosts(Array.isArray(data) ? data : data.posts || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <Container>
      <Container>
        <PostForm fetchPosts={fetchPosts}/>
      </Container>
      <Col xs={9}>
        {loading && <Container><p>Loading posts...</p></Container>}
        {!loading && posts.length === 0 && <p>No posts yet.</p>}
        {error && <p>{error}</p>}

        <Row md={2} className="g-3">
          {posts.map((post) => (
            <Col key={post.id}>
              <Card as="article" className="h-100">
                {post.image && <Card.Img variant="top" src={post.image} alt={post.title} />}
                <Card.Body className="d-flex flex-column">
                  <Card.Title as="h3" className="">{post.title}</Card.Title>
                  <Card.Text className="flex-grow-1">{post.content}</Card.Text>
                  <small className="align-self-start">
                    {post.username}
                    {post.created_at && ` · ${new Date(post.created_at).toLocaleString()}`}
                  </small>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Col>
    </Container>
  );
}
