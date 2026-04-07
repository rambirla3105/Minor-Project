import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API } from '../contexts/AuthContext';
import { ArrowLeft, Translate } from '@phosphor-icons/react';
import axios from 'axios';
import { toast } from 'sonner';
import Footer from '../components/Footer';

export default function LearnPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstitution, setSelectedInstitution] = useState('Legislature');
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    fetchArticles();
  }, [language]);

  const fetchArticles = async () => {
    try {
      const response = await axios.get(`${API}/articles?language=${language}`);
      setArticles(response.data);
    } catch (error) {
      toast.error('Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  };

  const getArticlesByInstitution = (institution) => {
    return articles.filter(a => a.institution === institution).sort((a, b) => a.articleNumber - b.articleNumber);
  };

  const institutions = [
    { name: 'Legislature', description: 'Parliament, Lok Sabha, Rajya Sabha', color: 'bg-[#FF6B35]' },
    { name: 'Executive', description: 'President, Prime Minister, Council of Ministers', color: 'bg-[#29B6F6]' },
    { name: 'Judiciary', description: 'Supreme Court, High Courts, Lower Courts', color: 'bg-[#00E676]' }
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0A0A0B]">
      <header className="bg-[#FDFBF7] dark:bg-[#0A0A0B] border-b-2 border-[#1A237E] dark:border-[#FFD54F] sticky top-0 z-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <button
            data-testid="back-to-dashboard-btn"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-[#1A237E] dark:text-[#FDFBF7] font-bold hover:text-[#FF6B35] transition-colors"
          >
            <ArrowLeft size={24} weight="bold" />
            Back to Dashboard
          </button>
          <button
            data-testid="language-toggle-btn"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="neo-btn-secondary flex items-center gap-2"
          >
            <Translate size={20} weight="bold" />
            {language === 'en' ? 'हिंदी' : 'English'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-[#1A237E] dark:text-[#FDFBF7] mb-4 font-heading">
            Learn by Institution
          </h1>
          <p className="text-lg text-[#1A237E]/70 dark:text-[#FDFBF7]/70">
            Explore constitutional articles organized by the three pillars of Indian democracy
          </p>
        </div>

        {/* Institution Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto">
          {institutions.map((inst) => (
            <button
              key={inst.name}
              data-testid={`institution-tab-${inst.name.toLowerCase()}`}
              onClick={() => setSelectedInstitution(inst.name)}
              className={`neo-card dark:bg-[#1A1A1B] dark:border-[#FFD54F] flex-shrink-0 transition-all ${
                selectedInstitution === inst.name ? inst.color + ' border-4' : ''
              }`}
            >
              <h3 className="text-xl font-bold text-[#1A237E] dark:text-[#FDFBF7] mb-1 font-heading">{inst.name}</h3>
              <p className="text-sm text-[#1A237E]/70 dark:text-[#FDFBF7]/70">{inst.description}</p>
            </button>
          ))}
        </div>

        {/* Articles List */}
        <div className="neo-card dark:bg-[#1A1A1B] dark:border-[#FFD54F]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#1A237E] dark:text-[#FDFBF7] font-heading">
              {selectedInstitution} Articles ({getArticlesByInstitution(selectedInstitution).length})
            </h2>
          </div>

          {loading ? (
            <p className="text-center py-8 text-[#1A237E] dark:text-[#FDFBF7]">Loading articles...</p>
          ) : (
            <div className="space-y-4">
              {getArticlesByInstitution(selectedInstitution).map((article) => (
                <div
                  key={article.id}
                  className="bg-[#F0EFEA] dark:bg-[#0A0A0B] border-2 border-[#1A237E] dark:border-[#FFD54F] rounded-lg p-6 hover:shadow-[4px_4px_0px_#1A237E] dark:hover:shadow-[4px_4px_0px_#FFD54F] transition-all cursor-pointer"
                  onClick={() => navigate(`/article/${article.id}`)}
                  data-testid={`learn-article-${article.articleNumber}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-2xl font-black text-[#FF6B35] font-heading">
                      Article {article.articleNumber}
                    </h3>
                    <span className="bg-[#FFD54F] text-[#1A237E] font-bold text-xs px-3 py-1 rounded-full border-2 border-[#1A237E] dark:border-[#FFD54F]">
                      {article.difficulty}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-bold text-[#1A237E]/70 dark:text-[#FDFBF7]/70 mb-2">Original Text:</p>
                    <p className="text-base font-medium text-[#1A237E] dark:text-[#FDFBF7] italic">
                      {article.originalText}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#1A237E]/70 dark:text-[#FDFBF7]/70 mb-2">Simplified:</p>
                    <p className="text-base font-medium text-[#1A237E] dark:text-[#FDFBF7]">
                      {article.simplifiedText}
                    </p>
                  </div>

                  <div className="mt-4 text-[#FF6B35] font-bold hover:underline">
                    Click to read more →
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
