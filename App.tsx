
import React, { useState, useCallback, useEffect } from 'react';
import { Level, View, Skill, HistoryItem } from './types';
import LevelSelector from './components/LevelSelector';
import SkillSelector from './components/SkillSelector';
import Exercise from './components/Exercise';
import ExamSimulation from './components/ExamSimulation';
import Header from './components/Header';
import NivelTest from './components/NivelTest';
import History from './components/History';
import Footer from './components/Footer';
import InfoModal from './components/InfoModal';
import OnboardingModal from './components/OnboardingModal';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('menu');
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [currentSkill, setCurrentSkill] = useState<Skill | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    try {
      const hasCompletedOnboarding = localStorage.getItem('onboardingComplete');
      if (!hasCompletedOnboarding) {
        setShowOnboarding(true);
      }
    } catch (error) {
        console.error("Failed to check onboarding status from localStorage", error);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
        localStorage.setItem('theme', theme);
    } catch (error) {
        console.error("Failed to save theme to localStorage", error);
    }
  }, [theme]);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('practiceHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Failed to load practice history from localStorage", error);
    }
  }, []);

  const handleAddToHistory = useCallback((item: HistoryItem) => {
    setHistory(prevHistory => {
      const newHistory = [item, ...prevHistory];
      try {
        localStorage.setItem('practiceHistory', JSON.stringify(newHistory));
      } catch (error) {
        console.error("Failed to save practice history to localStorage", error);
      }
      
      // Share popup logic
      const milestones = [3, 10, 25];
      try {
        const shownMilestones = JSON.parse(localStorage.getItem('sharePopupMilestones') || '[]');
        if (milestones.includes(newHistory.length) && !shownMilestones.includes(newHistory.length)) {
            setShowSharePopup(true);
            localStorage.setItem('sharePopupMilestones', JSON.stringify([...shownMilestones, newHistory.length]));
        }
      } catch(e) {
        console.error("Failed to manage share popup milestones", e);
      }

      return newHistory;
    });
  }, []);

  const handleClearHistory = useCallback(() => {
    if (window.confirm("Estàs segur que vols buidar tot l'historial de pràctica? Aquesta acció no es pot desfer.")) {
      setHistory([]);
      try {
        localStorage.removeItem('practiceHistory');
      } catch (error) {
        console.error("Failed to clear practice history from localStorage", error);
      }
    }
  }, []);

  const handleThemeToggle = useCallback(() => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  }, []);

  const handleShowInfo = useCallback(() => {
    setShowInfoModal(true);
  }, []);

  const handleCloseInfo = useCallback(() => {
    setShowInfoModal(false);
  }, []);

  const handleStartOnboarding = useCallback(() => {
    setShowInfoModal(false);
    setShowOnboarding(true);
  }, []);

  const handleCloseOnboarding = useCallback(() => {
    setShowOnboarding(false);
    try {
        localStorage.setItem('onboardingComplete', 'true');
    } catch (error) {
        console.error("Failed to save onboarding status to localStorage", error);
    }
  }, []);

  const handleSelectLevel = useCallback((level: Level) => {
    setCurrentLevel(level);
    setCurrentView('skill_selection');
  }, []);

  const handleSelectSkill = useCallback((skill: Skill) => {
    setCurrentSkill(skill);
    setCurrentView('exercise');
  }, []);

  const handleStartExam = useCallback((level: Level) => {
    setCurrentLevel(level);
    setCurrentView('exam');
  }, []);
  
  const handleStartNivelTest = useCallback(() => {
    setCurrentView('test_nivel');
  }, []);

  const handleShowHistory = useCallback(() => {
    setCurrentView('history');
  }, []);

  const handleTestComplete = useCallback((level: Level) => {
    setCurrentLevel(level);
    setCurrentView('skill_selection');
  }, []);

  const handleBack = useCallback(() => {
    if (currentView === 'exercise') {
      setCurrentView('skill_selection');
      setCurrentSkill(null);
    } else if (currentView === 'skill_selection' || currentView === 'exam' || currentView === 'test_nivel' || currentView === 'history') {
      setCurrentView('menu');
      setCurrentLevel(null);
      setCurrentSkill(null);
    }
  }, [currentView]);

  const renderContent = () => {
    switch (currentView) {
      case 'skill_selection':
        return currentLevel && <SkillSelector level={currentLevel} onSelectSkill={handleSelectSkill} onStartExam={() => handleStartExam(currentLevel)} />;
      case 'exercise':
        return currentLevel && currentSkill && <Exercise level={currentLevel} skill={currentSkill} onAddToHistory={handleAddToHistory} history={history} />;
      case 'exam':
        return currentLevel && <ExamSimulation level={currentLevel} onBack={handleBack} />;
      case 'test_nivel':
        return <NivelTest onTestComplete={handleTestComplete} onBack={handleBack} />;
      case 'history':
        return <History practiceHistory={history} onClearHistory={handleClearHistory} />;
      case 'menu':
      default:
        return <LevelSelector onSelectLevel={handleSelectLevel} onStartNivelTest={handleStartNivelTest} onShowHistory={handleShowHistory} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
        <div className="w-full max-w-4xl mx-auto flex flex-col flex-grow">
            <Header 
                onBack={handleBack} 
                showBackButton={currentView !== 'menu'}
                theme={theme}
                onThemeToggle={handleThemeToggle}
                onShowInfo={handleShowInfo}
            />
            <main className="mt-8 flex-grow">
                {renderContent()}
            </main>
            {showSharePopup && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300" role="dialog" aria-modal="true">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 text-center max-w-sm w-full transform transition-all duration-300 scale-100">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">T'agrada l'app?</h3>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                            Ajuda a que més gent la descobreixi. Comparteix-la a WhatsApp!
                        </p>
                        <div className="mt-6 flex flex-col gap-3">
                            <a
                                href={`https://wa.me/?text=${encodeURIComponent("He trobat aquesta app per practicar valencià i m'està agradant molt. Fes-li una ullada! " + window.location.href)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                onClick={() => setShowSharePopup(false)}
                            >
                                <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2" fill="currentColor">
                                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.269.655 4.512 1.924 6.344l-1.226 4.485 4.635-1.217z"/>
                                </svg>
                                Compartir a WhatsApp
                            </a>
                            <button
                                onClick={() => setShowSharePopup(false)}
                                className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                Ara No
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showInfoModal && <InfoModal onClose={handleCloseInfo} onStartOnboarding={handleStartOnboarding} />}
            {showOnboarding && <OnboardingModal onClose={handleCloseOnboarding} />}
            <Footer />
        </div>
    </div>
  );
};

export default App;
