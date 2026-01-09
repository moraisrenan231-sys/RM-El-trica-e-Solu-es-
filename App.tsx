
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
      return { ...defaultState, ...parsed };
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem('gestor_pro_state', JSON.stringify(state));
  }, [state]);

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
      case 'dashboard': return <Dashboard state={state} onNavigate={(tab) => setActiveTab(tab)} />;
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
      default: return <Dashboard state={state} onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <nav className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 md:h-screen z-20 shadow-sm md:shadow-none">
        <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center md:block">
          <div>
            <div className="flex flex-col gap-1 text-left">
              <h1 className="text-xl font-black text-indigo-700 leading-tight uppercase tracking-tighter">RM Elétrica</h1>
              <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase">Gestão Profissional</h2>
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
        
        <div className="p-4 border-t border-slate-100 hidden md:block">
          <button 
            onClick={handleExportData}
            className="w-full bg-slate-100 text-slate-600 hover:bg-slate-200 p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors"
          >
            <span>💾</span> Baixar Backup
          </button>
        </div>
      </nav>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-8">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
