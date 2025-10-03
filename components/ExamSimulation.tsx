import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Level, ExamQuestion, ExamSettings } from '../types';
import { generateExam } from '../services/geminiService';
import Spinner from './Spinner';
import ExamSettingsModal from './ExamSettingsModal';

interface ExamSimulationProps {
  level: Level;
  onBack: () => void;
}

type ExamView = 'start' | 'loading' | 'exam' | 'results' | 'practice_failed';

const DEFAULT_SETTINGS: ExamSettings = {
  numQuestions: 5,
  timePerQuestion: 60,
};

const ExamSimulation: React.FC<ExamSimulationProps> = ({ level, onBack }) => {
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: string}>({});
  const [view, setView] = useState<ExamView>('start');
  const [score, setScore] = useState(0);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(0);
  const [reviewedErrors, setReviewedErrors] = useState(false);
  const [examSettings, setExamSettings] = useState<ExamSettings>(DEFAULT_SETTINGS);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('examSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setExamSettings(parsedSettings);
        setQuestionTimeLeft(parsedSettings.timePerQuestion);
      } else {
        setQuestionTimeLeft(DEFAULT_SETTINGS.timePerQuestion);
      }
    } catch (e) {
      console.error("Failed to load exam settings from localStorage", e);
      setQuestionTimeLeft(DEFAULT_SETTINGS.timePerQuestion);
    }
  }, []);
  
  const failedQuestions = useMemo(() => 
    questions.filter((q, index) => selectedAnswers[index] !== q.correctAnswer),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [questions, selectedAnswers, view]
  );
  
  const [currentFailedQuestionIndex, setCurrentFailedQuestionIndex] = useState(0);
  const [failedQuestionFeedback, setFailedQuestionFeedback] = useState<{answer: string, isCorrect: boolean} | null>(null);

  const handleFinishExam = useCallback(() => {
    let correctAnswers = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
    setView('results');
  }, [questions, selectedAnswers]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleFinishExam();
    }
  }, [currentQuestionIndex, questions.length, handleFinishExam]);


  const fetchExam = useCallback(async () => {
    setView('loading');
    setError(null);
    try {
        if (!process.env.API_KEY) {
            setError("La clau API de Gemini no està configurada.");
            setView('start');
            return;
        }
      const examQuestions = await generateExam(level, examSettings.numQuestions);
      setQuestions(examQuestions);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setScore(0);
      setReviewedErrors(false);
      setView('exam');
    } catch (err: any) {
      setError(err.message || "Error desconegut");
      setView('start');
    }
  }, [level, examSettings.numQuestions]);

  useEffect(() => {
    if (view !== 'exam' || questions.length === 0) {
      return;
    }

    setQuestionTimeLeft(examSettings.timePerQuestion);

    const timer = setInterval(() => {
      setQuestionTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleNextQuestion();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [view, questions.length, currentQuestionIndex, handleNextQuestion, examSettings.timePerQuestion]);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndex]: answer }));
  };
  
  const getButtonClass = (option: string, question: ExamQuestion, isSelected: boolean) => {
    if (view === 'results' || failedQuestionFeedback) {
        if (option === question.correctAnswer) return 'bg-green-500 text-white';
        if (isSelected && option !== question.correctAnswer) return 'bg-red-500 text-white';
        return 'bg-white dark:bg-gray-700 cursor-not-allowed opacity-60';
    }
    return isSelected ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600';
  };

  const handlePracticeFailed = () => {
    setCurrentFailedQuestionIndex(0);
    setFailedQuestionFeedback(null);
    setReviewedErrors(true);
    setView('practice_failed');
  };

  const handlePracticeAnswer = (option: string) => {
    if (failedQuestionFeedback) return;
    const currentQuestion = failedQuestions[currentFailedQuestionIndex];
    setFailedQuestionFeedback({
        answer: option,
        isCorrect: option === currentQuestion.correctAnswer
    });
  };

  const handleNextFailedQuestion = () => {
    if (currentFailedQuestionIndex < failedQuestions.length - 1) {
      setCurrentFailedQuestionIndex(prev => prev + 1);
      setFailedQuestionFeedback(null);
    } else {
      // Finished practicing all failed questions
      setView('results');
    }
  };

  const handleSaveSettings = (newSettings: ExamSettings) => {
    setExamSettings(newSettings);
    try {
      localStorage.setItem('examSettings', JSON.stringify(newSettings));
    } catch (e) {
      console.error("Failed to save exam settings to localStorage", e);
    }
    setIsSettingsModalOpen(false);
  };


  if (view === 'loading') {
    return (
        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <Spinner />
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">Generant simulacre d'examen de nivell {level}...</p>
        </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error}</p>
        <button onClick={fetchExam} className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          Tornar a intentar
        </button>
      </div>
    );
  }

  if (view === 'start') {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-lg mx-auto text-center">
        <h2 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100">Simulacre d'Examen</h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">Nivell <span className="font-bold text-blue-500">{level}</span></p>

        <div className="mb-8 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg space-y-2 text-left">
          <p className="text-slate-700 dark:text-slate-200"><span className="font-semibold">Número de preguntes:</span> {examSettings.numQuestions}</p>
          <p className="text-slate-700 dark:text-slate-200"><span className="font-semibold">Temps per pregunta:</span> {examSettings.timePerQuestion} segons</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={fetchExam} 
            className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg"
          >
            Començar Examen
          </button>
          <button 
            onClick={() => setIsSettingsModalOpen(true)}
            className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg"
          >
            Configuració
          </button>
        </div>
        {isSettingsModalOpen && (
          <ExamSettingsModal 
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            onSave={handleSaveSettings}
            currentSettings={examSettings}
          />
        )}
      </div>
    );
  }

  if (view === 'results') {
    return (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-xl shadow-2xl max-w-3xl mx-auto text-center w-full">
            <h2 className="text-2xl font-bold mb-4">Resultats de l'Examen</h2>
            <p className="text-3xl sm:text-4xl font-bold my-6">
                <span className={`${score / questions.length >= 0.5 ? 'text-green-500' : 'text-red-500'}`}>{score}</span>
                <span className="text-2xl text-slate-500 dark:text-slate-400"> / {questions.length}</span>
            </p>
            <p className="text-lg mb-8">Has encertat {score} de {questions.length} preguntes.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                {failedQuestions.length > 0 && (
                    <button onClick={handlePracticeFailed} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg">
                        {reviewedErrors ? 'Tornar a Repassar Errors' : 'Repassar Errors'} ({failedQuestions.length})
                    </button>
                )}
                <button onClick={onBack} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg">
                    Tornar al Menú
                </button>
            </div>

            <div className="space-y-6 text-left">
                <h3 className="text-xl font-semibold mb-4 text-center">Revisió de les Preguntes</h3>
                {questions.map((q, index) => (
                    <div key={index} className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                         <p className="text-md text-slate-800 dark:text-slate-100 mb-4">{q.sentence.replace('[BLANK]', '______')}</p>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                             {q.options.map((opt) => (
                                 <div key={opt} className={`p-2 rounded-md text-sm ${getButtonClass(opt, q, selectedAnswers[index] === opt)}`}>
                                     {opt}
                                 </div>
                             ))}
                         </div>
                         <div className="p-3 bg-blue-50 dark:bg-gray-700 border-l-4 border-blue-400 rounded-r-lg">
                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">Explicació:</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{q.explanation}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  }

  if (view === 'practice_failed') {
    const currentQuestion = failedQuestions[currentFailedQuestionIndex];
    if (!currentQuestion) return null;
    return (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-xl shadow-2xl max-w-2xl mx-auto w-full">
            <h2 className="text-xl font-semibold mb-1 text-slate-700 dark:text-slate-200">Repassant Errors</h2>
            <p className="text-md text-slate-500 dark:text-slate-400 mb-6">Pregunta {currentFailedQuestionIndex + 1} de {failedQuestions.length}</p>

            <div className="p-4 sm:p-6 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-lg text-slate-800 dark:text-slate-100 leading-relaxed">{currentQuestion.sentence.replace('[BLANK]', '______')}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handlePracticeAnswer(option)}
                        disabled={!!failedQuestionFeedback}
                        className={`p-3 sm:p-4 rounded-lg text-left font-medium transition-all duration-300 ${getButtonClass(option, currentQuestion, failedQuestionFeedback?.answer === option)}`}
                    >
                        {option}
                    </button>
                ))}
            </div>

            {failedQuestionFeedback && (
                <div className="mt-6">
                    <div className="p-4 bg-blue-50 dark:bg-gray-700 border-l-4 border-blue-400 rounded-r-lg">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100">Explicació:</h4>
                        <p className="text-slate-600 dark:text-slate-300 mt-1">{currentQuestion.explanation}</p>
                    </div>

                    <div className="mt-8 text-center">
                        <button onClick={handleNextFailedQuestion} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors text-lg">
                            {currentFailedQuestionIndex < failedQuestions.length - 1 ? 'Següent' : 'Finalitzar Repàs'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-xl shadow-2xl max-w-2xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 shrink-0">Examen Nivell <span className="font-bold text-blue-500">{level}</span></h2>
            <div className="flex flex-col items-end w-full sm:w-auto">
                 <span className="text-lg font-mono font-bold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-gray-700 px-3 py-1 rounded-md">
                    Temps: {questionTimeLeft}s
                </span>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                    Pregunta {currentQuestionIndex + 1} / {questions.length}
                </span>
            </div>
        </div>
      <div className="p-4 sm:p-6 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <p className="text-lg text-slate-800 dark:text-slate-100 leading-relaxed">
            {currentQuestion.sentence.split('[BLANK]')[0]}
            <span className="inline-block w-24 sm:w-32 h-px bg-slate-400 mx-2 align-middle"></span>
            {currentQuestion.sentence.split('[BLANK]')[1]}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(option)}
            className={`p-3 sm:p-4 rounded-lg text-left font-medium transition-colors duration-200 ${getButtonClass(option, currentQuestion, selectedAnswers[currentQuestionIndex] === option)}`}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="mt-8 text-right">
        <button
          onClick={handleNextQuestion}
          disabled={!selectedAnswers[currentQuestionIndex]}
          className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-8 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {currentQuestionIndex < questions.length - 1 ? 'Següent' : 'Finalitzar'}
        </button>
      </div>
    </div>
  );
};

export default ExamSimulation;