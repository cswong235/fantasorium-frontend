import { BrowserRouter, Link, Navigate, NavLink, Route, Routes, Outlet } from 'react-router-dom';
import { Nav, Navbar } from 'react-bootstrap';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LogoutModal from './components/LogoutModal';
import Login from './pages/Login';
import Feed from './pages/Feed';
import UserProfile from './pages/UserProfile';
import Friends from './pages/Friends';
import logo from './assets/Fantasorium.png';
import './App.css';

function Layout(){
  const { session, user } = useAuth();

  return(
    <div className="fs-site" data-bs-theme="dark">
      <header className="fs-banner">
        <Link to="/">
          <img src={logo} alt="Fantasorium" />
        </Link>
        <span className="fs-tagline">A tavern for adventurers, dungeon masters and dice goblins</span>
      </header>

      <Navbar className="fs-nav">
        {session && (
          <>
            <Nav>
              <Nav.Link as={NavLink} to="/" end>Feed</Nav.Link>
              <Nav.Link as={NavLink} to="/friends">Friends</Nav.Link>
              <Nav.Link as={NavLink} to="/profile">Profile</Nav.Link>
            </Nav>
            <span className="fs-nav-user">Logged in as <strong>{user.email}</strong></span>
            <LogoutModal />
          </>
        )}
      </Navbar>

      <main className="fs-main">
        <Outlet/>
      </main>

      <footer className="fs-footer">
        Created by Wong Chang Sheng as part of Mission 10 submission @ Sigmaschool 2026
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
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
