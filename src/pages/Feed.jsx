import { useState, useEffect } from 'react';
import { Alert, Badge, Card, Col, Image, Row } from 'react-bootstrap';
import InfiniteScroll from 'react-infinite-scroll-component';
import { apiFetch } from '../services/helpers';
import { useAuth } from '../context/AuthContext';
import PostForm from '../components/PostForm';

const PAGE_SIZE = 3;

export default function Feed() {
  const { session } = useAuth();
  const token = session.access_token;

  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Starts the feed over from the newest posts, e.g. on first load or after posting
  async function fetchPosts(){
    // Fetch from the posts table up to the PAGE_SIZE limit
    return apiFetch(`/posts?limit=${PAGE_SIZE}&offset=0`, { token })
      .then((data) => {
        // Populate the posts state with the fetched data
        setPosts(data);
        // If the length of the data is equal to the page size, it means that there are more posts
        // Hence, set to true
        setHasMore(data.length === PAGE_SIZE);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  // Adds the next 3 posts to the end of the list when the user scrolls to the bottom
  async function loadMorePosts(){
    // Fetch the next 3 posts offset by the number of posts already loaded
    return apiFetch(`/posts?limit=${PAGE_SIZE}&offset=${posts.length}`, { token })
      .then((data) => {
        // Append the extra fetched data to the existing posts array
        setPosts([...posts, ...data]);
        // If there are still more, set true
        setHasMore(data.length === PAGE_SIZE);
      })
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  // If 3 posts don't fill the screen there's nothing to scroll, so keep loading until they do
  useEffect(() => {
    if (!loading && hasMore && document.documentElement.scrollHeight <= window.innerHeight) {
      loadMorePosts();
    }
  }, [posts]);

  return (
    <Row>
      <Col xs={8}>
        <h1 className="fs-page-title">The Tavern Board</h1>
        {loading && <p className="fs-muted">Loading posts...</p>}
        {!loading && posts.length === 0 && <p className="fs-muted">No posts yet.</p>}
        {error && <Alert className="fs-alert">{error}</Alert>}

        <InfiniteScroll
          dataLength={posts.length}
          next={loadMorePosts}
          hasMore={!loading && hasMore}
          loader={<p className="fs-muted text-center">Loading...</p>}
          endMessage={posts.length > 0 && <p className="fs-muted text-center">You've reached the end of the board.</p>}
          style={{ overflow: 'visible' }}
        >
          {posts.map((post) => (
            <Card as="article" className="fs-panel" key={post.id}>
              <Card.Header>
                <h3 className="d-inline">{post.title}</h3>
                {post.visibility === 'friends_only' && <Badge bg="" className="fs-tag">Friends only</Badge>}
              </Card.Header>
              <Card.Body>
                {post.image && <Image src={post.image} alt={post.title} className="fs-post-image w-100" rounded />}
                <Card.Text>{post.content}</Card.Text>
                <div className="fs-meta">
                  Posted by <strong>{post.username}</strong>
                  {post.created_at && ` · ${new Date(post.created_at).toLocaleString()}`}
                </div>
              </Card.Body>
            </Card>
          ))}
        </InfiniteScroll>
      </Col>
      <Col xs={4}>
        <div className="fs-sticky">
          <PostForm fetchPosts={fetchPosts}/>
        </div>
      </Col>
    </Row>
  );
}
