
import React, { useState, useEffect, useCallback } from 'react';
import { Level, ExerciseData, Skill, HistoryItem } from '../types';
import { generateExercise } from '../services/geminiService';
import Spinner from './Spinner';

interface ExerciseProps {
  level: Level;
  skill: Skill;
  onAddToHistory: (item: HistoryItem) => void;
  history: HistoryItem[];
}

const Exercise: React.FC<ExerciseProps> = ({ level, skill, onAddToHistory, history }) => {
  const [exercise, setExercise] = useState<ExerciseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);

  const fetchExercise = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowFeedback(false);
    setExercise(null);

    try {
      if (!process.env.API_KEY) {
        setError("La clau API de Gemini no està configurada.");
        setLoading(false);
        return;
      }
      const recentSentences = history.slice(0, 20).map(item => item.exercise.sentence);
      const data = await generateExercise(level, skill, recentSentences);
      setExercise(data);
    } catch (err: any) {
      setError(err.message || "Error desconegut");
    } finally {
      setLoading(false);
    }
  }, [level, skill, history]);

  useEffect(() => {
    fetchExercise();
  }, [fetchExercise]);

  const handleAnswerClick = useCallback((option: string) => {
    if (showFeedback || !exercise) return;
    
    const correct = option === exercise.correctAnswer;
    setSelectedAnswer(option);
    setIsCorrect(correct);
    setShowFeedback(true);

    onAddToHistory({
        level: level,
        exercise: exercise,
        selectedAnswer: option,
        isCorrect: correct,
        timestamp: Date.now(),
    });
  }, [showFeedback, exercise, onAddToHistory, level]);
  
  const getButtonClass = (option: string) => {
    if (!showFeedback) {
      return 'bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600';
    }
    if (option === exercise?.correctAnswer) {
      return 'bg-green-500 text-white';
    }
    if (option === selectedAnswer && option !== exercise?.correctAnswer) {
      return 'bg-red-500 text-white';
    }
    return 'bg-white dark:bg-gray-700 cursor-not-allowed opacity-60';
  };

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <Spinner />
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">Generant exercici de nivell {level} ({skill})...</p>
        </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error}</p>
        <button onClick={fetchExercise} className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          Tornar a intentar
        </button>
      </div>
    );
  }

  if (!exercise) {
    return null;
  }
  
  const sentenceParts = exercise.sentence.split('[BLANK]');

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-1 text-slate-700 dark:text-slate-200">
        Exercici de Nivell <span className="font-bold text-blue-500">{level}</span>
      </h2>
      <p className="text-md text-slate-500 dark:text-slate-400 mb-6">{skill}</p>

      <div className="p-6 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <p className="text-lg text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-line">
           {sentenceParts.length > 1 ? (
                <>
                    {sentenceParts[0]}
                    <span className="inline-block w-32 h-px bg-slate-400 mx-2 align-middle"></span>
                    {sentenceParts[1]}
                </>
            ) : (
                exercise.sentence
            )}
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {exercise.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerClick(option)}
            disabled={showFeedback}
            className={`p-4 rounded-lg text-left font-medium transition-all duration-300 ${getButtonClass(option)}`}
          >
            {option}
          </button>
        ))}
      </div>

      {showFeedback && (
        <div className="mt-6 p-5 rounded-lg transition-all duration-500 ease-in-out bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          {isCorrect ? (
            <div className="flex items-center gap-3 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500 flex-shrink-0 animate-subtle-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-bold text-green-600 dark:text-green-400">Molt bé! Resposta Correcta!</h3>
            </div>
          ) : (
            <div className="flex items-start gap-3 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 flex-shrink-0 mt-1 animate-subtle-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-xl font-bold text-red-600 dark:text-red-400">Resposta Incorrecta</h3>
                <p className="text-slate-600 dark:text-slate-300 mt-1">La resposta correcta era: <span className="font-bold text-slate-800 dark:text-slate-100">{exercise.correctAnswer}</span></p>
              </div>
            </div>
          )}
            
          <div className="p-4 bg-blue-50 dark:bg-gray-700/50 border-l-4 border-blue-400 rounded-r-lg">
              <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100">Explicació:</h4>
                      <p className="text-slate-600 dark:text-slate-300 mt-1">{exercise.explanation}</p>
                  </div>
              </div>
          </div>

          <div className="mt-8 text-center">
              <button 
                onClick={fetchExercise} 
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                  Següent Exercici
              </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exercise;
