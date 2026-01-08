
import React, { useState } from 'react';
import { Material } from '../types.ts';

interface Props {
  materials: Material[];
  setMaterials: (m: Material[]) => void;
}

const MaterialManager: React.FC<Props> = ({ materials, setMaterials }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Material>>({
    name: '',
    description: '',
    purchasePrice: 0,
    sellingPrice: 0,
    stock: 0
  });

  const handleOpenForm = (material?: Material) => {
    if (material) {
      setFormData(material);
      setEditingId(material.id);
    } else {
      setFormData({ name: '', description: '', purchasePrice: 0, sellingPrice: 0, stock: 0 });
      setEditingId(null);
    }
    setIsFormOpen(true);
  };

  const handleAddOrEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingId) {
      setMaterials(materials.map(m => m.id === editingId ? { ...m, ...formData } as Material : m));
    } else {
      const newMaterial: Material = {
        id: Date.now().toString(),
        name: formData.name || '',
        description: formData.description || '',
        purchasePrice: Number(formData.purchasePrice) || 0,
        sellingPrice: Number(formData.sellingPrice) || 0,
        stock: Number(formData.stock) || 0,
      };
      setMaterials([...materials, newMaterial]);
    }

    setFormData({ name: '', description: '', purchasePrice: 0, sellingPrice: 0, stock: 0 });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const removeMaterial = (id: string) => {
    if (confirm('Remover este material do estoque?')) {
      setMaterials(materials.filter(m => m.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Materiais</h2>
          <p className="text-slate-500">Controle de estoque e lucratividade.</p>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          {isFormOpen ? 'Fechar' : '📦 Novo Material'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleAddOrEdit} className="bg-white p-6 rounded-2xl border-2 border-indigo-100 shadow-xl animate-in slide-in-from-top duration-300">
          <h3 className="text-sm font-black text-slate-800 uppercase mb-4">{editingId ? 'Editar Item' : 'Novo Item no Estoque'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Item</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-300 outline-none" placeholder="Ex: Cabo Flexível 2.5mm" />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
              <input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-300 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Preço Compra (R$)</label>
              <input type="number" step="0.01" value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: Number(e.target.value)})} className="w-full p-2.5 rounded-lg border border-slate-300 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Preço Venda (R$)</label>
              <input type="number" step="0.01" value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: Number(e.target.value)})} className="w-full p-2.5 rounded-lg border border-slate-300 outline-none" />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Qtd Estoque</label>
              <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="w-full p-2.5 rounded-lg border border-slate-300 outline-none" />
            </div>
          </div>
          <button type="submit" className="mt-6 w-full bg-slate-800 text-white p-3 rounded-xl font-bold hover:bg-slate-900 transition-colors">
            {editingId ? 'Salvar Alterações' : 'Registrar no Estoque'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map(m => (
          <div key={m.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4">
              <h4 className="text-lg font-bold text-slate-800">{m.name}</h4>
              <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-tighter">Estoque: {m.stock} UNID.</p>
            </div>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Custo:</span>
                <span className="font-semibold text-slate-700 text-xs">R$ {m.purchasePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-50 pt-2">
                <span className="text-xs text-slate-500 font-bold uppercase">Preço Venda:</span>
                <span className="font-black text-indigo-600 text-lg">R$ {m.sellingPrice.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleOpenForm(m)}
                className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg font-bold text-[10px] hover:bg-indigo-600 hover:text-white transition-all uppercase"
              >
                Editar
              </button>
              <button 
                onClick={() => removeMaterial(m.id)}
                className="bg-rose-50 text-rose-500 px-3 py-2 rounded-lg font-bold text-[10px] hover:bg-rose-500 hover:text-white transition-all uppercase"
              >
                Remover
              </button>
            </div>
          </div>
        ))}
        {materials.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            Nenhum material registrado no momento.
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialManager;
