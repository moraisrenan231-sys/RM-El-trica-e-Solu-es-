
import React, { useState } from 'react';
import { ServiceType } from '../types.ts';

interface Props {
  serviceTypes: ServiceType[];
  setServiceTypes: (s: ServiceType[]) => void;
}

const ServiceTypeManager: React.FC<Props> = ({ serviceTypes, setServiceTypes }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ServiceType>>({
    name: '',
    description: '',
    baseValue: 0
  });

  const handleOpenForm = (type?: ServiceType) => {
    if (type) {
      setFormData(type);
      setEditingId(type.id);
    } else {
      setFormData({ name: '', description: '', baseValue: 0 });
      setEditingId(null);
    }
    setIsFormOpen(true);
  };

  const handleAddOrEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingId) {
      setServiceTypes(serviceTypes.map(s => s.id === editingId ? { ...s, ...formData } as ServiceType : s));
    } else {
      const newType: ServiceType = {
        id: Date.now().toString(),
        name: formData.name || '',
        description: formData.description || '',
        baseValue: Number(formData.baseValue) || 0,
      };
      setServiceTypes([...serviceTypes, newType]);
    }

    setFormData({ name: '', description: '', baseValue: 0 });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const removeType = (id: string) => {
    if (confirm('Deseja remover este serviço do catálogo?')) {
      setServiceTypes(serviceTypes.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Catálogo de Serviços</h2>
          <p className="text-slate-500">Serviços pré-definidos para orçamentos rápidos.</p>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          {isFormOpen ? 'Fechar' : '➕ Novo Serviço'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleAddOrEdit} className="bg-white p-6 rounded-2xl border-2 border-indigo-100 shadow-xl animate-in slide-in-from-top duration-300">
          <h3 className="text-sm font-black text-slate-800 uppercase mb-4">{editingId ? 'Editar Serviço' : 'Novo Serviço no Catálogo'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Serviço</label>
              <input 
                required 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" 
                placeholder="Ex: Instalação de Ar Condicionado" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Preço Sugerido (R$)</label>
              <input 
                type="number" 
                step="0.01" 
                value={formData.baseValue} 
                onChange={e => setFormData({...formData, baseValue: Number(e.target.value)})} 
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Descrição Curta</label>
              <textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none h-20" 
                placeholder="O que está incluso neste serviço?"
              />
            </div>
          </div>
          <button type="submit" className="mt-6 w-full bg-slate-800 text-white p-3 rounded-xl font-bold hover:bg-slate-900 transition-colors">
            {editingId ? 'Salvar Alterações' : 'Adicionar ao Catálogo'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceTypes.map(s => (
          <div key={s.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="mb-4">
              <h4 className="text-lg font-black text-slate-800">{s.name}</h4>
              {s.description && <p className="text-xs text-slate-500 mt-1 leading-relaxed italic line-clamp-2">{s.description}</p>}
            </div>
            <div className="flex justify-between items-center border-t border-slate-50 pt-4 mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Preço Base</span>
              <span className="font-black text-indigo-600 text-xl">R$ {s.baseValue.toFixed(2)}</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleOpenForm(s)}
                className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg font-bold text-xs hover:bg-indigo-600 hover:text-white transition-all"
              >
                EDITAR
              </button>
              <button 
                onClick={() => removeType(s.id)}
                className="bg-rose-50 text-rose-500 px-4 py-2 rounded-lg font-bold text-xs hover:bg-rose-500 hover:text-white transition-all"
              >
                EXCLUIR
              </button>
            </div>
          </div>
        ))}
        {serviceTypes.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-100">
             <div className="text-4xl mb-2">📋</div>
             <p className="font-medium">Seu catálogo de serviços está vazio.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceTypeManager;
