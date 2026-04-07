import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, API } from '../contexts/AuthContext';
import { ArrowLeft, Star, BookOpen, Lightbulb, Target, Gavel, Cards } from '@phosphor-icons/react';
import axios from 'axios';
import { toast } from 'sonner';

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simplifying, setSimplifying] = useState(false);
  const [aiSimplified, setAiSimplified] = useState('');

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const response = await axios.get(`${API}/articles/${id}`);
      setArticle(response.data);
    } catch (error) {
      toast.error('Failed to fetch article');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAISimplify = async () => {
    setSimplifying(true);
    try {
      const response = await axios.post(
        `${API}/articles/simplify`,
        { text: article.originalText, language: article.language },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAiSimplified(response.data.simplifiedText);
      toast.success('AI simplification generated!');
    } catch (error) {
      toast.error('Simplification failed');
    } finally {
      setSimplifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <p className="text-2xl font-bold text-[#1A237E]">Loading...</p>
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0A0A0B]">
      <header className="bg-[#FDFBF7] dark:bg-[#0A0A0B] border-b-2 border-[#1A237E] dark:border-[#FFD54F] sticky top-0 z-50 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            data-testid="back-to-dashboard-btn"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-[#1A237E] dark:text-[#FDFBF7] font-bold hover:text-[#FF6B35] transition-colors"
          >
            <ArrowLeft size={24} weight="bold" />
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="neo-card dark:bg-[#1A1A1B] dark:border-[#FFD54F] mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl sm:text-5xl font-black text-[#FF6B35] mb-2 font-heading">
                Article {article.articleNumber}
              </h1>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-[#29B6F6] text-white font-bold text-sm px-4 py-2 rounded-full border-2 border-[#1A237E]">
                  {article.institution}
                </span>
                <span className="bg-[#FFD54F] text-[#1A237E] font-bold text-sm px-4 py-2 rounded-full border-2 border-[#1A237E]">
                  {article.difficulty}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="neo-card mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={24} weight="bold" className="text-[#1A237E]" />
            <h2 className="text-2xl font-bold text-[#1A237E] font-heading">Original Text</h2>
          </div>
          <p className="text-base font-medium text-[#1A237E]/80 leading-relaxed italic border-l-4 border-[#FF6B35] pl-4">
            {article.originalText}
          </p>
        </div>

        <div className="neo-card mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={24} weight="bold" className="text-[#FFD54F]" />
            <h2 className="text-2xl font-bold text-[#1A237E] font-heading">Simplified Explanation</h2>
          </div>
          <p className="text-lg font-medium text-[#1A237E] leading-relaxed">
            {article.simplifiedText}
          </p>
        </div>

        <div className="neo-card mb-8">
          <h2 className="text-2xl font-bold text-[#1A237E] mb-4 font-heading">Real-World Example</h2>
          <p className="text-base font-medium text-[#1A237E]/80 leading-relaxed">
            {article.example}
          </p>
        </div>

        <div className="neo-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Star size={24} weight="bold" className="text-[#FF6B35]" />
              <h2 className="text-2xl font-bold text-[#1A237E] font-heading">AI Simplification</h2>
            </div>
            <button
              data-testid="ai-simplify-btn"
              onClick={handleAISimplify}
              className="neo-btn-primary"
              disabled={simplifying}
            >
              {simplifying ? 'Generating...' : 'Generate AI Simplification'}
            </button>
          </div>
          {aiSimplified ? (
            <p className="text-lg font-medium text-[#1A237E] leading-relaxed bg-[#F0EFEA] p-4 rounded-lg border-2 border-[#1A237E]">
              {aiSimplified}
            </p>
          ) : (
            <p className="text-base font-medium text-[#1A237E]/60 italic">
              Click the button above to get an AI-powered simplification of this article.
            </p>
          )}
        </div>

        {/* Game Challenges for This Article */}
        <div className="neo-card dark:bg-[#1A1A1B] dark:border-[#FFD54F] mt-8">
          <h2 className="text-2xl font-bold text-[#1A237E] dark:text-[#FDFBF7] mb-4 font-heading">Practice with Games</h2>
          <p className="text-base text-[#1A237E]/70 dark:text-[#FDFBF7]/70 mb-6">
            Test your understanding of Article {article.articleNumber} through these interactive games:
          </p>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate(`/games/quiz?article=${article.id}`)}
              className="neo-card dark:bg-[#0A0A0B] dark:border-[#FFD54F] hover:-translate-y-1 transition-transform text-left group"
              data-testid="article-quiz-btn"
            >
              <Target size={40} weight="bold" className="text-[#FF6B35] mb-2" />
              <h3 className="text-lg font-bold text-[#1A237E] dark:text-[#FDFBF7] mb-1 font-heading">Quick Quiz</h3>
              <p className="text-sm text-[#1A237E]/70 dark:text-[#FDFBF7]/70">
                Test yourself with questions about this article
              </p>
            </button>
            
            <button
              onClick={() => navigate(`/games/be-the-judge?article=${article.id}`)}
              className="neo-card dark:bg-[#0A0A0B] dark:border-[#FFD54F] hover:-translate-y-1 transition-transform text-left group"
              data-testid="article-judge-btn"
            >
              <Gavel size={40} weight="bold" className="text-[#29B6F6] mb-2" />
              <h3 className="text-lg font-bold text-[#1A237E] dark:text-[#FDFBF7] mb-1 font-heading">Be The Judge</h3>
              <p className="text-sm text-[#1A237E]/70 dark:text-[#FDFBF7]/70">
                Apply this article to real-world scenarios
              </p>
            </button>
            
            <button
              onClick={() => navigate('/games/spin-wheel')}
              className="neo-card dark:bg-[#0A0A0B] dark:border-[#FFD54F] hover:-translate-y-1 transition-transform text-left group"
              data-testid="article-spin-btn"
            >
              <Star size={40} weight="bold" className="text-[#FFD54F] mb-2" />
              <h3 className="text-lg font-bold text-[#1A237E] dark:text-[#FDFBF7] mb-1 font-heading">Spin the Wheel</h3>
              <p className="text-sm text-[#1A237E]/70 dark:text-[#FDFBF7]/70">
                Practice with random article challenges
              </p>
            </button>
            
            <button
              onClick={() => navigate('/games/card')}
              className="neo-card dark:bg-[#0A0A0B] dark:border-[#FFD54F] hover:-translate-y-1 transition-transform text-left group"
              data-testid="article-memory-btn"
            >
              <Cards size={40} weight="bold" className="text-[#00E676] mb-2" />
              <h3 className="text-lg font-bold text-[#1A237E] dark:text-[#FDFBF7] mb-1 font-heading">Memory Game</h3>
              <p className="text-sm text-[#1A237E]/70 dark:text-[#FDFBF7]/70">
                Match articles with their institutions
              </p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
