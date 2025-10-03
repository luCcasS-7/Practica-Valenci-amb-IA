import React, { useState } from 'react';
import { ExamSettings } from '../types';

interface ExamSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: ExamSettings) => void;
  currentSettings: ExamSettings;
}

const ExamSettingsModal: React.FC<ExamSettingsModalProps> = ({ isOpen, onClose, onSave, currentSettings }) => {
  const [numQuestions, setNumQuestions] = useState(currentSettings.numQuestions);
  const [timePerQuestion, setTimePerQuestion] = useState(currentSettings.timePerQuestion);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSave({ numQuestions, timePerQuestion });
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" 
      role="dialog" 
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Configuració de l'Examen</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Tancar">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="numQuestions" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Número de preguntes: <span className="font-bold text-blue-500">{numQuestions}</span>
            </label>
            <input
              id="numQuestions"
              type="range"
              min="5"
              max="20"
              step="1"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>
          <div>
            <label htmlFor="timePerQuestion" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Temps per pregunta: <span className="font-bold text-blue-500">{timePerQuestion}s</span>
            </label>
            <input
              id="timePerQuestion"
              type="range"
              min="30"
              max="120"
              step="15"
              value={timePerQuestion}
              onChange={(e) => setTimePerQuestion(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Cancel·lar
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamSettingsModal;
