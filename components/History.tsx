
import React, { useMemo, useState } from 'react';
import { HistoryItem, Level } from '../types';

interface HistoryProps {
  practiceHistory: HistoryItem[];
  onClearHistory: () => void;
}

const History: React.FC<HistoryProps> = ({ practiceHistory, onClearHistory }) => {
  const [levelFilter, setLevelFilter] = useState<'all' | Level>('all');
  const [correctnessFilter, setCorrectnessFilter] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const isAnyFilterActive = useMemo(() => {
    return levelFilter !== 'all' || correctnessFilter !== 'all' || startDate !== '' || endDate !== '';
  }, [levelFilter, correctnessFilter, startDate, endDate]);

  const handleClearFilters = () => {
    setLevelFilter('all');
    setCorrectnessFilter('all');
    setStartDate('');
    setEndDate('');
  };


  const filteredHistory = useMemo(() => {
    const startTimestamp = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
    const endTimestamp = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

    return practiceHistory
      .filter(item => {
        if (levelFilter === 'all') return true;
        // Handle old history items that might not have a level
        if (!item.level) return false;
        return item.level === levelFilter;
      })
      .filter(item => {
        if (correctnessFilter === 'all') return true;
        return correctnessFilter === 'correct' ? item.isCorrect : !item.isCorrect;
      })
      .filter(item => {
        if (!startTimestamp && !endTimestamp) return true;
        const itemTimestamp = item.timestamp;
        if (startTimestamp && itemTimestamp < startTimestamp) return false;
        if (endTimestamp && itemTimestamp > endTimestamp) return false;
        return true;
      });
  }, [practiceHistory, levelFilter, correctnessFilter, startDate, endDate]);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ca-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const overallStats = useMemo(() => {
    const totalCorrect = filteredHistory.filter(item => item.isCorrect).length;
    const totalIncorrect = filteredHistory.length - totalCorrect;
    const accuracy = filteredHistory.length > 0 ? Math.round((totalCorrect / filteredHistory.length) * 100) : 0;
    return { totalCorrect, totalIncorrect, accuracy };
  }, [filteredHistory]);

  const handleShareOnWhatsApp = () => {
    const text = `He estat practicant valencià amb 'Practica Valencià amb IA'! El meu progrés (amb els filtres actuals) és de ${overallStats.accuracy}% d'encerts. Prova-la tu també!`;
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleExport = () => {
    if (filteredHistory.length === 0) return;

    if (window.confirm("Estàs segur que vols exportar l'historial filtrat actual?")) {
      const escapeCsvField = (field: any): string => {
        const stringField = String(field);
        if (/[",\n]/.test(stringField)) {
          return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      };
    
      const headers = [
        "Data", "Nivell", "Pregunta", "La teua Resposta", "Resposta Correcta", "Resultat", "Explicació"
      ];
    
      const csvRows = filteredHistory.map(item => [
        escapeCsvField(formatTimestamp(item.timestamp)),
        escapeCsvField(item.level),
        escapeCsvField(item.exercise.sentence.replace('[BLANK]', '______')),
        escapeCsvField(item.selectedAnswer),
        escapeCsvField(item.exercise.correctAnswer),
        escapeCsvField(item.isCorrect ? 'Correcte' : 'Incorrecte'),
        escapeCsvField(item.exercise.explanation)
      ].join(','));
    
      const csvContent = [headers.join(','), ...csvRows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'historial_practica.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }
  };


  const chartData = useMemo(() => {
    if (!filteredHistory || filteredHistory.length === 0) {
      return [];
    }

    const statsByDay: { [key: string]: { correct: number; incorrect: number; dateObj: Date } } = {};

    filteredHistory.forEach(item => {
      const dateObj = new Date(item.timestamp)
      const date = dateObj.toLocaleDateString('ca-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
      
      if (!statsByDay[date]) {
        statsByDay[date] = { correct: 0, incorrect: 0, dateObj };
      }
      if (item.isCorrect) {
        statsByDay[date].correct++;
      } else {
        statsByDay[date].incorrect++;
      }
    });

    return Object.entries(statsByDay)
      .map(([date, stats]) => ({
        date,
        ...stats,
        total: stats.correct + stats.incorrect,
      }))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
      .slice(-7); // Take last 7 days of practice
  }, [filteredHistory]);


  const PerformanceChart = () => {
    if (chartData.length === 0) return null;

    const chartHeight = 120;
    const barWidth = 35;
    const barMargin = 20;
    const chartWidth = chartData.length * (barWidth + barMargin) - barMargin;
    const maxTotal = Math.max(...chartData.map(d => d.total), 1);

    return (
      <div className="mt-8 mb-10 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">Rendiment Recent</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Resum dels teus últims dies de pràctica (segons filtres).
        </p>
        <div className="w-full overflow-x-auto pb-4">
             <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`} width={chartWidth} height={chartHeight + 30} aria-labelledby="chart-title" role="img" className="min-w-full">
                <title id="chart-title">Gràfic de rendiment diari</title>
                {chartData.map((d, i) => {
                    const barX = i * (barWidth + barMargin);
                    const totalBarHeight = (d.total / maxTotal) * chartHeight;
                    const correctHeight = d.total > 0 ? (d.correct / d.total) * totalBarHeight : 0;
                    
                    return (
                        <g key={d.date} transform={`translate(${barX}, 0)`}>
                            <title>{`${d.date}: ${d.correct} correctes, ${d.incorrect} incorrectes`}</title>
                            <rect y={chartHeight - totalBarHeight} width={barWidth} height={totalBarHeight} fill="currentColor" className="text-slate-200 dark:text-slate-600" rx="4" />
                            <rect y={chartHeight - correctHeight} width={barWidth} height={correctHeight} fill="currentColor" className="text-green-500" rx="4" />
                            <text x={barWidth / 2} y={chartHeight + 20} textAnchor="middle" className="text-xs fill-current text-slate-500 dark:text-slate-400 font-mono">{d.date.substring(0, 5)}</text>
                        </g>
                    );
                })}
            </svg>
        </div>
        <div className="flex items-center justify-center sm:justify-end gap-4 mt-2 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-green-500"></span>
                <span>Correctes</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-slate-400 dark:bg-slate-600"></span>
                <span>Incorrectes</span>
            </div>
        </div>
      </div>
    );
  };


  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-xl shadow-2xl max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Historial de Pràctica</h2>
             {filteredHistory.length > 0 && (
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Encerts (segons filtre): <span className="font-bold text-green-500">{overallStats.accuracy}%</span>
                </p>
            )}
        </div>
        {practiceHistory.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                {filteredHistory.length > 0 && (
                    <>
                        <button
                            onClick={handleShareOnWhatsApp}
                            className="flex items-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                            aria-label="Compartir resultats a WhatsApp"
                        >
                            <svg viewBox="0 0 24 24" className="h-4 w-4 mr-2" fill="currentColor">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.269.655 4.512 1.924 6.344l-1.226 4.485 4.635-1.217z"/>
                            </svg>
                            <span>Compartir</span>
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex items-center bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                            aria-label="Exportar l'historial filtrat"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span>Exportar</span>
                        </button>
                    </>
                )}
                <button
                    onClick={onClearHistory}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                >
                    Buidar Historial
                </button>
            </div>
        )}
      </div>

      {practiceHistory.length > 0 && (
         <div className={`mb-8 p-4 rounded-lg border transition-colors ${
            isAnyFilterActive
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
        }`}>
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-slate-700 dark:text-slate-200">Filtres</h4>
                {isAnyFilterActive && (
                    <button
                        onClick={handleClearFilters}
                        className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        aria-label="Netejar tots els filtres"
                    >
                        Netejar Filtres
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Filtra per nivell</label>
                    <div className="flex flex-wrap gap-2">
                        {(['all', 'B1', 'B2', 'C1', 'C2'] as const).map(level => (
                            <button 
                            key={level} 
                            onClick={() => setLevelFilter(level)}
                            className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
                                levelFilter === level 
                                ? 'bg-blue-500 text-white shadow' 
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
                            }`}
                            >
                            {level === 'all' ? 'Tots' : level}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Filtra per resultat</label>
                    <div className="flex flex-wrap gap-2">
                        {(['all', 'correct', 'incorrect'] as const).map(result => (
                            <button 
                            key={result}
                            onClick={() => setCorrectnessFilter(result)}
                            className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
                                correctnessFilter === result 
                                ? 'bg-blue-500 text-white shadow' 
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
                            }`}
                            >
                            {result === 'all' ? 'Tots' : result === 'correct' ? 'Correctes' : 'Incorrectes'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Filtra per data</label>
                <div className="flex flex-col sm:flex-row gap-2 items-center">
                    <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full sm:w-auto px-3 py-1.5 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-700 dark:text-slate-200"
                        aria-label="Data d'inici"
                    />
                    <span className="text-slate-500 dark:text-slate-400 hidden sm:block">-</span>
                    <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full sm:w-auto px-3 py-1.5 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-700 dark:text-slate-200"
                        aria-label="Data de fi"
                        min={startDate}
                    />
                    {(startDate || endDate) && (
                        <button 
                            onClick={() => { setStartDate(''); setEndDate(''); }}
                            className="px-3 py-1.5 text-sm font-semibold rounded-md transition-colors bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500"
                            aria-label="Netejar filtres de data"
                        >
                            Netejar
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}


      {practiceHistory.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-slate-500 dark:text-slate-400">Encara no has completat cap exercici.</p>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Comença a practicar per a veure el teu progrés ací!</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="text-center py-12">
            <p className="text-lg text-slate-500 dark:text-slate-400">No hi ha cap exercici que coincideixi amb els filtres.</p>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Prova a canviar o eliminar els filtres de cerca.</p>
        </div>
      ) : (
        <>
          <PerformanceChart />
          <div className="space-y-6">
            {filteredHistory.map((item) => (
              <div key={item.timestamp} className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                      <p className="text-md text-slate-800 dark:text-slate-100 leading-relaxed">
                        <span className="font-bold text-blue-500 text-xs mr-2 py-0.5 px-1.5 bg-blue-100 dark:bg-blue-900 rounded-md">{item.level}</span>
                        {item.exercise.sentence.replace('[BLANK]', '______')}
                      </p>
                      <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0 ml-4 pt-1 text-right">
                          {formatTimestamp(item.timestamp)}
                      </span>
                  </div>

                <div className="flex items-center gap-3 p-3 rounded-md bg-slate-100 dark:bg-slate-700/50">
                  {item.isCorrect ? (
                    <span className="text-green-500 font-bold text-xl" aria-label="Correcte">✓</span>
                  ) : (
                    <span className="text-red-500 font-bold text-xl" aria-label="Incorrecte">✗</span>
                  )}
                  <p className="text-slate-700 dark:text-slate-300">
                    La teua resposta: <span className="font-semibold">{item.selectedAnswer}</span>
                  </p>
                </div>
                
                {!item.isCorrect && (
                  <div className="mt-2 p-3 rounded-md bg-green-50 dark:bg-green-900/20">
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                          Resposta correcta: <span className="font-semibold">{item.exercise.correctAnswer}</span>
                      </p>
                  </div>
                )}
                
                <div className="mt-4 p-4 bg-blue-50 dark:bg-gray-700/50 border-l-4 border-blue-400 rounded-r-lg">
                    <div className="flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h4 className="font-semibold text-slate-800 dark:text-slate-100">Explicació</h4>
                            <p className="text-slate-600 dark:text-slate-300 mt-1">{item.exercise.explanation}</p>
                        </div>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default History;
