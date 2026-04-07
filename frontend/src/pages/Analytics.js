import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API } from '../contexts/AuthContext';
import { ArrowLeft, Trophy, Target, Star, TrendUp } from '@phosphor-icons/react';
import axios from 'axios';
import { toast } from 'sonner';

export default function Analytics() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/analytics/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <p className="text-2xl font-bold text-[#1A237E]">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <header className="bg-[#FDFBF7] border-b-2 border-[#1A237E] sticky top-0 z-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            data-testid="back-to-dashboard-btn"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-[#1A237E] font-bold hover:text-[#FF6B35] transition-colors"
          >
            <ArrowLeft size={24} weight="bold" />
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl sm:text-5xl font-black text-[#1A237E] mb-8 font-heading">
          Your Analytics
        </h1>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="neo-card">
            <div className="flex items-center gap-3 mb-2">
              <Target size={32} weight="bold" className="text-[#FF6B35]" />
              <h3 className="text-lg font-bold text-[#1A237E]/70">Accuracy</h3>
            </div>
            <p className="text-4xl font-black text-[#FF6B35] font-heading">{analytics?.accuracy || 0}%</p>
          </div>
          <div className="neo-card">
            <div className="flex items-center gap-3 mb-2">
              <TrendUp size={32} weight="bold" className="text-[#00E676]" />
              <h3 className="text-lg font-bold text-[#1A237E]/70">Total Score</h3>
            </div>
            <p className="text-4xl font-black text-[#00E676] font-heading">{analytics?.totalScore || 0}</p>
          </div>
          <div className="neo-card">
            <div className="flex items-center gap-3 mb-2">
              <Star size={32} weight="bold" className="text-[#29B6F6]" />
              <h3 className="text-lg font-bold text-[#1A237E]/70">Completed</h3>
            </div>
            <p className="text-4xl font-black text-[#29B6F6] font-heading">{analytics?.completedArticles || 0}/{analytics?.totalArticles || 0}</p>
          </div>
          <div className="neo-card">
            <div className="flex items-center gap-3 mb-2">
              <Trophy size={32} weight="bold" className="text-[#FFD54F]" />
              <h3 className="text-lg font-bold text-[#1A237E]/70">Badges</h3>
            </div>
            <p className="text-4xl font-black text-[#FFD54F] font-heading">{analytics?.badges?.length || 0}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="neo-card">
            <h2 className="text-2xl font-bold text-[#1A237E] mb-6 font-heading">Institution-wise Strength</h2>
            <div className="space-y-4">
              {Object.entries(analytics?.institutionWiseStrength || {}).map(([institution, count]) => (
                <div key={institution}>
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-[#1A237E]">{institution}</span>
                    <span className="font-bold text-[#FF6B35]">{count} articles</span>
                  </div>
                  <div className="h-4 bg-[#F0EFEA] border-2 border-[#1A237E] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#FF6B35] transition-all duration-500"
                      style={{ width: `${(count / (analytics?.totalArticles || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="neo-card">
            <h2 className="text-2xl font-bold text-[#1A237E] mb-6 font-heading">Your Badges</h2>
            {analytics?.badges && analytics.badges.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {analytics.badges.map((badge, index) => (
                  <div key={index} className="badge flex items-center gap-2">
                    <Trophy size={20} weight="bold" />
                    {badge}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-base font-medium text-[#1A237E]/60 italic">No badges earned yet. Keep learning!</p>
            )}
          </div>
        </div>

        <div className="neo-card mt-8">
          <h2 className="text-2xl font-bold text-[#1A237E] mb-6 font-heading">Recent Attempts</h2>
          {analytics?.recentAttempts && analytics.recentAttempts.length > 0 ? (
            <div className="space-y-3">
              {analytics.recentAttempts.map((attempt, index) => (
                <div key={index} className="bg-[#F0EFEA] border-2 border-[#1A237E] rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-[#1A237E]">Article {attempt.articleNumber}</p>
                    <p className="text-sm text-[#1A237E]/70">{attempt.gameType}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#FF6B35]">+{attempt.score} pts</p>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full border-2 border-[#1A237E] ${attempt.isCorrect ? 'bg-[#00E676]' : 'bg-[#FF6B35]'} text-[#1A237E]`}>
                      {attempt.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-base font-medium text-[#1A237E]/60 italic">No recent attempts. Start playing games!</p>
          )}
        </div>
      </main>
    </div>
  );
}
