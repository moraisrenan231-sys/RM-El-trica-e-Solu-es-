
import React, { useState, useEffect } from 'react';
import { Customer, Material, ServiceRecord, AppState, ServiceType } from './types.ts';
import { NAV_ITEMS } from './constants.tsx';
import Dashboard from './components/Dashboard.tsx';
import CustomerManager from './components/CustomerManager.tsx';
import MaterialManager from './components/MaterialManager.tsx';
import ServiceManager from './components/ServiceManager.tsx';
import ServiceTypeManager from './components/ServiceTypeManager.tsx';
import IAInsights from './components/IAInsights.tsx';
import CalendarView from './components/CalendarView.tsx';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }
    
    const handleOpenInstallHelp = () => setShowInstallHelp(true);
    window.addEventListener('open-install-help', handleOpenInstallHelp);
    
    const timer = setTimeout(() => {
      if (!isStandalone) {
        const hasSeenHelp = localStorage.getItem('has_seen_install_help');
        if (!hasSeenHelp) {
          setShowInstallHelp(true);
          localStorage.setItem('has_seen_install_help', 'true');
        }
      }
    }, 3000);

    return () => {
      window.removeEventListener('open-install-help', handleOpenInstallHelp);
      clearTimeout(timer);
    };
  }, [isStandalone]);

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('gestor_pro_state');
    const defaultState = {
      customers: [],
      materials: [],
      serviceTypes: [],
      services: []
    };
    if (saved) {
      const parsed = JSON.parse(saved);
      // Garantir que novas chaves existam ao carregar estado antigo
      return { ...defaultState, ...parsed };
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem('gestor_pro_state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      setShowInstallHelp(true);
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `backup_rm_eletrica_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard state={state} />;
      case 'calendar': return <CalendarView state={state} onAddService={() => setActiveTab('services')} />;
      case 'customers': return <CustomerManager customers={state.customers} setCustomers={(c) => setState(prev => ({ ...prev, customers: c }))} />;
      case 'service-types': return <ServiceTypeManager serviceTypes={state.serviceTypes} setServiceTypes={(s) => setState(prev => ({ ...prev, serviceTypes: s }))} />;
      case 'materials': return <MaterialManager materials={state.materials} setMaterials={(m) => setState(prev => ({ ...prev, materials: m }))} />;
      case 'services': return (
        <ServiceManager 
          services={state.services} 
          setServices={(s) => setState(prev => ({ ...prev, services: s }))}
          customers={state.customers}
          materials={state.materials}
          serviceTypes={state.serviceTypes}
        />
      );
      case 'insights': return <IAInsights state={state} />;
      default: return <Dashboard state={state} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {!isStandalone && (
        <button 
          onClick={handleInstallClick}
          className="fixed bottom-6 right-6 z-[60] md:hidden bg-indigo-600 text-white px-6 py-5 rounded-full font-black shadow-[0_10px_30px_rgba(79,70,229,0.5)] flex items-center gap-3 animate-pulse border-4 border-white"
        >
          <span className="text-2xl">📲</span>
          BAIXAR APP AGORA
        </button>
      )}

      <nav className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 md:h-screen z-20 shadow-sm md:shadow-none">
        <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center md:block">
          <div>
            <div className="flex flex-col gap-1 text-left">
              <h1 className="text-xl font-black text-indigo-700 leading-tight">RM Elétrica</h1>
              <h2 className="text-sm font-bold text-slate-400 tracking-tighter">& Soluções</h2>
            </div>
          </div>
          <div className="flex gap-2 md:hidden">
            <button onClick={handleExportData} className="bg-slate-100 text-slate-700 p-2 rounded-lg" title="Backup">💾</button>
          </div>
        </div>
        
        <div className="flex-1 p-2 md:p-4 flex flex-row md:flex-col gap-2 overflow-x-auto no-scrollbar">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium whitespace-nowrap flex-shrink-0 ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
        
        <div className="p-4 border-t border-slate-100 hidden md:block space-y-2">
          {!isStandalone && (
            <button 
              onClick={handleInstallClick}
              className="w-full bg-indigo-600 text-white hover:bg-indigo-700 p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-black transition-all shadow-md"
            >
              <span>📲</span> Baixar Aplicativo
            </button>
          )}
          <button 
            onClick={handleExportData}
            className="w-full bg-slate-100 text-slate-600 hover:bg-slate-200 p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors"
          >
            <span>💾</span> Baixar Backup
          </button>
        </div>
      </nav>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {showInstallHelp && (
        <div className="fixed inset-0 bg-indigo-900/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowInstallHelp(false)}>
          <div className="bg-white rounded-[2.5rem] p-6 max-w-md w-full shadow-2xl animate-in zoom-in duration-300 relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="absolute top-4 right-4">
              <button onClick={() => setShowInstallHelp(false)} className="bg-slate-100 text-slate-500 w-10 h-10 rounded-full font-bold">✕</button>
            </div>

            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-xl">
                <span className="text-4xl">⚡</span>
              </div>
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Instalar Aplicativo</h3>
              <p className="text-sm text-slate-500 mt-1 font-medium italic">Siga os passos abaixo no seu celular:</p>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 rounded-2xl border-2 border-indigo-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black">1</div>
                  <p className="font-black text-indigo-700 text-sm">NO ANDROID (Samsung, etc)</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Clique nos <span className="font-black text-slate-900 text-lg">⋮ (3 pontinhos)</span> no topo da tela do navegador e depois em <span className="bg-indigo-600 text-white px-2 py-0.5 rounded font-bold">Instalar aplicativo</span>.
                </p>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-black">2</div>
                  <p className="font-black text-amber-700 text-sm">NO IPHONE (Apple)</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Clique no ícone de <span className="text-xl">⎋</span> (compartilhar) no meio da tela e escolha a opção <span className="font-bold text-slate-800">"Adicionar à Tela de Início"</span>.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button 
                onClick={() => setShowInstallHelp(false)}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg"
              >
                ENTENDI, VOU FAZER!
              </button>
              <p className="text-[10px] text-center text-slate-400 font-bold">Isso não ocupa memória do seu celular!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
