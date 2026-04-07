import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Book, Target, Trophy, Users, Star, ArrowRight, GraduationCap } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login, register } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Seed data on mount
    const seedData = async () => {
      try {
        await axios.post(`${API}/seed`);
      } catch (error) {
        console.log('Seed check:', error.response?.data?.message || 'Already seeded');
      }
    };
    seedData();
  }, []);

  const handleLogin = async (email, password) => {
    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
      throw error;
    }
  };

  const handleRegister = async (name, email, password) => {
    try {
      await register(name, email, password);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Header */}
      <header className="bg-[#FDFBF7] border-b-2 border-[#1A237E] sticky top-0 z-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#FF6B35] p-2 rounded-lg border-2 border-[#1A237E]">
              <Book size={32} weight="bold" className="text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-heading text-[#1A237E] tracking-tight">Sansthaein Aur Samvidhan</h1>
          </div>
          <button 
            data-testid="get-started-btn"
            onClick={() => setShowAuth(true)} 
            className="neo-btn-primary"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-[#FFD54F] border-2 border-[#1A237E] px-4 py-2 rounded-full mb-6">
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#1A237E]">Learn Constitution</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#1A237E] mb-6 font-heading">
                Master Indian Constitution Through <span className="text-[#FF6B35]">Gamified Learning</span>
              </h1>
              <p className="text-base font-medium text-[#1A237E]/80 leading-relaxed mb-8">
                Simplify complex constitutional articles, understand institutions, and learn through interactive games. Perfect for students, aspirants, and curious citizens.
              </p>
              <div className="flex gap-4">
                <button 
                  data-testid="hero-start-learning-btn"
                  onClick={() => setShowAuth(true)} 
                  className="neo-btn-primary flex items-center gap-2"
                >
                  Start Learning <ArrowRight size={20} weight="bold" />
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="neo-card p-8">
                <img 
                  src="https://images.unsplash.com/photo-1637589316488-6d4c41b335cd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODh8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBzdHVkZW50cyUyMHN0dWR5aW5nJTIwbW9kZXJufGVufDB8fHx8MTc3NTUzMzY4Nnww&ixlib=rb-4.1.0&q=85"
                  alt="Students learning"
                  className="w-full h-[400px] object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-[#F0EFEA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#1A237E] mb-12 text-center font-heading">
            Why Learn With Us?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="neo-card">
              <div className="bg-[#FF6B35] w-12 h-12 rounded-lg border-2 border-[#1A237E] flex items-center justify-center mb-4">
                <Book size={24} weight="bold" className="text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A237E] mb-2 font-heading">Simplified Articles</h3>
              <p className="text-base font-medium text-[#1A237E]/80">Complex legal text made easy to understand with AI-powered simplification</p>
            </div>
            <div className="neo-card">
              <div className="bg-[#00E676] w-12 h-12 rounded-lg border-2 border-[#1A237E] flex items-center justify-center mb-4">
                <Target size={24} weight="bold" className="text-[#1A237E]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A237E] mb-2 font-heading">Interactive Games</h3>
              <p className="text-base font-medium text-[#1A237E]/80">Learn through Spin the Wheel, Snake & Ladder, and Card games</p>
            </div>
            <div className="neo-card">
              <div className="bg-[#29B6F6] w-12 h-12 rounded-lg border-2 border-[#1A237E] flex items-center justify-center mb-4">
                <Trophy size={24} weight="bold" className="text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A237E] mb-2 font-heading">Earn Badges</h3>
              <p className="text-base font-medium text-[#1A237E]/80">Track progress and unlock achievements as you learn</p>
            </div>
            <div className="neo-card">
              <div className="bg-[#FFD54F] w-12 h-12 rounded-lg border-2 border-[#1A237E] flex items-center justify-center mb-4">
                <GraduationCap size={24} weight="bold" className="text-[#1A237E]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A237E] mb-2 font-heading">Multilingual</h3>
              <p className="text-base font-medium text-[#1A237E]/80">Learn in English or Hindi for better understanding</p>
            </div>
          </div>
        </div>
      </section>

      {/* Institutions Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#1A237E] mb-12 text-center font-heading">
            Explore by Institution
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="neo-card group cursor-pointer">
              <img 
                src="https://images.unsplash.com/photo-1760872645959-98d5fdb49287?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwYXJsaWFtZW50JTIwYnVpbGRpbmd8ZW58MHx8fHwxNzc1NTMzNzAwfDA&ixlib=rb-4.1.0&q=85"
                alt="Legislature"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A237E] mb-2 font-heading">Legislature</h3>
              <p className="text-base font-medium text-[#1A237E]/80">Parliament, Lok Sabha, Rajya Sabha</p>
            </div>
            <div className="neo-card group cursor-pointer">
              <div className="w-full h-48 bg-[#FF6B35] rounded-lg mb-4 flex items-center justify-center border-2 border-[#1A237E]">
                <Users size={64} weight="bold" className="text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A237E] mb-2 font-heading">Executive</h3>
              <p className="text-base font-medium text-[#1A237E]/80">President, Prime Minister, Council</p>
            </div>
            <div className="neo-card group cursor-pointer">
              <div className="w-full h-48 bg-[#1A237E] rounded-lg mb-4 flex items-center justify-center">
                <Star size={64} weight="bold" className="text-[#FFD54F]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A237E] mb-2 font-heading">Judiciary</h3>
              <p className="text-base font-medium text-[#1A237E]/80">Supreme Court, High Courts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    </div>
  );
}
