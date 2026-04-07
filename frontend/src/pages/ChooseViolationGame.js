import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API } from '../contexts/AuthContext';
import { ArrowLeft, Warning, CheckCircle, XCircle } from '@phosphor-icons/react';
import axios from 'axios';
import { toast } from 'sonner';

export default function ChooseViolationGame() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [currentScenario, setCurrentScenario] = useState(0);
  const [scenarios, setScenarios] = useState([]);
  const [selectedViolations, setSelectedViolations] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    generateScenarios();
  }, []);

  const generateScenarios = () => {
    const scenarioData = [
      {
        situation: "A journalist was arrested for writing an article criticizing the government. The police did not provide any reason for the arrest and held them for 3 days without trial.",
        violations: [
          { article: 19, text: "Right to freedom of speech and expression", correct: true },
          { article: 21, text: "Right to life and personal liberty", correct: true },
          { article: 22, text: "Protection against arrest and detention", correct: true },
          { article: 14, text: "Equality before law", correct: false },
          { article: 32, text: "Right to constitutional remedies", correct: false }
        ]
      },
      {
        situation: "A school refused admission to students from a particular community, stating that they only admit students from specific castes.",
        violations: [
          { article: 14, text: "Equality before law", correct: true },
          { article: 15, text: "Prohibition of discrimination", correct: true },
          { article: 29, text: "Protection of minority interests", correct: true },
          { article: 19, text: "Right to freedom of speech", correct: false },
          { article: 21, text: "Right to life and personal liberty", correct: false }
        ]
      },
      {
        situation: "Workers at a factory were forced to work 16 hours a day in hazardous conditions without proper safety equipment. They were not allowed to form unions or complain.",
        violations: [
          { article: 21, text: "Right to life and personal liberty", correct: true },
          { article: 23, text: "Prohibition of trafficking and forced labour", correct: true },
          { article: 19, text: "Right to form associations", correct: true },
          { article: 14, text: "Equality before law", correct: false },
          { article: 32, text: "Right to constitutional remedies", correct: false }
        ]
      },
      {
        situation: "A state passed a law that conflicts with a Union law on the same subject. The state government claims their law should prevail.",
        violations: [
          { article: 246, text: "Distribution of legislative powers", correct: true },
          { article: 254, text: "Inconsistency between Union and State laws", correct: true },
          { article: 1, text: "India as a Union of States", correct: false },
          { article: 79, text: "Constitution of Parliament", correct: false },
          { article: 356, text: "President's Rule", correct: false }
        ]
      },
      {
        situation: "A religious procession was banned by the police without giving any reason. The organizers were not allowed to seek legal help.",
        violations: [
          { article: 25, text: "Freedom of religion", correct: true },
          { article: 19, text: "Right to peaceful assembly", correct: true },
          { article: 21, text: "Right to life and personal liberty", correct: true },
          { article: 14, text: "Equality before law", correct: false },
          { article: 44, text: "Uniform civil code", correct: false }
        ]
      }
    ];

    setScenarios(scenarioData);
  };

  const handleViolationToggle = (violation) => {
    if (showResult) return;
    
    const index = selectedViolations.findIndex(v => v.article === violation.article);
    if (index > -1) {
      setSelectedViolations(selectedViolations.filter(v => v.article !== violation.article));
    } else {
      setSelectedViolations([...selectedViolations, violation]);
    }
  };

  const submitAnswer = async () => {
    const currentScenarioData = scenarios[currentScenario];
    const correctViolations = currentScenarioData.violations.filter(v => v.correct);
    
    const correctlySelected = selectedViolations.filter(v => v.correct).length;
    const incorrectlySelected = selectedViolations.filter(v => !v.correct).length;
    const missed = correctViolations.length - correctlySelected;
    
    const accuracy = correctlySelected / correctViolations.length;
    const isCorrect = accuracy >= 0.67 && incorrectlySelected === 0;
    
    setShowResult(true);

    if (isCorrect) {
      const points = 25;
      setScore(score + points);
      toast.success(`Correct! +${points} points`);

      try {
        await axios.post(
          `${API}/games/attempt`,
          {
            articleId: scenarios[currentScenario].violations[0].article.toString(),
            gameType: 'choose-violation',
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
      toast.error(`Not quite! You found ${correctlySelected}/${correctViolations.length} violations`);
    }
  };

  const nextScenario = () => {
    if (currentScenario + 1 < scenarios.length) {
      setCurrentScenario(currentScenario + 1);
      setSelectedViolations([]);
      setShowResult(false);
    }
  };

  const restartGame = () => {
    setCurrentScenario(0);
    setScore(0);
    setSelectedViolations([]);
    setShowResult(false);
  };

  if (scenarios.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <p className="text-2xl font-bold text-[#1A237E]">Loading scenarios...</p>
      </div>
    );
  }

  const currentScenarioData = scenarios[currentScenario];
  const isGameComplete = currentScenario >= scenarios.length - 1 && showResult;

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
              <p className="text-sm font-bold text-[#1A237E]/70">Scenario</p>
              <p className="text-3xl font-black text-[#29B6F6] font-heading">{currentScenario + 1}/{scenarios.length}</p>
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
          <Warning size={48} weight="bold" className="text-[#FF6B35]" />
          <h1 className="text-4xl sm:text-5xl font-black text-[#1A237E] font-heading">
            Choose the Violation
          </h1>
        </div>

        {isGameComplete ? (
          <div className="neo-card text-center">
            <h2 className="text-3xl font-black text-[#00E676] mb-4 font-heading">All Scenarios Complete!</h2>
            <p className="text-6xl font-black text-[#FF6B35] mb-4 font-heading">{score}/{scenarios.length * 25}</p>
            <p className="text-xl font-bold text-[#1A237E] mb-6">
              You correctly identified violations {((score / (scenarios.length * 25)) * 100).toFixed(0)}% of the time!
            </p>
            <button
              data-testid="restart-game-btn"
              onClick={restartGame}
              className="neo-btn-primary"
            >
              Analyze More Scenarios
            </button>
          </div>
        ) : (
          <>
            <div className="neo-card mb-6">
              <div className="bg-[#FF6B35] text-white border-2 border-[#1A237E] rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-4 font-heading">Situation</h2>
                <p className="text-lg font-medium leading-relaxed">
                  {currentScenarioData.situation}
                </p>
              </div>

              <p className="text-base font-bold text-[#1A237E]/70 mb-4">
                Select ALL constitutional articles that are being violated in this scenario:
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {currentScenarioData.violations.map((violation) => {
                const isSelected = selectedViolations.some(v => v.article === violation.article);
                const showCorrect = showResult && violation.correct;
                const showIncorrect = showResult && isSelected && !violation.correct;
                const showMissed = showResult && violation.correct && !isSelected;

                return (
                  <button
                    key={violation.article}
                    data-testid={`violation-${violation.article}`}
                    onClick={() => handleViolationToggle(violation)}
                    disabled={showResult}
                    className={`w-full neo-card text-left transition-all ${
                      showCorrect
                        ? 'bg-[#00E676] border-[#00E676]'
                        : showIncorrect
                        ? 'bg-[#FF6B35] border-[#FF6B35]'
                        : showMissed
                        ? 'bg-[#FFD54F] border-[#FFD54F]'
                        : isSelected
                        ? 'bg-[#29B6F6] border-[#29B6F6]'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xl font-black text-[#FF6B35] font-heading">
                            Article {violation.article}
                          </span>
                          {showCorrect && <CheckCircle size={24} weight="bold" className="text-white" />}
                          {showIncorrect && <XCircle size={24} weight="bold" className="text-white" />}
                          {showMissed && <Warning size={24} weight="bold" className="text-[#1A237E]" />}
                        </div>
                        <p className="text-base font-medium text-[#1A237E]">
                          {violation.text}
                        </p>
                      </div>
                      <div className={`w-6 h-6 border-2 border-[#1A237E] rounded ${
                        isSelected ? 'bg-[#1A237E]' : 'bg-white'
                      }`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {!showResult ? (
              <button
                data-testid="submit-answer-btn"
                onClick={submitAnswer}
                disabled={selectedViolations.length === 0}
                className="neo-btn-primary w-full"
              >
                Submit Answer
              </button>
            ) : (
              <button
                data-testid="next-scenario-btn"
                onClick={nextScenario}
                className="neo-btn-primary w-full"
              >
                {currentScenario + 1 < scenarios.length ? 'Next Scenario' : 'See Results'}
              </button>
            )}
          </>
        )}
      </main>
    </div>
  );
}
