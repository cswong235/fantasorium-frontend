import { useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { apiFetch } from '../services/helpers';
import { useAuth } from '../context/AuthContext';

export default function PostForm({ fetchPosts }){
    const { session } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [visibility, setVisibility] = useState('public');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e){
        e.preventDefault();
        setError('');
        setLoading(true);
        try{
            await apiFetch('/posts', {
                method: 'POST',
                body: {
                    title: title,
                    content: content,
                    visibility: visibility,
                },
                token: session.access_token,
            });
            // Clear the form and refresh the feed so the new post shows up
            setTitle('');
            setContent('');
            setVisibility('public');
            fetchPosts();
        }catch(err){
            setError(err.message);
        }finally{
            setLoading(false);
        }
    }

    return(
        <Container>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="postTitle">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="postContent">
                    <Form.Label>Content</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={4}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Who can see this?</Form.Label>
                    <div>
                        <Form.Check
                            inline
                            type="radio"
                            id="visibility-public"
                            name="visibility"
                            label="Public"
                            value="public"
                            checked={visibility === 'public'}
                            onChange={(e) => setVisibility(e.target.value)}
                        />
                        <Form.Check
                            inline
                            type="radio"
                            id="visibility-friends"
                            name="visibility"
                            label="Friends only"
                            value="friends_only"
                            checked={visibility === 'friends_only'}
                            onChange={(e) => setVisibility(e.target.value)}
                        />
                    </div>
                </Form.Group>

                {error && <p className="text-danger">{error}</p>}

                <Button type="submit" disabled={loading}>
                    {loading ? 'Posting...' : 'Post'}
                </Button>
            </Form>
        </Container>
    )
}