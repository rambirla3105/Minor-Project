import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Cube, Cards, Target, Gavel, Warning } from '@phosphor-icons/react';
import Footer from '../components/Footer';

export default function GamesHub() {
  const navigate = useNavigate();

  const games = [
    { name: 'Quiz Challenge', desc: 'Test your knowledge with multiple choice questions', icon: Target, color: 'text-[#FF6B35]', route: '/games/quiz' },
    { name: 'Spin the Wheel', desc: 'Spin and answer random article questions', icon: Star, color: 'text-[#FFD54F]', route: '/games/spin-wheel' },
    { name: 'Snake & Ladder', desc: 'Climb ladders and avoid snakes on the board', icon: Cube, color: 'text-[#00E676]', route: '/games/snake-ladder' },
    { name: 'Memory Cards', desc: 'Match articles with their institutions', icon: Cards, color: 'text-[#29B6F6]', route: '/games/card' },
    { name: 'Be The Judge', desc: 'Apply the right article to legal scenarios', icon: Gavel, color: 'text-[#FF6B35]', route: '/games/be-the-judge' },
    { name: 'Choose Violation', desc: 'Identify all constitutional violations', icon: Warning, color: 'text-[#FFD54F]', route: '/games/choose-violation' },
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
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-[#1A237E] dark:text-[#FDFBF7] mb-4 font-heading">
            Play Games
          </h1>
          <p className="text-lg text-[#1A237E]/70 dark:text-[#FDFBF7]/70">
            Choose a game to test your constitutional knowledge
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="games-hub-grid">
          {games.map((game) => (
            <button
              key={game.route}
              onClick={() => navigate(game.route)}
              className="neo-card dark:bg-[#1A1A1B] dark:border-[#FFD54F] hover:-translate-y-2 transition-transform text-left group"
              data-testid={`games-hub-${game.route.split('/').pop()}`}
            >
              <game.icon size={48} weight="bold" className={`${game.color} mb-3`} />
              <h3 className="text-xl font-bold text-[#1A237E] dark:text-[#FDFBF7] mb-2 font-heading">{game.name}</h3>
              <p className="text-sm text-[#1A237E]/70 dark:text-[#FDFBF7]/70">{game.desc}</p>
            </button>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
