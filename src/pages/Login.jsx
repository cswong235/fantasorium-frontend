import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { apiFetch } from '../services/helpers';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { session } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // If already logged in, the user doesn't need to be in the login screen
  if (session) {
    return <Navigate to="/" replace />;
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    if(mode === 'signup' && password !== confirmPassword){
        setError('Passwords do not match.');
        return;
    }
    setBusy(true);
    try {
      // Both routes return a session, so signing up logs you in too
      const path = mode === 'signup' ? '/signup' : '/login';
      const json = await apiFetch(path, { method: 'POST', body: { email, password } });
      // Hand the backend's session to the Supabase client so it's stored,
      // auto-refreshed, and picked up by AuthContext
      await supabase.auth.setSession({
        access_token: json.session.access_token,
        refresh_token: json.session.refresh_token,
      });
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function googleLogin() {
    await supabase.auth.signInWithOAuth({provider: 'google'});
  }

  function toggleMode() {
    setMode(mode === 'signup' ? 'login' : 'signup');
    setError('');
  }

  return (
    <div className="card">
      <h2>{mode === 'signup' ? 'Create an account' : 'Welcome back'}</h2>
      <form onSubmit={submit}>
        <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {mode === 'signup' ? 
            <input
                placeholder="Confirm password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
            /> 
            : ''}
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={busy}>
          {mode === 'signup' ? 'Sign up' : 'Log in'}
        </button>
      </form>
      <hr />
      <button className="ghost" onClick={googleLogin} type="button">
        Continue with Google
      </button>
      <button className="ghost" type="button" onClick={toggleMode}>
        {mode === 'signup' ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
      </button>
    </div>
  );
}
