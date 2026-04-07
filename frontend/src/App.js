import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from './components/ui/sonner';
import LoadingScreen from './components/LoadingScreen';
import '@/App.css';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ArticleDetail from './pages/ArticleDetail';
import SpinWheelGame from './pages/SpinWheelGame';
import SnakeLadderGame from './pages/SnakeLadderGame';
import CardGame from './pages/CardGame';
import QuizGame from './pages/QuizGame';
import BeTheJudgeGame from './pages/BeTheJudgeGame';
import ChooseViolationGame from './pages/ChooseViolationGame';
import Analytics from './pages/Analytics';
import AdminPanel from './pages/AdminPanel';
import ProfilePage from './pages/ProfilePage';
import LearnPage from './pages/LearnPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-2xl font-bold text-[#1A237E]">Loading...</div>
    </div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/" />;
};

const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-2xl font-bold text-[#1A237E]">Loading...</div>
    </div>;
  }
  
  return isAdmin ? children : <Navigate to="/dashboard" />;
};

function AppContent() {
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (showLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/article/:id" element={<ProtectedRoute><ArticleDetail /></ProtectedRoute>} />
        <Route path="/games/spin-wheel" element={<ProtectedRoute><SpinWheelGame /></ProtectedRoute>} />
        <Route path="/games/snake-ladder" element={<ProtectedRoute><SnakeLadderGame /></ProtectedRoute>} />
        <Route path="/games/card" element={<ProtectedRoute><CardGame /></ProtectedRoute>} />
        <Route path="/games/quiz" element={<ProtectedRoute><QuizGame /></ProtectedRoute>} />
        <Route path="/games/be-the-judge" element={<ProtectedRoute><BeTheJudgeGame /></ProtectedRoute>} />
        <Route path="/games/choose-violation" element={<ProtectedRoute><ChooseViolationGame /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/learn" element={<ProtectedRoute><LearnPage /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
