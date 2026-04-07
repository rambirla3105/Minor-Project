import React from 'react';
import { Link } from 'react-router-dom';
import { Book, GithubLogo, LinkedinLogo, TwitterLogo } from '@phosphor-icons/react';

export default function Footer() {
  return (
    <footer className="bg-[#FDFBF7] dark:bg-[#0A0A0B] border-t-2 border-[#1A237E] dark:border-[#FFD54F] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#FF6B35] p-2 rounded-lg border-2 border-[#1A237E] dark:border-[#FFD54F]">
                <Book size={32} weight="bold" className="text-white" />
              </div>
              <h3 className="text-xl font-black font-heading text-[#1A237E] dark:text-[#FDFBF7]">Sansthaein Aur Samvidhan</h3>
            </div>
            <p className="text-base text-[#1A237E]/70 dark:text-[#FDFBF7]/70 mb-4">
              Master Indian Constitution through gamified learning. Simplify complex articles and learn through interactive games.
            </p>
            <p className="text-sm font-bold text-[#FF6B35]">
              Developed by E-G09 © 2025
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-[#1A237E] dark:text-[#FDFBF7] mb-4 font-heading">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-[#1A237E]/70 dark:text-[#FDFBF7]/70 hover:text-[#FF6B35] transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/learn" className="text-[#1A237E]/70 dark:text-[#FDFBF7]/70 hover:text-[#FF6B35] transition-colors">
                  Learn by Institution
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="text-[#1A237E]/70 dark:text-[#FDFBF7]/70 hover:text-[#FF6B35] transition-colors">
                  Analytics
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-[#1A237E]/70 dark:text-[#FDFBF7]/70 hover:text-[#FF6B35] transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Games */}
          <div>
            <h4 className="text-lg font-bold text-[#1A237E] dark:text-[#FDFBF7] mb-4 font-heading">Games</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/games/quiz" className="text-[#1A237E]/70 dark:text-[#FDFBF7]/70 hover:text-[#FF6B35] transition-colors">
                  Quiz Challenge
                </Link>
              </li>
              <li>
                <Link to="/games/spin-wheel" className="text-[#1A237E]/70 dark:text-[#FDFBF7]/70 hover:text-[#FF6B35] transition-colors">
                  Spin the Wheel
                </Link>
              </li>
              <li>
                <Link to="/games/snake-ladder" className="text-[#1A237E]/70 dark:text-[#FDFBF7]/70 hover:text-[#FF6B35] transition-colors">
                  Snake & Ladder
                </Link>
              </li>
              <li>
                <Link to="/games/card" className="text-[#1A237E]/70 dark:text-[#FDFBF7]/70 hover:text-[#FF6B35] transition-colors">
                  Memory Cards
                </Link>
              </li>
              <li>
                <Link to="/games/be-the-judge" className="text-[#1A237E]/70 dark:text-[#FDFBF7]/70 hover:text-[#FF6B35] transition-colors">
                  Be The Judge
                </Link>
              </li>
              <li>
                <Link to="/games/choose-violation" className="text-[#1A237E]/70 dark:text-[#FDFBF7]/70 hover:text-[#FF6B35] transition-colors">
                  Choose Violation
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t-2 border-[#1A237E] dark:border-[#FFD54F] flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-[#1A237E]/70 dark:text-[#FDFBF7]/70">
            © 2025 Sansthaein Aur Samvidhan. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <a href="#" className="text-[#1A237E] dark:text-[#FDFBF7] hover:text-[#FF6B35] transition-colors">
              <GithubLogo size={24} weight="bold" />
            </a>
            <a href="#" className="text-[#1A237E] dark:text-[#FDFBF7] hover:text-[#FF6B35] transition-colors">
              <LinkedinLogo size={24} weight="bold" />
            </a>
            <a href="#" className="text-[#1A237E] dark:text-[#FDFBF7] hover:text-[#FF6B35] transition-colors">
              <TwitterLogo size={24} weight="bold" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
