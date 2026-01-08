
import React, { useMemo, useEffect, useState } from 'react';
import { AppState, ServiceStatus } from '../types.ts';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }
  }, []);

  const stats = useMemo(() => {
    const totalRevenue = state.services.reduce((acc, curr) => acc + curr.totalValue, 0);
    const totalCustomers = state.customers.length;
    const totalServices = state.services.length;
    const lowStock = state.materials.filter(m => m.stock < 5).length;

    return { totalRevenue, totalCustomers, totalServices, lowStock };
  }, [state]);

  const cards = [
    { label: 'Faturamento Total', value: `R$ ${stats.totalRevenue.toLocaleString('pt-BR')}`, icon: '💰', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { label: 'Clientes Ativos', value: stats.totalCustomers, icon: '👥', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
    { label: 'Serviços Realizados', value: stats.totalServices, icon: '🛠️', color: 'bg-amber-50 text-amber-700 border-amber-100' },
    { label: 'Alertas de Estoque', value: stats.lowStock, icon: '📦', color: 'bg-rose-50 text-rose-700 border-rose-100' },
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
      {/* BANNER DE INSTALAÇÃO - MUITO MAIS CLARO */}
      {!isStandalone && (
        <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border-4 border-indigo-400">
          <div className="relative z-10 text-center md:text-left">
            <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">Acesso Rápido</div>
            <h3 className="text-3xl font-black mb-2 tracking-tighter">Colocar App na Tela Inicial</h3>
            <p className="text-indigo-100 mb-2 font-medium max-w-md">Isso cria um ícone da RM Elétrica no seu celular para você abrir sem precisar de site.</p>
          </div>
          <div className="shrink-0">
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('open-install-help'))}
              className="bg-white text-indigo-700 px-10 py-5 rounded-2xl font-black shadow-2xl hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-wider"
            >
              COMO BAIXAR AGORA 📲
            </button>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] text-[150px] opacity-10 pointer-events-none rotate-12">⚡</div>
        </div>
      )}

      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">⚡</span>
             </div>
             <div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter leading-none">
                  RM Elétrica
                </h2>
                <p className="text-indigo-400 font-bold uppercase tracking-[0.2em] text-[10px]">Gestão Profissional</p>
             </div>
          </div>
          <p className="text-slate-300 text-base md:text-lg font-medium max-w-xl">
            Tudo o que você precisa para gerenciar sua prestação de serviços e estoque em um só lugar.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] -mr-20 -mt-20"></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div key={i} className={`p-4 md:p-6 rounded-3xl border ${card.color} shadow-sm transition-all hover:shadow-md`}>
            <div className="text-xl md:text-2xl mb-2">{card.icon}</div>
            <p className="text-[10px] md:text-xs font-bold opacity-70 uppercase tracking-wider">{card.label}</p>
            <p className="text-xl md:text-2xl font-black mt-1 leading-none">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black flex items-center gap-2 text-slate-800">
              <span>📅</span> Serviços Recentes
            </h3>
            <button className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl">Ver Todos</button>
          </div>
          <div className="space-y-4">
            {state.services.slice(-5).reverse().map((s) => {
              const customer = state.customers.find(c => c.id === s.customerId);
              return (
                <div key={s.id} className="flex justify-between items-center p-4 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="font-black text-slate-700 truncate text-sm">{customer?.name || 'Cliente Removido'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[8px] px-2 py-0.5 rounded-lg font-black uppercase ${getStatusColor(s.status)}`}>
                        {s.status}
                      </span>
                      <p className="text-[10px] text-slate-400 font-bold">{s.date}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-indigo-600 text-sm">R$ {s.totalValue.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
            {state.services.length === 0 && <p className="text-slate-400 text-center py-12 text-sm font-medium">Nenhum serviço registrado.</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-slate-800">
            <span>⚠️</span> Estoque em Alerta
          </h3>
          <div className="space-y-4">
            {state.materials.filter(m => m.stock < 10).sort((a, b) => a.stock - b.stock).slice(0, 5).map((m) => (
              <div key={m.id} className="flex justify-between items-center p-4 border border-slate-50 rounded-2xl bg-slate-50/30">
                <div>
                  <p className="font-black text-slate-700 text-sm">{m.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Venda: R$ {m.sellingPrice.toFixed(2)}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black shadow-sm ${m.stock < 5 ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'}`}>
                  QTD: {m.stock}
                </span>
              </div>
            ))}
             {state.materials.length === 0 && <p className="text-slate-400 text-center py-12 text-sm font-medium">Nenhum material cadastrado.</p>}
             {state.materials.length > 0 && state.materials.filter(m => m.stock < 10).length === 0 && (
               <div className="text-center py-12">
                 <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                   <span className="text-3xl">✅</span>
                 </div>
                 <p className="text-emerald-600 text-sm font-black">Estoque 100% em dia!</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
