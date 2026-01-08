
import React, { useState } from 'react';
import { AppState } from '../types.ts';
import { generateFinancialInsight } from '../services/geminiService.ts';

interface Props {
  state: AppState;
}

const IAInsights: React.FC<Props> = ({ state }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateFinancialInsight(state);
    setInsight(result || "Erro ao carregar análise.");
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-indigo-700 text-white p-8 rounded-3xl shadow-xl overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Análise Inteligente (IA)</h2>
          <p className="text-indigo-100 opacity-90 max-w-lg mb-6">
            Utilizamos inteligência artificial para analisar seus dados financeiros, estoque e prestação de serviços para te dar insights reais sobre o seu negócio.
          </p>
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="bg-white text-indigo-700 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all disabled:opacity-50 flex items-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-indigo-700 border-t-transparent rounded-full animate-spin"></div>
                Analisando dados...
              </>
            ) : (
              <><span>✨</span> Gerar Análise de Negócio</>
            )}
          </button>
        </div>
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-indigo-600 rounded-full opacity-50 blur-3xl"></div>
      </div>

      {insight && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom duration-500">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span>📝</span> Relatório Gerado
          </h3>
          <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-600 leading-relaxed">
            {insight}
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
            <p>Análise baseada em {state.services.length} serviços e {state.materials.length} materiais.</p>
            <button onClick={() => setInsight(null)} className="hover:text-indigo-600 font-bold uppercase tracking-wider">Limpar</button>
          </div>
        </div>
      )}
      
      {!insight && !loading && (
        <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
          <p className="text-slate-400">Clique no botão acima para processar seus dados.</p>
        </div>
      )}
    </div>
  );
};

export default IAInsights;
