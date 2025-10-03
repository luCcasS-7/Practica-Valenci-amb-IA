
import React from 'react';

interface InfoModalProps {
  onClose: () => void;
  onStartOnboarding: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ onClose, onStartOnboarding }) => {
  const handleShowTutorial = () => {
    onClose();
    onStartOnboarding();
  };

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300" 
        role="dialog" 
        aria-modal="true"
        onClick={onClose}
    >
        <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-lg w-full transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">ℹ️ Informació de la pàgina</h3>
                 <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Tancar">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                 </button>
            </div>
            <div className="space-y-4 text-slate-600 dark:text-slate-300">
                <p>
                    Aquesta pàgina web ha sigut creada amb l’objectiu d’ajudar a preparar els exàmens oficials de valencià de la Junta Qualificadora de Coneixements de Valencià (JQCV), des del nivell B1 fins al C2.
                </p>
                <p>
                    Ací trobaràs exercicis classificats per apartats (comprensió, estructures lingüístiques, expressió escrita i expressió oral), així com simulacres d’examen basats en models oficials.
                </p>
                <div>
                    <h4 className="font-bold text-slate-700 dark:text-slate-200">👤 Creador</h4>
                    <p>
                        La pàgina ha sigut desenvolupada per Lucas, estudiant actual de FP de grau mitjà, amb la intenció de compartir recursos útils i fer més accessible la preparació de les proves de valencià.
                    </p>
                </div>
            </div>
             <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                <button
                    onClick={handleShowTutorial}
                    className="w-full sm:w-auto bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Guia d'Inici Ràpid
                </button>
                <button
                    onClick={onClose}
                    className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Entès
                </button>
            </div>
        </div>
    </div>
  );
};

export default InfoModal;
