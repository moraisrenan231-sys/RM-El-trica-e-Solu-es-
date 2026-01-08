
import React, { useState } from 'react';
import { Customer } from '../types.ts';

interface Props {
  customers: Customer[];
  setCustomers: (c: Customer[]) => void;
}

const CustomerManager: React.FC<Props> = ({ customers, setCustomers }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({ name: '', phone: '', address: '' });

  const handleOpenForm = (customer?: Customer) => {
    if (customer) {
      setFormData(customer);
      setEditingId(customer.id);
    } else {
      setFormData({ name: '', phone: '', address: '' });
      setEditingId(null);
    }
    setIsFormOpen(true);
  };

  const handleAddOrEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingId) {
      setCustomers(customers.map(c => c.id === editingId ? { ...c, ...formData } as Customer : c));
    } else {
      const newCustomer: Customer = {
        id: Date.now().toString(),
        name: formData.name || '',
        phone: formData.phone || '',
        address: formData.address || '',
      };
      setCustomers([...customers, newCustomer]);
    }

    setFormData({ name: '', phone: '', address: '' });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const removeCustomer = (id: string) => {
    if (confirm('Deseja realmente remover este cliente?')) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Clientes</h2>
          <p className="text-slate-500">Gerencie sua base de contatos.</p>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          {isFormOpen ? 'Fechar' : '➕ Novo Cliente'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleAddOrEdit} className="bg-white p-6 rounded-2xl border-2 border-indigo-100 shadow-xl animate-in slide-in-from-top duration-300">
          <h3 className="text-sm font-black text-slate-800 uppercase mb-4">{editingId ? 'Editar Cliente' : 'Novo Cliente'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
              <input 
                required 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telefone / WhatsApp</label>
              <input 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" 
                placeholder="(00) 00000-0000" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
              <input 
                value={formData.address} 
                onChange={e => setFormData({...formData, address: e.target.value})} 
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" 
                placeholder="Rua, Número, Bairro" 
              />
            </div>
          </div>
          <button type="submit" className="mt-6 w-full bg-slate-800 text-white p-3 rounded-xl font-bold hover:bg-slate-900 transition-colors">
            {editingId ? 'Salvar Alterações' : 'Cadastrar Cliente'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Nome / Endereço</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Telefone</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-800">{c.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">{c.address || 'Sem endereço'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 font-medium">{c.phone || 'Sem telefone'}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenForm(c)} 
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-bold bg-indigo-50 px-3 py-1.5 rounded-lg"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => removeCustomer(c.id)} 
                        className="text-rose-500 hover:text-rose-700 text-xs font-bold bg-rose-50 px-3 py-1.5 rounded-lg"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-400">Nenhum cliente cadastrado ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerManager;
