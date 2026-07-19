import { useState } from 'react'
import axios from 'axios'
import LoginPage from './components/LoginPage'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  const handleLogin = async (credentials: any) => {
    // Hardcoded for development preview until DB is fully seeded
    if (credentials.username === 'admin' && credentials.password === 'admin') {
      setIsAuthenticated(true);
      setUser({ username: 'admin' } as any);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5050/api/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setIsAuthenticated(true);
        setUser(response.data.user);
      }
    } catch (error) {
      throw error;
    }
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>AOI Quality Intelligence Dashboard</h1>
      <p>Welcome, {user?.username}!</p>
      <button onClick={() => setIsAuthenticated(false)}>Logout</button>
    </div>
  )
}

export default App
