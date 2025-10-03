
import React, { useState } from 'react';

interface OnboardingModalProps {
  onClose: () => void;
}

const tutorialSteps = [
  {
    title: "👋 Benvingut/da a Practica Valencià amb IA!",
    content: "Aquesta guia ràpida t'ensenyarà les funcions principals de l'aplicació en un moment.",
    icon: "👋"
  },
  {
    title: "1. Tria el Teu Nivell",
    content: "Tot comença al menú principal. Pots fer un test de nivell si no saps per on començar, o seleccionar directament un nivell (B1, B2, C1, C2) per a practicar.",
    icon: "🎯"
  },
  {
    title: "2. Selecciona una Àrea de Pràctica",
    content: "Una vegada seleccionat el nivell, podràs triar entre diferents àrees: Comprensió, Estructures Lingüístiques, Expressió Escrita i Oral. Cada àrea té exercicis específics.",
    icon: "📚"
  },
  {
    title: "3. Fes un Simulacre d'Examen",
    content: "Vols posar-te a prova? Des de la pantalla de selecció d'àrees, pots iniciar un simulacre d'examen complet amb temps i preguntes variades, com si fos l'examen real.",
    icon: "⏱️"
  },
  {
    title: "4. Revisa el Teu Progrés",
    content: "Tots els teus exercicis es guarden a l'Historial de Pràctica. Podràs revisar les teues respostes, veure les explicacions i filtrar els resultats per a enfocar-te en el que necessites millorar.",
    icon: "📈"
  }
];

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const currentStep = tutorialSteps[step];
  const isLastStep = step === tutorialSteps.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4 transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
            <div className="text-5xl mb-4">{currentStep.icon}</div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{currentStep.title}</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">{currentStep.content}</p>
        </div>

        <div className="flex items-center justify-center mb-6">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full mx-1 transition-colors ${
                index === step ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            ></div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {step > 0 ? (
            <button
              onClick={handlePrev}
              className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Anterior
            </button>
          ) : (
            <button
                onClick={onClose}
                className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 font-bold py-2 px-4 rounded-lg transition-colors"
            >
                Omet
            </button>
          )}

          <button
            onClick={handleNext}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            {isLastStep ? 'Finalitzar' : 'Següent'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
