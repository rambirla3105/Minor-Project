import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, API } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Book, SignOut, ChartBar, GameController, MagnifyingGlass, FunnelSimple, GearSix, Cube, Cards, Star, Target, Gavel, Warning, Moon, Sun, UserCircle, GraduationCap, Translate } from '@phosphor-icons/react';
import axios from 'axios';
import { toast } from 'sonner';
import Footer from '../components/Footer';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, token, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ institution: '', difficulty: '', language: 'en' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [articles, filters, searchTerm]);

  const fetchArticles = async () => {
    try {
      const response = await axios.get(`${API}/articles`);
      setArticles(response.data);
      setFilteredArticles(response.data);
    } catch (error) {
      toast.error('Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...articles];
    
    if (filters.institution) {
      filtered = filtered.filter(a => a.institution === filters.institution);
    }
    if (filters.difficulty) {
      filtered = filtered.filter(a => a.difficulty === filters.difficulty);
    }
    if (filters.language) {
      filtered = filtered.filter(a => a.language === filters.language);
    }
    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.articleNumber.toString().includes(searchTerm) ||
        a.simplifiedText.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredArticles(filtered);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return 'bg-[#00E676]';
      case 'Medium': return 'bg-[#FFD54F]';
      case 'Hard': return 'bg-[#FF6B35]';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0A0A0B]">
      {/* Header */}
      <header className="bg-[#FDFBF7] dark:bg-[#0A0A0B] border-b-2 border-[#1A237E] dark:border-[#FFD54F] sticky top-0 z-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#FF6B35] p-2 rounded-lg border-2 border-[#1A237E] dark:border-[#FFD54F]">
              <Book size={32} weight="bold" className="text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black font-heading text-[#1A237E] dark:text-[#FDFBF7]">Sansthaein Aur Samvidhan</h1>
              <p className="text-sm font-medium text-[#1A237E]/70 dark:text-[#FDFBF7]/70">Welcome, {user?.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              data-testid="theme-toggle-btn"
              onClick={toggleTheme}
              className="neo-btn-secondary flex items-center gap-2"
            >
              {theme === 'light' ? <Moon size={20} weight="bold" /> : <Sun size={20} weight="bold" />}
            </button>
            <button
              data-testid="profile-btn"
              onClick={() => navigate('/profile')}
              className="neo-btn-secondary flex items-center gap-2"
            >
              <UserCircle size={20} weight="bold" />
              <span className="hidden sm:inline">Profile</span>
            </button>
            <button
              data-testid="games-menu-btn"
              onClick={() => navigate('/games/spin-wheel')}
              className="neo-btn-secondary flex items-center gap-2"
            >
              <GameController size={20} weight="bold" />
              <span className="hidden sm:inline">Games</span>
            </button>
            <button
              data-testid="analytics-btn"
              onClick={() => navigate('/analytics')}
              className="neo-btn-secondary flex items-center gap-2"
            >
              <ChartBar size={20} weight="bold" />
              <span className="hidden sm:inline">Analytics</span>
            </button>
            <button
              data-testid="learn-btn"
              onClick={() => navigate('/learn')}
              className="neo-btn-secondary flex items-center gap-2"
            >
              <GraduationCap size={20} weight="bold" />
              <span className="hidden sm:inline">Learn</span>
            </button>
            {isAdmin && (
              <button
                data-testid="admin-panel-btn"
                onClick={() => navigate('/admin')}
                className="neo-btn-primary flex items-center gap-2"
              >
                <GearSix size={20} weight="bold" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}
            <button
              data-testid="logout-btn"
              onClick={handleLogout}
              className="bg-transparent text-[#1A237E] font-bold border-2 border-[#1A237E] rounded-lg px-4 py-2 hover:bg-[#1A237E] hover:text-white transition-all"
            >
              <SignOut size={20} weight="bold" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Stats */}
        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          <div className="neo-card dark:bg-[#1A1A1B] dark:border-[#FFD54F]">
            <h3 className="text-lg font-bold text-[#1A237E]/70 dark:text-[#FDFBF7]/70 mb-2">Total Score</h3>
            <p className="text-4xl font-black text-[#FF6B35] font-heading">{user?.totalScore || 0}</p>
          </div>
          <div className="neo-card dark:bg-[#1A1A1B] dark:border-[#FFD54F]">
            <h3 className="text-lg font-bold text-[#1A237E]/70 dark:text-[#FDFBF7]/70 mb-2">Articles Completed</h3>
            <p className="text-4xl font-black text-[#00E676] font-heading">{user?.completedArticles?.length || 0}</p>
          </div>
          <div className="neo-card dark:bg-[#1A1A1B] dark:border-[#FFD54F]">
            <h3 className="text-lg font-bold text-[#1A237E]/70 dark:text-[#FDFBF7]/70 mb-2">Badges Earned</h3>
            <p className="text-4xl font-black text-[#29B6F6] font-heading">{user?.badges?.length || 0}</p>
          </div>
        </div>

        {/* Games Section */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A237E] dark:text-[#FDFBF7] mb-6 font-heading">
            Play Games
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <button
              onClick={() => navigate('/games/quiz')}
              className="neo-card dark:bg-[#1A1A1B] dark:border-[#FFD54F] hover:-translate-y-2 transition-transform text-left group"
              data-testid="game-quiz"
            >
              <Target size={48} weight="bold" className="text-[#FF6B35] mb-3" />
              <h3 className="text-xl font-bold text-[#1A237E] dark:text-[#FDFBF7] mb-2 font-heading">Quiz Challenge</h3>
              <p className="text-sm text-[#1A237E]/70 dark:text-[#FDFBF7]/70">Test your knowledge with multiple choice questions</p>
            </button>
            
            <button
              onClick={() => navigate('/games/spin-wheel')}
              className="neo-card dark:bg-[#1A1A1B] dark:border-[#FFD54F] hover:-translate-y-2 transition-transform text-left group"
              data-testid="game-spin-wheel"
            >
              <Star size={48} weight="bold" className="text-[#FFD54F] mb-3" />
              <h3 className="text-xl font-bold text-[#1A237E] dark:text-[#FDFBF7] mb-2 font-heading">Spin the Wheel</h3>
              <p className="text-sm text-[#1A237E]/70 dark:text-[#FDFBF7]/70">Spin and answer random article questions</p>
            </button>
            
            <button
              onClick={() => navigate('/games/snake-ladder')}
              className="neo-card dark:bg-[#1A1A1B] dark:border-[#FFD54F] hover:-translate-y-2 transition-transform text-left group"
              data-testid="game-snake-ladder"
            >
              <Cube size={48} weight="bold" className="text-[#00E676] mb-3" />
              <h3 className="text-xl font-bold text-[#1A237E] dark:text-[#FDFBF7] mb-2 font-heading">Snake & Ladder</h3>
              <p className="text-sm text-[#1A237E]/70 dark:text-[#FDFBF7]/70">Climb ladders and avoid snakes on the board</p>
            </button>
            
            <button
              onClick={() => navigate('/games/card')}
              className="neo-card dark:bg-[#1A1A1B] dark:border-[#FFD54F] hover:-translate-y-2 transition-transform text-left group"
              data-testid="game-card"
            >
              <Cards size={48} weight="bold" className="text-[#29B6F6] mb-3" />
              <h3 className="text-xl font-bold text-[#1A237E] dark:text-[#FDFBF7] mb-2 font-heading">Memory Cards</h3>
              <p className="text-sm text-[#1A237E]/70 dark:text-[#FDFBF7]/70">Match articles with their institutions</p>
            </button>
            
            <button
              onClick={() => navigate('/games/be-the-judge')}
              className="neo-card dark:bg-[#1A1A1B] dark:border-[#FFD54F] hover:-translate-y-2 transition-transform text-left group"
              data-testid="game-be-judge"
            >
              <Gavel size={48} weight="bold" className="text-[#FF6B35] mb-3" />
              <h3 className="text-xl font-bold text-[#1A237E] dark:text-[#FDFBF7] mb-2 font-heading">Be The Judge</h3>
              <p className="text-sm text-[#1A237E]/70 dark:text-[#FDFBF7]/70">Apply the right article to legal scenarios</p>
            </button>
            
            <button
              onClick={() => navigate('/games/choose-violation')}
              className="neo-card dark:bg-[#1A1A1B] dark:border-[#FFD54F] hover:-translate-y-2 transition-transform text-left group"
              data-testid="game-violation"
            >
              <Warning size={48} weight="bold" className="text-[#FFD54F] mb-3" />
              <h3 className="text-xl font-bold text-[#1A237E] dark:text-[#FDFBF7] mb-2 font-heading">Choose Violation</h3>
              <p className="text-sm text-[#1A237E]/70 dark:text-[#FDFBF7]/70">Identify all constitutional violations</p>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="neo-card mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FunnelSimple size={24} weight="bold" className="text-[#1A237E]" />
            <h2 className="text-xl font-bold text-[#1A237E] font-heading">Filter Articles</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-bold uppercase tracking-[0.2em] text-[#1A237E]/70 mb-2">Search</label>
              <div className="relative">
                <MagnifyingGlass size={20} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1A237E]/40" />
                <input
                  data-testid="search-input"
                  type="text"
                  placeholder="Article number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="neo-input w-full pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold uppercase tracking-[0.2em] text-[#1A237E]/70 mb-2">Institution</label>
              <select
                data-testid="institution-filter"
                value={filters.institution}
                onChange={(e) => setFilters({ ...filters, institution: e.target.value })}
                className="neo-input w-full"
              >
                <option value="">All</option>
                <option value="Legislature">Legislature</option>
                <option value="Executive">Executive</option>
                <option value="Judiciary">Judiciary</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold uppercase tracking-[0.2em] text-[#1A237E]/70 mb-2">Difficulty</label>
              <select
                data-testid="difficulty-filter"
                value={filters.difficulty}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                className="neo-input w-full"
              >
                <option value="">All</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold uppercase tracking-[0.2em] text-[#1A237E]/70 mb-2">Language</label>
              <select
                data-testid="language-filter"
                value={filters.language}
                onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                className="neo-input w-full"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                data-testid="clear-filters-btn"
                onClick={() => {
                  setFilters({ institution: '', difficulty: '', language: 'en' });
                  setSearchTerm('');
                }}
                className="neo-btn-secondary w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A237E] mb-6 font-heading">
            Constitutional Articles ({filteredArticles.length})
          </h2>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-xl font-bold text-[#1A237E]">Loading articles...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="neo-card text-center py-12">
              <p className="text-xl font-bold text-[#1A237E]">No articles found</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/article/${article.id}`}
                  data-testid={`article-card-${article.articleNumber}`}
                  className="neo-card cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-3xl font-black text-[#FF6B35] font-heading">Art. {article.articleNumber}</span>
                    <span className={`${getDifficultyColor(article.difficulty)} text-[#1A237E] font-bold text-xs px-3 py-1 rounded-full border-2 border-[#1A237E]`}>
                      {article.difficulty}
                    </span>
                  </div>
                  <div className="inline-block bg-[#29B6F6] text-white font-bold text-xs px-3 py-1 rounded-full border-2 border-[#1A237E] mb-3">
                    {article.institution}
                  </div>
                  <p className="text-base font-medium text-[#1A237E]/80 leading-relaxed line-clamp-3">
                    {article.simplifiedText}
                  </p>
                  <div className="mt-4 text-[#FF6B35] font-bold group-hover:underline">
                    Read More →
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
