
import React, { useState, useEffect } from 'react';
import { Level } from '../types';

interface LevelSelectorProps {
  onSelectLevel: (level: Level) => void;
  onStartNivelTest: () => void;
  onShowHistory: () => void;
}

const levels: Level[] = ['B1', 'B2', 'C1', 'C2'];
const levelColors: Record<Level, string> = {
    B1: 'bg-blue-500 hover:bg-blue-600',
    B2: 'bg-green-500 hover:bg-green-600',
    C1: 'bg-yellow-500 hover:bg-yellow-600',
    C2: 'bg-red-500 hover:bg-red-600',
};

const LevelSelector: React.FC<LevelSelectorProps> = ({ onSelectLevel, onStartNivelTest, onShowHistory }) => {
  const [recommendedLevel, setRecommendedLevel] = useState<Level | null>(null);

  useEffect(() => {
    const savedLevel = localStorage.getItem('nivelRecomanat');
    if (savedLevel && levels.includes(savedLevel as Level)) {
      setRecommendedLevel(savedLevel as Level);
    }
  }, []);

  return (
    <div className="text-center">
      <div className="mb-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        {recommendedLevel ? (
          <div>
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">El teu nivell recomanat és <span className="font-bold text-blue-500">{recommendedLevel}</span></h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Pots començar a practicar directament o repetir el test de nivell.</p>
            <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => onSelectLevel(recommendedLevel)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                Practicar Nivell {recommendedLevel}
              </button>
              <button onClick={onStartNivelTest} className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                Repetir Test
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">No estàs segur/a del teu nivell?</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Fes un test ràpid per a descobrir quin nivell s'adapta millor a tu.</p>
            <button onClick={onStartNivelTest} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">
              Fer el Test de Nivell
            </button>
          </div>
        )}
      </div>

      <h1 className="text-3xl font-bold mb-2 text-slate-800 dark:text-slate-100">O Tria el Teu Nivell</h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">Selecciona un nivell per a començar a practicar directament.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {levels.map((level) => (
          <div key={level} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 ${levelColors[level]}`}>
              {level}
            </div>
            <h2 className="text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-200">{`Nivell ${level}`}</h2>
            <button
                onClick={() => onSelectLevel(level)}
                className="w-full mt-auto bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg"
            >
                Començar a Practicar
            </button>
          </div>
        ))}
      </div>
       <div className="mt-12 text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Revisa el teu progrés</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
            Consulta els exercicis que has completat i analitza els teus resultats.
        </p>
        <button
            onClick={onShowHistory}
            className="mt-4 inline-block bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
            Historial de Pràctica
        </button>
     </div>
      <div className="mt-12 text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Recursos Oficials</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
            Per a més informació, guies i models d'examen, consulta la pàgina oficial de la Junta Qualificadora de Coneixements de Valencià.
        </p>
        <a 
            href="https://jqcv.gva.es/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
            Visita JQCV
        </a>
     </div>
    </div>
  );
};

export default LevelSelector;
