
import React, { useMemo } from 'react';
import { AppState, ServiceStatus } from '../types.ts';

interface DashboardProps {
  state: AppState;
  onNavigate: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onNavigate }) => {
  const stats = useMemo(() => {
    const totalRevenue = state.services.reduce((acc, curr) => acc + curr.totalValue, 0);
    const totalCustomers = state.customers.length;
    const totalServices = state.services.length;
    const lowStock = state.materials.filter(m => m.stock < 10).length;

    return { totalRevenue, totalCustomers, totalServices, lowStock };
  }, [state]);

  const cards = [
    { id: 'insights', label: 'Faturamento Total', value: `R$ ${stats.totalRevenue.toLocaleString('pt-BR')}`, icon: '💰', color: 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' },
    { id: 'customers', label: 'Clientes Ativos', value: stats.totalCustomers, icon: '👥', color: 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100' },
    { id: 'services', label: 'Notas Emitidas', value: stats.totalServices, icon: '📋', color: 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100' },
    { id: 'materials', label: 'Itens em Alerta', value: stats.lowStock, icon: '📦', color: 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100' },
  ];

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case ServiceStatus.COMPLETED: return 'bg-emerald-100 text-emerald-700';
      case ServiceStatus.IN_PROGRESS: return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-10 md:p-14 text-white shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-6 mb-6">
             <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-indigo-500/50">
                <span className="text-3xl">⚡</span>
             </div>
             <div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">
                  RM Elétrica & Soluções
                </h2>
                <p className="text-indigo-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Painel Operacional Estratégico</p>
             </div>
          </div>
          <p className="text-slate-300 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
            Gestão profissional de serviços e notas para especialistas. Controle total de faturamento, estoque e agenda em um só lugar.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] -mr-32 -mt-32"></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {cards.map((card, i) => (
          <button 
            key={i} 
            onClick={() => onNavigate(card.id)}
            className={`p-6 md:p-8 rounded-[2.5rem] border ${card.color} shadow-sm transition-all hover:shadow-2xl hover:-translate-y-2 text-left flex flex-col group relative overflow-hidden`}
          >
            <div className="text-3xl md:text-4xl mb-4 group-hover:scale-125 transition-transform duration-300">{card.icon}</div>
            <p className="text-[10px] md:text-xs font-black opacity-70 uppercase tracking-widest">{card.label}</p>
            <p className="text-2xl md:text-3xl font-black mt-1 leading-none tracking-tighter">{card.value}</p>
            <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 bg-white/40 p-2 rounded-xl backdrop-blur-sm">
               <span className="text-[10px] font-black uppercase">Gerenciar →</span>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black flex items-center gap-3 text-slate-800">
              <span className="bg-indigo-50 p-2 rounded-xl">📅</span> Atendimentos Recentes
            </h3>
            <button onClick={() => onNavigate('services')} className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors uppercase tracking-widest border border-indigo-100">Ver Todos</button>
          </div>
          <div className="space-y-4 flex-1">
            {state.services.slice(-5).reverse().map((s) => {
              const customer = state.customers.find(c => c.id === s.customerId);
              return (
                <div 
                  key={s.id} 
                  onClick={() => onNavigate('services')}
                  className="flex justify-between items-center p-5 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all cursor-pointer group"
                >
                  <div className="flex-1 min-w-0 mr-6">
                    <p className="font-black text-slate-800 truncate text-base group-hover:text-indigo-600 transition-colors">{customer?.name || 'Cliente Particular'}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className={`text-[9px] px-3 py-1 rounded-lg font-black uppercase ${getStatusColor(s.status)}`}>
                        {s.status}
                      </span>
                      <p className="text-[11px] text-slate-400 font-bold">{new Date(s.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-slate-900 text-lg tracking-tighter">R$ {s.totalValue.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
            {state.services.length === 0 && (
              <div className="text-center py-20 flex flex-col items-center">
                 <p className="text-slate-300 font-black uppercase text-xs tracking-widest">Nenhum serviço registrado ainda</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black flex items-center gap-3 text-slate-800">
              <span className="bg-rose-50 p-2 rounded-xl">⚠️</span> Ruptura de Estoque
            </h3>
            <button onClick={() => onNavigate('materials')} className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors uppercase tracking-widest border border-indigo-100">Inventário</button>
          </div>
          <div className="space-y-4 flex-1">
            {state.materials.filter(m => m.stock < 10).sort((a, b) => a.stock - b.stock).slice(0, 5).map((m) => (
              <div 
                key={m.id} 
                onClick={() => onNavigate('materials')}
                className="flex justify-between items-center p-5 border border-slate-50 rounded-2xl bg-slate-50/40 hover:bg-slate-100 transition-all cursor-pointer group"
              >
                <div>
                  <p className="font-black text-slate-800 text-base group-hover:text-rose-600">{m.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">Preço Sugerido: R$ {m.sellingPrice.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3">
                   <span className={`px-4 py-2 rounded-xl text-xs font-black shadow-sm ${m.stock < 5 ? 'bg-rose-600 text-white animate-pulse' : 'bg-amber-500 text-white'}`}>
                     {m.stock} UN
                   </span>
                </div>
              </div>
            ))}
             {state.materials.length === 0 && (
               <div className="text-center py-20 flex flex-col items-center">
                 <p className="text-slate-300 font-black uppercase text-xs tracking-widest">Catálogo de materiais vazio</p>
               </div>
             )}
             {state.materials.length > 0 && state.materials.filter(m => m.stock < 10).length === 0 && (
               <div className="text-center py-20 bg-emerald-50/30 rounded-[2rem] border border-dashed border-emerald-100">
                 <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                   <span className="text-4xl">✅</span>
                 </div>
                 <p className="text-emerald-700 text-sm font-black uppercase tracking-widest">Estoque Saudável</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
