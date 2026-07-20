import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import LoginPage from './components/LoginPage'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'

import LineManagement from './pages/LineManagement'
import BarcodeHistory from './pages/BarcodeHistory'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) setIsAuthenticated(true)
    setLoading(false)
  }, [])

  const handleLogin = async (credentials: any) => {
    if (credentials.username === 'admin' && credentials.password === 'admin') {
      localStorage.setItem('token', 'dev-token');
      setIsAuthenticated(true);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5050/api/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setIsAuthenticated(true);
      }
    } catch (error) {
      throw error;
    }
  }

  if (loading) return null;

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/dashboard" replace />} 
        />
        
        <Route path="/" element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="lines" element={<LineManagement />} />
          <Route path="history" element={<BarcodeHistory />} />
          <Route path="search" element={<div style={{padding: '20px'}}>Defect Search (Coming Soon)</div>} />
          <Route path="reports" element={<div style={{padding: '20px'}}>Reports (Coming Soon)</div>} />
          <Route path="analytics" element={<div style={{padding: '20px'}}>Analytics (Coming Soon)</div>} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
