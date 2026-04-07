import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API } from '../contexts/AuthContext';
import { ArrowLeft, Cards } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';

export default function CardGame() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [articles, setArticles] = useState([]);
  const [gameArticles, setGameArticles] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await axios.get(`${API}/articles`);
      const shuffled = response.data.sort(() => 0.5 - Math.random()).slice(0, 6);
      const cards = [
        ...shuffled.map((a, i) => ({ id: `q${i}`, type: 'question', article: a })),
        ...shuffled.map((a, i) => ({ id: `a${i}`, type: 'answer', article: a }))
      ].sort(() => 0.5 - Math.random());
      setArticles(response.data);
      setGameArticles(cards);
    } catch (error) {
      toast.error('Failed to fetch articles');
    }
  };

  const handleCardClick = async (card) => {
    if (flippedCards.length === 2 || flippedCards.includes(card.id) || matchedPairs.includes(card.article.id)) return;
    
    const newFlipped = [...flippedCards, card.id];
    setFlippedCards(newFlipped);
    
    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const card1 = gameArticles.find(c => c.id === newFlipped[0]);
      const card2 = gameArticles.find(c => c.id === newFlipped[1]);
      
      if (card1.article.id === card2.article.id && card1.type !== card2.type) {
        setMatchedPairs([...matchedPairs, card1.article.id]);
        const points = 40;
        setScore(score + points);
        toast.success('Match found! +40 points');
        
        try {
          await axios.post(
            `${API}/games/attempt`,
            {
              articleId: card1.article.id,
              gameType: 'card-game',
              score: points,
              isCorrect: true,
              timeTaken: moves
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (error) {
          console.error('Failed to save attempt');
        }
        
        setTimeout(() => setFlippedCards([]), 500);
      } else {
        setTimeout(() => setFlippedCards([]), 1000);
      }
    }
  };

  const resetGame = () => {
    fetchArticles();
    setFlippedCards([]);
    setMatchedPairs([]);
    setMoves(0);
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
              <p className="text-sm font-bold text-[#1A237E]/70">Moves</p>
              <p className="text-3xl font-black text-[#29B6F6] font-heading">{moves}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-[#1A237E]/70">Score</p>
              <p className="text-3xl font-black text-[#FF6B35] font-heading">{score}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-black text-[#1A237E] font-heading">
            Memory Card Game
          </h1>
          <button
            data-testid="reset-game-btn"
            onClick={resetGame}
            className="neo-btn-secondary"
          >
            Reset Game
          </button>
        </div>

        {matchedPairs.length === 6 && (
          <div className="neo-card mb-8 text-center">
            <h2 className="text-3xl font-black text-[#00E676] mb-2 font-heading">Congratulations!</h2>
            <p className="text-xl font-bold text-[#1A237E]">You completed the game in {moves} moves!</p>
          </div>
        )}

        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          {gameArticles.map((card) => {
            const isFlipped = flippedCards.includes(card.id) || matchedPairs.includes(card.article.id);
            
            return (
              <motion.div
                key={card.id}
                data-testid={`card-${card.id}`}
                onClick={() => handleCardClick(card)}
                className="card-game-item aspect-square cursor-pointer"
                style={{ perspective: '1000px' }}
                whileHover={{ scale: 1.05 }}
              >
                <div
                  className={`w-full h-full relative transition-transform duration-500 ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Back */}
                  <div className="absolute w-full h-full neo-card bg-[#FF6B35] flex items-center justify-center" style={{ backfaceVisibility: 'hidden' }}>
                    <Cards size={48} weight="bold" className="text-white" />
                  </div>
                  
                  {/* Front */}
                  <div 
                    className="absolute w-full h-full neo-card p-4 overflow-hidden"
                    style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                  >
                    {card.type === 'question' ? (
                      <div className="h-full flex flex-col justify-between">
                        <div className="bg-[#29B6F6] text-white font-bold text-xs px-2 py-1 rounded-full border-2 border-[#1A237E] w-fit">
                          Art. {card.article.articleNumber}
                        </div>
                        <p className="text-sm font-medium text-[#1A237E] line-clamp-4">
                          {card.article.simplifiedText}
                        </p>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-xl font-black text-[#FF6B35] text-center font-heading">
                          {card.article.institution}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
