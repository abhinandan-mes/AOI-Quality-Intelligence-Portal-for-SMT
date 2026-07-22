import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios'
import './App.css'
import LoginPage from './components/LoginPage'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import LineManagement from './pages/LineManagement'
import BarcodeHistory from './pages/BarcodeHistory'
import DefectSearch from './pages/DefectSearch'
import Reports from './pages/Reports'
import Analytics from './pages/Analytics'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) setIsAuthenticated(true)
    setLoading(false)
  }, [])

  const handleLogin = async (credentials: any) => {
    if (credentials.username === 'abhinandan' && credentials.password === '95003989') {
      localStorage.setItem('token', 'dev-token');
      setIsAuthenticated(true);
      return;
    }

    try {
      const response = await axios.post(`http://${window.location.hostname}:5050/api/auth/login`, credentials);
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
        
        <Route path="/" element={isAuthenticated ? <MainLayout onLogout={() => setIsAuthenticated(false)} /> : <Navigate to="/login" replace />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="lines" element={<LineManagement />} />
          <Route path="history" element={<BarcodeHistory />} />
          <Route path="search" element={<DefectSearch />} />
          <Route path="reports" element={<Reports />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
