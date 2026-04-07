import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API } from '../contexts/AuthContext';
import { ArrowLeft, CheckCircle, XCircle } from '@phosphor-icons/react';
import axios from 'axios';
import { toast } from 'sonner';

export default function QuizGame() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [articles, setArticles] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizArticles, setQuizArticles] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions] = useState(10);
  const [timeLeft, setTimeLeft] = useState(20);

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    let timer;
    if (quizArticles.length > 0 && currentQuestion < quizArticles.length && timeLeft > 0 && !showResult) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && !showResult) {
      handleAnswer(null);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, showResult, currentQuestion]);

  const fetchArticles = async () => {
    try {
      const response = await axios.get(`${API}/articles`);
      const shuffled = response.data.sort(() => 0.5 - Math.random()).slice(0, totalQuestions);
      setArticles(response.data);
      setQuizArticles(shuffled.map(article => ({
        ...article,
        options: generateOptions(article, response.data)
      })));
    } catch (error) {
      toast.error('Failed to fetch articles');
    }
  };

  const generateOptions = (correctArticle, allArticles) => {
    const options = [correctArticle.simplifiedText];
    const otherArticles = allArticles.filter(a => a.id !== correctArticle.id);
    
    while (options.length < 4 && otherArticles.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherArticles.length);
      const option = otherArticles[randomIndex].simplifiedText;
      if (!options.includes(option)) {
        options.push(option);
      }
      otherArticles.splice(randomIndex, 1);
    }
    
    return options.sort(() => 0.5 - Math.random());
  };

  const handleAnswer = async (answer) => {
    const isCorrect = answer === quizArticles[currentQuestion].simplifiedText;
    setSelectedAnswer(answer);
    setShowResult(true);
    
    if (isCorrect) {
      const points = 10;
      setScore(score + points);
      
      try {
        await axios.post(
          `${API}/games/attempt`,
          {
            articleId: quizArticles[currentQuestion].id,
            gameType: 'quiz',
            score: points,
            isCorrect: true,
            timeTaken: 20 - timeLeft
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error('Failed to save attempt');
      }
    }
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 < quizArticles.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(20);
    }
  };

  const restartQuiz = () => {
    fetchArticles();
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(20);
  };

  if (quizArticles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <p className="text-2xl font-bold text-[#1A237E]">Loading quiz...</p>
      </div>
    );
  }

  const currentArticle = quizArticles[currentQuestion];
  const isQuizComplete = currentQuestion >= quizArticles.length - 1 && showResult;

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
              <p className="text-sm font-bold text-[#1A237E]/70">Question</p>
              <p className="text-3xl font-black text-[#29B6F6] font-heading">{currentQuestion + 1}/{totalQuestions}</p>
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
          Constitution Quiz
        </h1>

        {isQuizComplete ? (
          <div className="neo-card text-center">
            <h2 className="text-3xl font-black text-[#00E676] mb-4 font-heading">Quiz Complete!</h2>
            <p className="text-6xl font-black text-[#FF6B35] mb-4 font-heading">{score}/{totalQuestions * 10}</p>
            <p className="text-xl font-bold text-[#1A237E] mb-6">Accuracy: {((score / (totalQuestions * 10)) * 100).toFixed(0)}%</p>
            <button
              data-testid="restart-quiz-btn"
              onClick={restartQuiz}
              className="neo-btn-primary"
            >
              Play Again
            </button>
          </div>
        ) : (
          <div className="neo-card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#1A237E] font-heading">
                Article {currentArticle.articleNumber}
              </h2>
              <div className="bg-[#FFD54F] border-2 border-[#1A237E] px-4 py-2 rounded-full">
                <span className="text-xl font-black text-[#1A237E]">{timeLeft}s</span>
              </div>
            </div>

            <div className="bg-[#F0EFEA] border-2 border-[#1A237E] rounded-lg p-4 mb-6">
              <p className="text-sm font-bold text-[#1A237E]/70 mb-2">Institution: {currentArticle.institution}</p>
              <p className="text-lg font-bold text-[#1A237E] mb-4">
                Which statement describes Article {currentArticle.articleNumber}?
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {currentArticle.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentArticle.simplifiedText;
                const showCorrect = showResult && isCorrect;
                const showIncorrect = showResult && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    data-testid={`option-${index}`}
                    onClick={() => !showResult && handleAnswer(option)}
                    disabled={showResult}
                    className={`w-full p-4 border-2 border-[#1A237E] rounded-lg font-bold text-left transition-all ${
                      showCorrect
                        ? 'bg-[#00E676] text-white shadow-[4px_4px_0px_#1A237E]'
                        : showIncorrect
                        ? 'bg-[#FF6B35] text-white shadow-[4px_4px_0px_#1A237E]'
                        : isSelected
                        ? 'bg-[#29B6F6] text-white shadow-[4px_4px_0px_#1A237E]'
                        : 'bg-white text-[#1A237E] hover:shadow-[4px_4px_0px_#1A237E]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex-1">{option}</span>
                      {showCorrect && <CheckCircle size={24} weight="bold" />}
                      {showIncorrect && <XCircle size={24} weight="bold" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {showResult && (
              <button
                data-testid="next-question-btn"
                onClick={nextQuestion}
                className="neo-btn-primary w-full"
              >
                {currentQuestion + 1 < quizArticles.length ? 'Next Question' : 'See Results'}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
