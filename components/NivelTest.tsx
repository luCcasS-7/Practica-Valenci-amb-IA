
import React, { useState, useEffect, useCallback } from 'react';
import { Level, ExamQuestion } from '../types';
import { generateNivelTest } from '../services/geminiService';
import Spinner from './Spinner';

interface NivelTestProps {
  onTestComplete: (level: Level) => void;
  onBack: () => void;
}

const NivelTest: React.FC<NivelTestProps> = ({ onTestComplete, onBack }) => {
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: string}>({});
  const [finished, setFinished] = useState(false);
  const [recommendedLevel, setRecommendedLevel] = useState<Level | null>(null);
  const [score, setScore] = useState(0);

  const fetchTest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!process.env.API_KEY) {
        setError("La clau API de Gemini no està configurada.");
        setLoading(false);
        return;
      }
      const testQuestions = await generateNivelTest();
      setQuestions(testQuestions.slice(0, 10)); // Ensure only 10 questions
    } catch (err: any) {
      setError(err.message || "Error desconegut");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTest();
  }, [fetchTest]);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndex]: answer }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleFinishTest();
    }
  };

  const handleFinishTest = () => {
    let correctAnswers = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correctAnswers++;
      }
    });

    let level: Level;
    if (correctAnswers <= 2) {
        level = 'B1';
    } else if (correctAnswers <= 5) {
        level = 'B2';
    } else if (correctAnswers <= 8) {
        level = 'C1';
    } else {
        level = 'C2';
    }
    
    setScore(correctAnswers);
    setRecommendedLevel(level);
    localStorage.setItem('nivelRecomanat', level);
    setFinished(true);
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <Spinner />
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">Preparant el test de nivell...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error}</p>
        <button onClick={fetchTest} className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          Tornar a intentar
        </button>
      </div>
    );
  }

  if (finished && recommendedLevel) {
    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Test Finalitzat!</h2>
            <p className="text-4xl font-bold my-6">
                <span className="text-blue-500">{score}</span>
                <span className="text-2xl text-slate-500 dark:text-slate-400"> / {questions.length}</span>
            </p>
            <p className="text-lg mb-4">Has encertat {score} de {questions.length} preguntes.</p>
            <p className="text-xl font-semibold mb-8">El teu nivell recomanat és: <span className="text-green-500 font-bold text-2xl">{recommendedLevel}</span></p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => onTestComplete(recommendedLevel)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg">
                    Començar a Practicar ({recommendedLevel})
                </button>
                <button onClick={onBack} className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg">
                    Tornar al Menú
                </button>
            </div>
        </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Test de Nivell</h2>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-gray-700 px-3 py-1 rounded-full">
                Pregunta {currentQuestionIndex + 1} / {questions.length}
            </span>
        </div>
      <div className="p-6 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <p className="text-lg text-slate-800 dark:text-slate-100 leading-relaxed">
            {currentQuestion.sentence.split('[BLANK]')[0]}
            <span className="inline-block w-32 h-px bg-slate-400 mx-2 align-middle"></span>
            {currentQuestion.sentence.split('[BLANK]')[1]}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(option)}
            className={`p-4 rounded-lg text-left font-medium transition-colors duration-200 ${selectedAnswers[currentQuestionIndex] === option ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
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
          {currentQuestionIndex < questions.length - 1 ? 'Següent' : 'Finalitzar Test'}
        </button>
      </div>
    </div>
  );
};

export default NivelTest;
