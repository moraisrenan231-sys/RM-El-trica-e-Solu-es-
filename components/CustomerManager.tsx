
import React, { useState, useEffect } from 'react';
import { Customer } from '../types.ts';

interface Props {
  customers: Customer[];
  setCustomers: (c: Customer[]) => void;
}

interface IBGEState {
  sigla: string;
  nome: string;
}

interface IBGECity {
  nome: string;
}

const CustomerManager: React.FC<Props> = ({ customers, setCustomers }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({ 
    name: '', phone: '', cep: '', state: '', city: '', neighborhood: '', street: '' 
  });
  
  const [states, setStates] = useState<IBGEState[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCEP, setLoadingCEP] = useState(false);

  // Buscar estados ao montar o componente
  useEffect(() => {
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then(res => res.json())
      .then(data => setStates(data));
  }, []);

  // Buscar cidades quando o estado mudar
  useEffect(() => {
    if (formData.state) {
      fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${formData.state}/municipios?orderBy=nome`)
        .then(res => res.json())
        .then(data => setCities(data.map((c: IBGECity) => c.nome)));
    } else {
      setCities([]);
    }
  }, [formData.state]);

  const handleCEPBlur = async () => {
    const cep = formData.cep?.replace(/\D/g, '');
    if (cep && cep.length === 8) {
      setLoadingCEP(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            street: data.logradouro,
            neighborhood: data.bairro,
            state: data.uf,
            city: data.localidade
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP", error);
      } finally {
        setLoadingCEP(false);
      }
    }
  };

  const handleOpenForm = (customer?: Customer) => {
    if (customer) {
      setFormData(customer);
      setEditingId(customer.id);
    } else {
      setFormData({ name: '', phone: '', cep: '', state: '', city: '', neighborhood: '', street: '' });
      setEditingId(null);
    }
    setIsFormOpen(true);
  };

  const handleAddOrEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const fullAddress = `${formData.street}, ${formData.neighborhood}, ${formData.city}-${formData.state}`;

    if (editingId) {
      setCustomers(customers.map(c => c.id === editingId ? { ...c, ...formData, address: fullAddress } as Customer : c));
    } else {
      const newCustomer: Customer = {
        id: Date.now().toString(),
        name: formData.name || '',
        phone: formData.phone || '',
        cep: formData.cep || '',
        state: formData.state || '',
        city: formData.city || '',
        neighborhood: formData.neighborhood || '',
        street: formData.street || '',
        address: fullAddress,
      };
      setCustomers([...customers, newCustomer]);
    }

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
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Clientes</h2>
          <p className="text-slate-500 text-sm">Gerencie sua base de contatos e endereços.</p>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 transition-all flex items-center gap-2"
        >
          {isFormOpen ? 'Fechar' : '➕ Novo Cliente'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleAddOrEdit} className="bg-white p-6 md:p-8 rounded-[2.5rem] border-2 border-indigo-100 shadow-2xl space-y-6 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3 mb-2">
             <div className="bg-indigo-100 p-3 rounded-2xl text-xl">👤</div>
             <h3 className="font-black text-slate-800 uppercase tracking-tighter">{editingId ? 'Editar Cliente' : 'Novo Cadastro'}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-500 focus:bg-white outline-none font-bold" />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefone / WhatsApp</label>
              <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-500 focus:bg-white outline-none font-bold" placeholder="(00) 00000-0000" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CEP (Auto-preenchimento)</label>
              <div className="relative">
                <input 
                  value={formData.cep} 
                  onChange={e => setFormData({...formData, cep: e.target.value})} 
                  onBlur={handleCEPBlur}
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-500 focus:bg-white outline-none font-bold" 
                  placeholder="00000-000" 
                />
                {loadingCEP && <div className="absolute right-4 top-4 w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado (UF)</label>
              <select value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-500 focus:bg-white outline-none font-bold">
                <option value="">Selecione...</option>
                {states.map(s => <option key={s.sigla} value={s.sigla}>{s.nome}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cidade</label>
              <select value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-500 focus:bg-white outline-none font-bold" disabled={!formData.state}>
                <option value="">Selecione...</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bairro</label>
              <input value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-500 focus:bg-white outline-none font-bold" placeholder="Digite o bairro..." />
            </div>

            <div className="lg:col-span-2 flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rua / Logradouro</label>
              <input value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-500 focus:bg-white outline-none font-bold" placeholder="Digite a rua e o número..." />
            </div>
          </div>
          
          <button type="submit" className="w-full bg-slate-900 text-white p-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl">
            {editingId ? '💾 Salvar Alterações' : '✨ Finalizar Cadastro'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all group">
            <div className="mb-4">
              <h4 className="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{c.name}</h4>
              <div className="mt-3 space-y-1">
                <p className="text-xs text-slate-500 font-bold flex items-center gap-2">
                  <span>📍</span> {c.street || 'Rua não cadastrada'}
                </p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">
                  {c.neighborhood ? `${c.neighborhood}, ` : ''}{c.city} - {c.state}
                </p>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-2xl mb-6 flex items-center justify-between">
               <span className="text-[10px] font-black text-slate-400 uppercase">WhatsApp</span>
               <span className="text-sm font-black text-indigo-600">{c.phone || 'Sem contato'}</span>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => handleOpenForm(c)} 
                className="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-black text-[10px] hover:bg-slate-900 hover:text-white transition-all uppercase"
              >
                Editar
              </button>
              <button 
                onClick={() => removeCustomer(c.id)} 
                className="bg-rose-50 text-rose-500 px-4 py-3 rounded-xl font-black text-[10px] hover:bg-rose-500 hover:text-white transition-all uppercase"
              >
                Remover
              </button>
            </div>
          </div>
        ))}
        {customers.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
             <div className="text-5xl mb-4">👥</div>
             <p className="font-black text-slate-300 uppercase tracking-widest">Nenhum cliente cadastrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerManager;
