import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API } from '../contexts/AuthContext';
import { ArrowLeft, Gavel, CheckCircle, XCircle } from '@phosphor-icons/react';
import axios from 'axios';
import { toast } from 'sonner';

export default function BeTheJudgeGame() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [articles, setArticles] = useState([]);
  const [currentCase, setCurrentCase] = useState(0);
  const [cases, setCases] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await axios.get(`${API}/articles`);
      setArticles(response.data);
      generateCases(response.data);
    } catch (error) {
      toast.error('Failed to fetch articles');
    }
  };

  const generateCases = (articlesData) => {
    const scenarios = [
      {
        scenario: "A citizen was arrested without being informed of the charges and denied legal representation for 48 hours.",
        correctArticle: 21,
        options: [21, 14, 19, 32]
      },
      {
        scenario: "A state government passed a law that contradicts a central law on the same subject.",
        correctArticle: 246,
        options: [246, 1, 79, 262]
      },
      {
        scenario: "A newspaper was shut down by the government for publishing articles critical of government policies.",
        correctArticle: 19,
        options: [19, 21, 14, 44]
      },
      {
        scenario: "A group of people were denied entry to a public temple based on their caste.",
        correctArticle: 14,
        options: [14, 19, 21, 51]
      },
      {
        scenario: "The President dissolved the state assembly and imposed President's Rule citing breakdown of constitutional machinery.",
        correctArticle: 356,
        options: [356, 52, 74, 123]
      }
    ];

    const generatedCases = scenarios.map(scenario => {
      const correctArticle = articlesData.find(a => a.articleNumber === scenario.correctArticle);
      const options = scenario.options
        .map(num => articlesData.find(a => a.articleNumber === num))
        .filter(a => a);
      
      return {
        ...scenario,
        correctArticleData: correctArticle,
        articleOptions: options
      };
    }).filter(c => c.correctArticleData && c.articleOptions.length === 4);

    setCases(generatedCases);
  };

  const handleJudgment = async (article) => {
    const currentCaseData = cases[currentCase];
    const isCorrect = article.articleNumber === currentCaseData.correctArticle;
    setSelectedArticle(article);
    setShowResult(true);

    if (isCorrect) {
      const points = 20;
      setScore(score + points);
      toast.success(`Correct! +${points} points`);

      try {
        await axios.post(
          `${API}/games/attempt`,
          {
            articleId: currentCaseData.correctArticleData.id,
            gameType: 'be-the-judge',
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
      toast.error('Incorrect judgment');
    }
  };

  const nextCase = () => {
    if (currentCase + 1 < cases.length) {
      setCurrentCase(currentCase + 1);
      setSelectedArticle(null);
      setShowResult(false);
    }
  };

  const restartGame = () => {
    setCurrentCase(0);
    setScore(0);
    setSelectedArticle(null);
    setShowResult(false);
  };

  if (cases.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <p className="text-2xl font-bold text-[#1A237E]">Loading cases...</p>
      </div>
    );
  }

  const currentCaseData = cases[currentCase];
  const isGameComplete = currentCase >= cases.length - 1 && showResult;

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
              <p className="text-sm font-bold text-[#1A237E]/70">Case</p>
              <p className="text-3xl font-black text-[#29B6F6] font-heading">{currentCase + 1}/{cases.length}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-[#1A237E]/70">Score</p>
              <p className="text-3xl font-black text-[#FF6B35] font-heading">{score}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Gavel size={48} weight="bold" className="text-[#FF6B35]" />
          <h1 className="text-4xl sm:text-5xl font-black text-[#1A237E] font-heading">
            Be The Judge
          </h1>
        </div>

        {isGameComplete ? (
          <div className="neo-card text-center">
            <h2 className="text-3xl font-black text-[#00E676] mb-4 font-heading">All Cases Judged!</h2>
            <p className="text-6xl font-black text-[#FF6B35] mb-4 font-heading">{score}/{cases.length * 20}</p>
            <p className="text-xl font-bold text-[#1A237E] mb-6">
              You made the right judgment {((score / (cases.length * 20)) * 100).toFixed(0)}% of the time!
            </p>
            <button
              data-testid="restart-game-btn"
              onClick={restartGame}
              className="neo-btn-primary"
            >
              Judge More Cases
            </button>
          </div>
        ) : (
          <>
            <div className="neo-card mb-6">
              <div className="bg-[#FFD54F] border-2 border-[#1A237E] rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-[#1A237E] mb-4 font-heading">Case Scenario</h2>
                <p className="text-lg font-medium text-[#1A237E] leading-relaxed">
                  {currentCaseData.scenario}
                </p>
              </div>

              <p className="text-base font-bold text-[#1A237E]/70 mb-4">
                As a judge, which constitutional article applies to this case?
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {currentCaseData.articleOptions.map((article) => {
                const isSelected = selectedArticle?.id === article.id;
                const isCorrect = article.articleNumber === currentCaseData.correctArticle;
                const showCorrect = showResult && isCorrect;
                const showIncorrect = showResult && isSelected && !isCorrect;

                return (
                  <button
                    key={article.id}
                    data-testid={`article-option-${article.articleNumber}`}
                    onClick={() => !showResult && handleJudgment(article)}
                    disabled={showResult}
                    className={`neo-card text-left transition-all ${
                      showCorrect
                        ? 'bg-[#00E676] border-[#00E676]'
                        : showIncorrect
                        ? 'bg-[#FF6B35] border-[#FF6B35]'
                        : isSelected
                        ? 'bg-[#29B6F6] border-[#29B6F6]'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-2xl font-black text-[#FF6B35] font-heading">
                          Art. {article.articleNumber}
                        </span>
                        <span className="ml-3 bg-[#29B6F6] text-white font-bold text-xs px-3 py-1 rounded-full border-2 border-[#1A237E]">
                          {article.institution}
                        </span>
                      </div>
                      {showCorrect && <CheckCircle size={32} weight="bold" className="text-white" />}
                      {showIncorrect && <XCircle size={32} weight="bold" className="text-white" />}
                    </div>
                    <p className="text-sm font-medium text-[#1A237E] line-clamp-3">
                      {article.simplifiedText}
                    </p>
                  </button>
                );
              })}
            </div>

            {showResult && (
              <div className="neo-card bg-[#F0EFEA] mb-4">
                <h3 className="text-xl font-bold text-[#1A237E] mb-2 font-heading">Explanation</h3>
                <p className="text-base font-medium text-[#1A237E] mb-3">
                  {currentCaseData.correctArticleData.example}
                </p>
                <button
                  data-testid="next-case-btn"
                  onClick={nextCase}
                  className="neo-btn-primary w-full"
                >
                  {currentCase + 1 < cases.length ? 'Next Case' : 'See Results'}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
