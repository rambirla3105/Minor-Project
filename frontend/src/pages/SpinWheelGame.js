import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API } from '../contexts/AuthContext';
import { ArrowLeft, Star } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';

export default function SpinWheelGame() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [articles, setArticles] = useState([]);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    let timer;
    if (gameStarted && timeLeft > 0 && showQuestion) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && showQuestion) {
      handleSubmit(false);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameStarted, showQuestion]);

  const fetchArticles = async () => {
    try {
      const response = await axios.get(`${API}/articles`);
      setArticles(response.data);
    } catch (error) {
      toast.error('Failed to fetch articles');
    }
  };

  const spinWheel = () => {
    if (articles.length === 0) return;
    setSpinning(true);
    setShowQuestion(false);
    setSelectedAnswer(null);
    
    const randomRotation = 1440 + Math.random() * 720;
    setRotation(rotation + randomRotation);
    
    setTimeout(() => {
      const randomArticle = articles[Math.floor(Math.random() * articles.length)];
      setCurrentArticle(randomArticle);
      setSpinning(false);
      setShowQuestion(true);
      setTimeLeft(30);
      setGameStarted(true);
    }, 3000);
  };

  const handleSubmit = async (isCorrect) => {
    const points = isCorrect ? 50 : 0;
    setScore(score + points);
    
    try {
      await axios.post(
        `${API}/games/attempt`,
        {
          articleId: currentArticle.id,
          gameType: 'spin-wheel',
          score: points,
          isCorrect,
          timeTaken: 30 - timeLeft
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (isCorrect) {
        toast.success(`Correct! +${points} points`);
      } else {
        toast.error('Incorrect answer');
      }
    } catch (error) {
      toast.error('Failed to save attempt');
    }
    
    setShowQuestion(false);
    setGameStarted(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <header className="bg-[#FDFBF7] border-b-2 border-[#1A237E] sticky top-0 z-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <button
            data-testid="back-to-dashboard-btn"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-[#1A237E] font-bold hover:text-[#FF6B35] transition-colors"
          >
            <ArrowLeft size={24} weight="bold" />
            Back
          </button>
          <div className="text-right">
            <p className="text-sm font-bold text-[#1A237E]/70">Score</p>
            <p className="text-3xl font-black text-[#FF6B35] font-heading">{score}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl sm:text-5xl font-black text-[#1A237E] mb-8 text-center font-heading">
          Spin the Wheel
        </h1>

        <div className="neo-card mb-8">
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ rotate: rotation }}
              transition={{ duration: 3, ease: "easeOut" }}
              className="w-64 h-64 rounded-full border-8 border-[#1A237E] bg-gradient-to-br from-[#FF6B35] via-[#FFD54F] to-[#00E676] shadow-[8px_8px_0px_#1A237E] mb-8 flex items-center justify-center"
            >
              <Star size={64} weight="bold" className="text-white" />
            </motion.div>
            
            <button
              data-testid="spin-wheel-btn"
              onClick={spinWheel}
              disabled={spinning || showQuestion}
              className="neo-btn-primary text-xl"
            >
              {spinning ? 'Spinning...' : 'Spin the Wheel!'}
            </button>
          </div>
        </div>

        {showQuestion && currentArticle && (
          <div className="neo-card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#1A237E] font-heading">Article {currentArticle.articleNumber}</h2>
              <div className="bg-[#FFD54F] border-2 border-[#1A237E] px-4 py-2 rounded-full">
                <span className="text-xl font-black text-[#1A237E]">{timeLeft}s</span>
              </div>
            </div>
            
            <p className="text-lg font-medium text-[#1A237E] mb-6">
              {currentArticle.simplifiedText}
            </p>
            
            <p className="text-base font-bold text-[#1A237E]/70 mb-4">Which institution does this belong to?</p>
            
            <div className="grid gap-3 mb-6">
              {['Legislature', 'Executive', 'Judiciary'].map((option) => (
                <button
                  key={option}
                  data-testid={`answer-${option.toLowerCase()}`}
                  onClick={() => setSelectedAnswer(option)}
                  className={`p-4 border-2 border-[#1A237E] rounded-lg font-bold transition-all ${
                    selectedAnswer === option
                      ? 'bg-[#FF6B35] text-white shadow-[4px_4px_0px_#1A237E]'
                      : 'bg-white text-[#1A237E] hover:shadow-[4px_4px_0px_#1A237E]'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            
            <button
              data-testid="submit-answer-btn"
              onClick={() => handleSubmit(selectedAnswer === currentArticle.institution)}
              disabled={!selectedAnswer}
              className="neo-btn-primary w-full"
            >
              Submit Answer
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
