import { BrowserRouter, Link, Navigate, NavLink, Route, Routes, Outlet } from 'react-router-dom';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Feed from './pages/Feed';
import UserProfile from './pages/UserProfile';
import Friends from './pages/Friends';
import './App.css';

function Layout(){
  const { logout, session } = useAuth();

  return(
    <>
      <Navbar bg="dark" data-bs-theme="dark" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/">
            <img src="/logohere.png" alt="Fantasorium" height="40" />
          </Navbar.Brand>

          {/* Only show the page links once someone is logged in */}
          {session && (
            <Nav className="ms-auto">
              <Nav.Link as={NavLink} to="/" end>Feed</Nav.Link>
              <Nav.Link as={NavLink} to="/friends">Friends</Nav.Link>
              <Nav.Link as={NavLink} to="/profile">Profile</Nav.Link>
              <button className="ghost" onClick={logout}>Log out</button>
            </Nav>
          )}
        </Container>
      </Navbar>
      <Outlet/> 
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Every page sits inside Layout, so the navbar shows everywhere */}
          <Route element={<Layout />}>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Feed />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/friends" element={<Friends />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
