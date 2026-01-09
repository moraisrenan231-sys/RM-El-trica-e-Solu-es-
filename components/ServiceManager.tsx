
import React, { useState, useMemo, useEffect } from 'react';
import { ServiceRecord, Customer, Material, PaymentMethod, ServiceStatus, ServiceMaterial, ServiceItem, ServiceType } from '../types.ts';

interface Props {
  services: ServiceRecord[];
  setServices: (s: ServiceRecord[]) => void;
  customers: Customer[];
  materials: Material[];
  serviceTypes: ServiceType[];
}

const ServiceNoteModal: React.FC<{ 
  service: ServiceRecord; 
  customer: Customer | undefined; 
  allMaterials: Material[]; 
  allServiceTypes: ServiceType[];
  onClose: () => void 
}> = ({ service, customer, allMaterials, allServiceTypes, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleDownloadPDF = async () => {
    // @ts-ignore
    if (typeof html2pdf === 'undefined') {
      alert('O sistema de PDF está sendo carregado. Por favor, aguarde 3 segundos.');
      return;
    }

    setIsGenerating(true);
    const element = document.getElementById('receipt-pdf-content');
    
    if (!element) {
      alert('Erro: Conteúdo do recibo não encontrado.');
      setIsGenerating(false);
      return;
    }

    const customerName = (customer?.name || 'Cliente').replace(/[^a-z0-9]/gi, '_');
    const fileName = `RM_Recibo_${service.id.slice(-6)}_${customerName}.pdf`;

    const options = {
      margin: 10,
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        logging: false
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      // @ts-ignore
      await html2pdf().set(options).from(element).save();
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Não foi possível baixar o PDF diretamente. Tente tirar um print da tela ou compartilhar via WhatsApp.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (!customer?.phone) { alert('Este cliente não possui telefone cadastrado.'); return; }
    const cleanPhone = customer.phone.replace(/\D/g, '');
    
    const serviceItemsStr = service.serviceItems.map(si => {
      const type = allServiceTypes.find(t => t.id === si.serviceTypeId);
      return `• ${si.quantity}x ${type?.name || 'Serviço'} - R$ ${(si.quantity * (type?.baseValue || 0)).toFixed(2)}`;
    }).join('\n');

    const materialItemsStr = service.materials.map(sm => {
      const mat = allMaterials.find(m => m.id === sm.materialId);
      return `• ${sm.quantity}x ${mat?.name || 'Material'} - R$ ${(sm.quantity * (mat?.sellingPrice || 0)).toFixed(2)}`;
    }).join('\n');

    const message = `*RM ELÉTRICA & SOLUÇÕES*
*RECIBO DE SERVIÇO*
--------------------------------
*Protocolo:* #${service.id.slice(-6).toUpperCase()}
*Cliente:* ${customer.name}
*Data:* ${new Date(service.date).toLocaleDateString('pt-BR')}

*SERVIÇOS:*
${serviceItemsStr || 'Mão de obra técnica'}

*MATERIAIS:*
${materialItemsStr || 'Nenhum material'}

*VALOR TOTAL:* R$ ${service.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
*PAGAMENTO:* ${service.paymentMethod}
--------------------------------
*Técnico:* Renan Morais
*WhatsApp:* (14) 99179-8868

_Agradecemos a preferência!_`;

    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 z-[500] flex items-center justify-center p-2 md:p-4 backdrop-blur-sm overflow-hidden">
      <div className="bg-white w-full max-w-4xl h-full md:h-[95vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        <div className="p-4 border-b flex flex-wrap gap-2 justify-between items-center bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-slate-500 font-bold text-xs uppercase hover:bg-slate-200 rounded-lg transition-all">✕ Fechar</button>
          <div className="flex gap-2">
            <button onClick={handleShareWhatsApp} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-black text-xs shadow-lg flex items-center gap-2">
               📱 WHATSAPP
            </button>
            <button onClick={handleDownloadPDF} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-black text-xs shadow-lg flex items-center gap-2">
               📥 BAIXAR PDF
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-slate-100">
          <div id="receipt-pdf-content" className="bg-white p-8 md:p-12 shadow-sm max-w-[210mm] mx-auto text-slate-800 flex flex-col font-sans">
            
            <div className="flex justify-between items-start border-b-4 border-indigo-600 pb-6 mb-8">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">RM ELÉTRICA & SOLUÇÕES</h1>
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">Serviços Elétricos Profissionais</p>
                <div className="mt-4 text-[10px] text-slate-500 font-bold space-y-0.5">
                  <p>Técnico: Renan Morais</p>
                  <p>Contato: (14) 99179-8868</p>
                  <p>Lençóis Paulista - SP</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-slate-900 text-white px-3 py-1.5 rounded-md font-black text-[9px] inline-block mb-1 uppercase">Recibo Oficial</div>
                <p className="text-xs font-black text-slate-400">#{service.id.slice(-6).toUpperCase()}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">{new Date(service.date).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="text-[9px] font-black text-slate-400 uppercase mb-1">Cliente</h4>
                <p className="text-sm font-black text-slate-800">{customer?.name}</p>
                <p className="text-[10px] text-slate-500">{customer?.address}</p>
                <p className="text-[10px] text-indigo-600 font-bold mt-1">{customer?.phone}</p>
              </div>
              <div className="text-right p-4">
                <h4 className="text-[9px] font-black text-slate-400 uppercase mb-1">Pagamento</h4>
                <p className="text-sm font-black text-slate-800 uppercase">{service.paymentMethod}</p>
                {service.paymentMethod === PaymentMethod.CREDIT_CARD && (
                  <p className="text-[10px] font-bold text-indigo-500">{service.installments} parcelas</p>
                )}
                <div className="mt-2 text-[9px] font-black text-slate-400 uppercase">Status: {service.status}</div>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-[9px] font-black text-slate-400 uppercase mb-2">Relato do Atendimento</h4>
              <div className="p-4 bg-slate-50 rounded-xl border-l-4 border-indigo-600">
                <p className="text-[11px] text-slate-600 leading-relaxed italic whitespace-pre-wrap">{service.description || "Nenhuma observação adicional."}</p>
              </div>
            </div>

            <div className="flex-1 mb-8">
              <table className="w-full text-[11px]">
                <thead className="bg-slate-900 text-white uppercase text-[9px] font-black">
                  <tr>
                    <th className="px-4 py-3 text-left">Descrição</th>
                    <th className="px-4 py-3 text-center">Qtd</th>
                    <th className="px-4 py-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 border-b border-slate-200">
                  {service.serviceItems.map((si, idx) => {
                    const type = allServiceTypes.find(t => t.id === si.serviceTypeId);
                    return (
                      <tr key={idx}>
                        <td className="px-4 py-3">
                          <p className="font-bold">{type?.name}</p>
                          <p className="text-[8px] text-slate-400 uppercase">Mão de Obra</p>
                        </td>
                        <td className="px-4 py-3 text-center">{si.quantity}</td>
                        <td className="px-4 py-3 text-right font-bold">R$ {(si.quantity * (type?.baseValue || 0)).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                  {service.materials.map((sm, idx) => {
                    const mat = allMaterials.find(m => m.id === sm.materialId);
                    return (
                      <tr key={idx} className="bg-slate-50/30">
                        <td className="px-4 py-3 text-slate-600">
                          <p className="font-medium">{mat?.name}</p>
                          <p className="text-[8px] text-slate-400 uppercase">Material</p>
                        </td>
                        <td className="px-4 py-3 text-center">{sm.quantity}</td>
                        <td className="px-4 py-3 text-right font-bold">R$ {(sm.quantity * (mat?.sellingPrice || 0)).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  {service.discount > 0 && (
                    <tr className="text-rose-600 font-bold">
                      <td colSpan={2} className="px-4 py-2 text-right uppercase text-[9px]">Desconto</td>
                      <td className="px-4 py-2 text-right">- R$ {service.discount.toFixed(2)}</td>
                    </tr>
                  )}
                  <tr className="bg-slate-900 text-white">
                    <td colSpan={2} className="px-4 py-4 text-right font-black uppercase text-[10px]">Total do Recibo</td>
                    <td className="px-4 py-4 text-right text-lg font-black">
                      R$ {service.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-12 pt-8 border-t border-dashed border-slate-200">
              <div className="text-center">
                <div className="border-b border-slate-900 h-8 mb-2"></div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Renan Morais - RM Elétrica</p>
              </div>
              <div className="text-center">
                <div className="border-b border-slate-900 h-8 mb-2"></div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{customer?.name || 'Assinatura do Cliente'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isGenerating && (
        <div className="fixed inset-0 bg-indigo-900/80 z-[600] flex flex-col items-center justify-center text-white backdrop-blur-md">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-black uppercase tracking-[0.2em] text-xs">Processando Recibo...</p>
        </div>
      )}
    </div>
  );
};

const ServiceManager: React.FC<Props> = ({ services, setServices, customers, materials, serviceTypes }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  
  const initialForm: Partial<ServiceRecord> = {
    customerId: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    serviceItems: [],
    materials: [],
    paymentMethod: PaymentMethod.PIX,
    installments: 1,
    status: ServiceStatus.COMPLETED,
    discount: 0
  };

  const [formData, setFormData] = useState<Partial<ServiceRecord>>(initialForm);
  const [tempService, setTempService] = useState({ id: '', qty: 1 });
  const [tempMaterial, setTempMaterial] = useState({ id: '', qty: 1 });

  const currentTotals = useMemo(() => {
    const labor = (formData.serviceItems || []).reduce((acc, curr) => {
      const type = serviceTypes.find(t => t.id === curr.serviceTypeId);
      return acc + (type ? type.baseValue * curr.quantity : 0);
    }, 0);
    const mats = (formData.materials || []).reduce((acc, curr) => {
      const mat = materials.find(m => m.id === curr.materialId);
      return acc + (mat ? mat.sellingPrice * curr.quantity : 0);
    }, 0);
    const total = (labor + mats) - (formData.discount || 0);
    return { labor, mats, total: total < 0 ? 0 : total };
  }, [formData.serviceItems, formData.materials, formData.discount, serviceTypes, materials]);

  const addServiceItem = () => {
    if (!tempService.id) return;
    const exists = formData.serviceItems?.find(i => i.serviceTypeId === tempService.id);
    if (exists) {
      setFormData({...formData, serviceItems: formData.serviceItems?.map(i => i.serviceTypeId === tempService.id ? {...i, quantity: i.quantity + tempService.qty} : i)});
    } else {
      setFormData({...formData, serviceItems: [...(formData.serviceItems || []), { serviceTypeId: tempService.id, quantity: tempService.qty }]});
    }
    setTempService({ id: '', qty: 1 });
  };

  const addMaterialItem = () => {
    if (!tempMaterial.id) return;
    const exists = formData.materials?.find(i => i.materialId === tempMaterial.id);
    if (exists) {
      setFormData({...formData, materials: formData.materials?.map(i => i.materialId === tempMaterial.id ? {...i, quantity: i.quantity + tempMaterial.qty} : i)});
    } else {
      setFormData({...formData, materials: [...(formData.materials || []), { materialId: tempMaterial.id, quantity: tempMaterial.qty }]});
    }
    setTempMaterial({ id: '', qty: 1 });
  };

  const handleEdit = (s: ServiceRecord) => {
    setFormData(s);
    setEditingId(s.id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemove = (id: string) => {
    if (confirm('Atenção: Esta ação excluirá permanentemente o registro do serviço. Continuar?')) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId) {
        alert("Selecione um cliente.");
        return;
    }

    const record: ServiceRecord = {
      id: editingId || Date.now().toString(),
      customerId: formData.customerId!,
      description: formData.description || '',
      date: formData.date!,
      serviceItems: formData.serviceItems || [],
      materials: formData.materials || [],
      paymentMethod: formData.paymentMethod || PaymentMethod.PIX,
      installments: formData.paymentMethod === PaymentMethod.CREDIT_CARD ? (formData.installments || 1) : 1,
      status: formData.status || ServiceStatus.COMPLETED,
      serviceValue: currentTotals.labor,
      discount: formData.discount || 0,
      totalValue: currentTotals.total
    };

    if (editingId) {
      setServices(services.map(s => s.id === editingId ? record : s));
    } else {
      setServices([...services, record]);
    }
    setIsFormOpen(false);
    setFormData(initialForm);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Atendimentos</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest italic">Renan Morais - (14) 99179-8868</p>
        </div>
        <button onClick={() => { if(isFormOpen) {setEditingId(null); setFormData(initialForm);} setIsFormOpen(!isFormOpen); }} className={`${isFormOpen ? 'bg-slate-200 text-slate-600' : 'bg-indigo-600 text-white shadow-xl'} px-6 py-3 rounded-2xl font-black text-xs transition-all uppercase`}>
          {isFormOpen ? 'Fechar' : '➕ Novo Registro'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-[2rem] border-2 border-indigo-100 shadow-2xl space-y-8 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
             <div className="bg-slate-900 text-white p-3 rounded-xl text-xl">🛠️</div>
             <h3 className="font-black text-slate-800 uppercase tracking-tighter">Lançamento de Serviço</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cliente</label>
              <select required className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold" value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})}>
                <option value="">Selecione...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data</label>
              <input type="date" className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
              <select className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as ServiceStatus})}>
                {Object.values(ServiceStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="md:col-span-3 space-y-4">
              <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-4">Adicionar Mão de Obra</h4>
                <div className="flex flex-wrap md:flex-nowrap gap-3 mb-4">
                  <select className="flex-1 p-3 rounded-xl border border-indigo-200 outline-none font-bold bg-white" value={tempService.id} onChange={e => setTempService({...tempService, id: e.target.value})}>
                    <option value="">Escolher serviço...</option>
                    {serviceTypes.map(t => <option key={t.id} value={t.id}>{t.name} (R$ {t.baseValue.toFixed(2)})</option>)}
                  </select>
                  <input type="number" min="1" className="w-20 p-3 rounded-xl border border-indigo-200 outline-none font-bold bg-white text-center" value={tempService.qty} onChange={e => setTempService({...tempService, qty: Number(e.target.value)})} />
                  <button type="button" onClick={addServiceItem} className="bg-slate-900 text-white px-6 rounded-xl font-black text-xs uppercase shadow-sm">Adicionar</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {formData.serviceItems?.map((si, i) => {
                    const t = serviceTypes.find(x => x.id === si.serviceTypeId);
                    return (
                      <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
                        <span className="text-xs font-bold">{si.quantity}x {t?.name}</span>
                        <button type="button" onClick={() => setFormData({...formData, serviceItems: formData.serviceItems?.filter((_, idx) => idx !== i)})} className="text-rose-500 font-bold px-2">✕</button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Adicionar Materiais</h4>
                <div className="flex flex-wrap md:flex-nowrap gap-3 mb-4">
                  <select className="flex-1 p-3 rounded-xl border border-slate-300 outline-none font-bold bg-white" value={tempMaterial.id} onChange={e => setTempMaterial({...tempMaterial, id: e.target.value})}>
                    <option value="">Escolher material...</option>
                    {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <input type="number" min="1" className="w-20 p-3 rounded-xl border border-slate-300 outline-none font-bold bg-white text-center" value={tempMaterial.qty} onChange={e => setTempMaterial({...tempMaterial, qty: Number(e.target.value)})} />
                  <button type="button" onClick={addMaterialItem} className="bg-slate-900 text-white px-6 rounded-xl font-black text-xs uppercase shadow-sm">Adicionar</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {formData.materials?.map((sm, i) => {
                    const m = materials.find(x => x.id === sm.materialId);
                    return (
                      <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <span className="text-xs font-bold">{sm.quantity}x {m?.name}</span>
                        <button type="button" onClick={() => setFormData({...formData, materials: formData.materials?.filter((_, idx) => idx !== i)})} className="text-rose-500 font-bold px-2">✕</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Relato do Serviço</label>
              <textarea className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 outline-none h-24 font-medium" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Descreva o que foi feito..." />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pagamento</label>
              <select className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold" value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value as PaymentMethod})}>
                {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            
            {formData.paymentMethod === PaymentMethod.CREDIT_CARD && (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Parcelas</label>
                <select className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold" value={formData.installments} onChange={e => setFormData({...formData, installments: Number(e.target.value)})}>
                  {[1,2,3,4,5,6,10,12].map(n => <option key={n} value={n}>{n}x</option>)}
                </select>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">Desconto (R$)</label>
              <input type="number" step="0.01" className="w-full p-4 rounded-xl bg-rose-50/50 border border-rose-100 outline-none font-black text-rose-600" value={formData.discount} onChange={e => setFormData({...formData, discount: Number(e.target.value)})} />
            </div>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-2xl flex justify-between items-center shadow-xl">
            <div>
              <p className="text-[10px] opacity-50 uppercase font-black tracking-widest">Valor Final</p>
              <p className="text-3xl font-black text-indigo-400">R$ {currentTotals.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest transition-all">
              {editingId ? 'Atualizar' : 'Salvar Registro'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.slice().reverse().map(s => {
          const client = customers.find(c => c.id === s.customerId);
          return (
            <div key={s.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all relative group">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(s.date).toLocaleDateString('pt-BR')}</span>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${s.status === ServiceStatus.COMPLETED ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}>{s.status}</span>
              </div>
              <h4 className="text-xl font-black text-slate-800 mb-1 leading-tight">{client?.name || 'Cliente Particular'}</h4>
              <p className="text-xs text-slate-400 font-bold mb-6 italic line-clamp-2">{s.description || "Nenhum relato técnico registrado"}</p>
              
              <div className="flex justify-between items-end border-t border-slate-50 pt-4">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">Total</p>
                  <p className="text-xl font-black text-slate-900 tracking-tighter">R$ {s.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => setViewingId(s.id)} className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg hover:bg-indigo-600 transition-all" title="Recibo"><span className="text-[10px] font-black uppercase">Recibo</span></button>
                  <button onClick={() => handleEdit(s)} className="bg-slate-100 text-slate-400 p-2.5 rounded-xl hover:bg-slate-200 transition-all" title="Editar">✎</button>
                  <button onClick={() => handleRemove(s.id)} className="bg-rose-50 text-rose-500 p-2.5 rounded-xl hover:bg-rose-500 hover:text-white transition-all" title="Excluir">🗑️</button>
                </div>
              </div>
            </div>
          );
        })}
        {services.length === 0 && !isFormOpen && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center">
             <div className="text-6xl mb-4 opacity-20">📋</div>
             <p className="font-black text-slate-300 uppercase tracking-widest">Nenhum atendimento</p>
          </div>
        )}
      </div>

      {viewingId && (
        <ServiceNoteModal 
          service={services.find(s => s.id === viewingId)!}
          customer={customers.find(c => c.id === services.find(s => s.id === viewingId)!.customerId)}
          allMaterials={materials}
          allServiceTypes={serviceTypes}
          onClose={() => setViewingId(null)}
        />
      )}
    </div>
  );
};

export default ServiceManager;
