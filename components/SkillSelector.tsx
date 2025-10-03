import React from 'react';
import { Level, Skill } from '../types';

interface SkillSelectorProps {
  level: Level;
  onSelectSkill: (skill: Skill) => void;
  onStartExam: () => void;
}

// Using SVG icons for a more polished and consistent look
// FIX: Changed JSX.Element to React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
const icons: Record<Skill, React.ReactElement> = {
  'Comprensió': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  'Estructures Lingüístiques': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  'Expressió Escrita': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
    </svg>
  ),
  'Expressió Oral': (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5a6 6 0 00-12 0v1.5a6 6 0 006 6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75V18.75m0 0A3.375 3.375 0 0015.375 15.375M12 18.75A3.375 3.375 0 018.625 15.375M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

const skills: { name: Skill; description: string; }[] = [
    { name: 'Comprensió', description: "Avalua la teua comprensió lectora amb textos curts i preguntes d'anàlisi i inferència." },
    { name: 'Estructures Lingüístiques', description: 'Reforça la gramàtica, el lèxic i la sintaxi amb exercicis de completar, transformar i corregir.' },
    { name: 'Expressió Escrita', description: 'Aprèn a construir textos coherents i adequats per a diferents situacions, com cartes o correus.' },
    { name: 'Expressió Oral', description: 'Practica les fórmules de cortesia i les expressions adequades per a converses i interaccions.' },
];

const SkillSelector: React.FC<SkillSelectorProps> = ({ level, onSelectSkill, onStartExam }) => {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-2 text-slate-800 dark:text-slate-100">
        Nivell <span className="text-blue-500">{level}</span>
      </h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">Selecciona una àrea per a practicar o comença un simulacre d'examen.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {skills.map((skill) => (
          <div 
            key={skill.name} 
            onClick={() => onSelectSkill(skill.name)}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center text-center transform hover:-translate-y-1 active:scale-95 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-500 hover:shadow-blue-500/20 dark:hover:border-blue-400"
          >
            <div className="mb-4" aria-hidden="true">{icons[skill.name]}</div>
            <h2 className="text-xl font-semibold mb-2 text-slate-800 dark:text-slate-200">{skill.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{skill.description}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onStartExam}
        className="w-full max-w-md mx-auto bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 text-xl shadow-lg transform hover:-translate-y-1 active:translate-y-0"
      >
        Simulacre d'Examen Complet
      </button>
    </div>
  );
};

export default SkillSelector;