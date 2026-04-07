import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API } from '../contexts/AuthContext';
import { ArrowLeft, Cube } from '@phosphor-icons/react';
import axios from 'axios';
import { toast } from 'sonner';

export default function SnakeLadderGame() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [articles, setArticles] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [diceValue, setDiceValue] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [score, setScore] = useState(0);

  const ladders = { 3: 12, 8: 18, 15: 25 };
  const snakes = { 20: 8, 23: 5, 28: 10 };

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await axios.get(`${API}/articles`);
      setArticles(response.data);
    } catch (error) {
      toast.error('Failed to fetch articles');
    }
  };

  const rollDice = () => {
    if (articles.length === 0) return;
    setRolling(true);
    
    const value = Math.floor(Math.random() * 6) + 1;
    setDiceValue(value);
    
    setTimeout(() => {
      let newPosition = currentPosition + value;
      if (newPosition > 30) newPosition = 30;
      
      setCurrentPosition(newPosition);
      setRolling(false);
      
      if (newPosition === 30) {
        toast.success('Congratulations! You won!');
        return;
      }
      
      const randomArticle = articles[Math.floor(Math.random() * articles.length)];
      setCurrentArticle(randomArticle);
      setShowQuestion(true);
    }, 1000);
  };

  const handleAnswer = async (isCorrect) => {
    let newPosition = currentPosition;
    
    if (isCorrect) {
      if (ladders[currentPosition]) {
        newPosition = ladders[currentPosition];
        toast.success(`Correct! Ladder up to ${newPosition}!`);
      } else {
        toast.success('Correct answer!');
      }
      const points = 30;
      setScore(score + points);
      
      try {
        await axios.post(
          `${API}/games/attempt`,
          {
            articleId: currentArticle.id,
            gameType: 'snake-ladder',
            score: points,
            isCorrect: true,
            timeTaken: 0
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error('Failed to save attempt');
      }
    } else {
      if (snakes[currentPosition]) {
        newPosition = snakes[currentPosition];
        toast.error(`Wrong! Snake down to ${newPosition}!`);
      } else {
        toast.error('Wrong answer!');
      }
    }
    
    setCurrentPosition(newPosition);
    setShowQuestion(false);
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
          <div className="flex gap-8">
            <div className="text-right">
              <p className="text-sm font-bold text-[#1A237E]/70">Position</p>
              <p className="text-3xl font-black text-[#29B6F6] font-heading">{currentPosition}/30</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-[#1A237E]/70">Score</p>
              <p className="text-3xl font-black text-[#FF6B35] font-heading">{score}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl sm:text-5xl font-black text-[#1A237E] mb-8 text-center font-heading">
          Snake & Ladder
        </h1>

        <div className="neo-card mb-8">
          <div className="grid grid-cols-10 gap-1 mb-8">
            {Array.from({ length: 30 }, (_, i) => i + 1).reverse().map((num) => (
              <div
                key={num}
                className={`aspect-square border-2 border-[#1A237E] rounded flex items-center justify-center font-bold ${
                  currentPosition === num
                    ? 'bg-[#FF6B35] text-white shadow-[3px_3px_0px_#1A237E]'
                    : ladders[num]
                    ? 'bg-[#00E676] text-[#1A237E]'
                    : snakes[num]
                    ? 'bg-[#FF6B35]/30 text-[#1A237E]'
                    : 'bg-white text-[#1A237E]'
                }`}
              >
                {num}
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center">
            <div className="neo-card bg-[#F0EFEA] w-24 h-24 flex items-center justify-center mb-4">
              <Cube size={48} weight="bold" className="text-[#1A237E]" />
              <span className="text-4xl font-black text-[#FF6B35] font-heading ml-2">{diceValue}</span>
            </div>
            
            <button
              data-testid="roll-dice-btn"
              onClick={rollDice}
              disabled={rolling || showQuestion}
              className="neo-btn-primary text-xl"
            >
              {rolling ? 'Rolling...' : 'Roll Dice'}
            </button>
          </div>
        </div>

        {showQuestion && currentArticle && (
          <div className="neo-card">
            <h2 className="text-2xl font-bold text-[#1A237E] mb-4 font-heading">Article {currentArticle.articleNumber}</h2>
            <p className="text-lg font-medium text-[#1A237E] mb-6">{currentArticle.simplifiedText}</p>
            <p className="text-base font-bold text-[#1A237E]/70 mb-4">Is this from {currentArticle.institution}?</p>
            
            <div className="flex gap-4">
              <button
                data-testid="answer-true-btn"
                onClick={() => handleAnswer(true)}
                className="neo-btn-primary flex-1"
              >
                True
              </button>
              <button
                data-testid="answer-false-btn"
                onClick={() => handleAnswer(false)}
                className="neo-btn-secondary flex-1"
              >
                False
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
