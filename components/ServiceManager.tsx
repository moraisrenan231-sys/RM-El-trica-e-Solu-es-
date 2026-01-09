
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
      alert('Sistema de PDF carregando. Aguarde...');
      return;
    }

    setIsGenerating(true);
    const element = document.getElementById('printable-receipt-content');
    
    if (!element) {
      setIsGenerating(false);
      return;
    }

    const customerName = (customer?.name || 'Cliente').replace(/[^a-z0-9]/gi, '_');
    const fileName = `RM_Recibo_${service.id.slice(-4)}_${customerName}.pdf`;

    const options = {
      margin: 10,
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 3, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      // @ts-ignore
      await html2pdf().set(options).from(element).save();
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar PDF. Verifique se a biblioteca html2pdf carregou.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (!customer?.phone) { alert('Cliente sem telefone.'); return; }
    const cleanPhone = customer.phone.replace(/\D/g, '');
    
    const serviceList = service.serviceItems.map(si => {
      const type = allServiceTypes.find(t => t.id === si.serviceTypeId);
      return `• ${si.quantity}x ${type?.name}`;
    }).join('\n');

    const materialList = service.materials.map(sm => {
      const mat = allMaterials.find(m => m.id === sm.materialId);
      return `• ${sm.quantity}x ${mat?.name}`;
    }).join('\n');

    const message = `*RM ELÉTRICA & SOLUÇÕES*%0A` +
      `*RECIBO DE SERVIÇO*%0A` +
      `--------------------------------%0A` +
      `*Protocolo:* #${service.id.slice(-6).toUpperCase()}%0A` +
      `*Cliente:* ${customer.name}%0A%0A` +
      `*SERVIÇOS:*%0A${serviceList || 'Serviço geral'}%0A%0A` +
      `*MATERIAIS:*%0A${materialList || 'Nenhum material'}%0A%0A` +
      `*VALOR TOTAL:* R$ ${service.totalValue.toFixed(2)}%0A` +
      `*PAGAMENTO:* ${service.paymentMethod}%0A` +
      `--------------------------------%0A` +
      `*Técnico:* Renan Morais%0A` +
      `*Contato:* (14) 99179-8868`;

    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 z-[300] flex items-center justify-center p-2 md:p-6 overflow-hidden backdrop-blur-sm">
      <div className="bg-slate-50 w-full max-w-5xl h-full rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
        <div className="p-4 border-b flex flex-wrap gap-2 justify-between items-center bg-white shrink-0">
          <button onClick={onClose} className="text-slate-500 font-black px-6 py-2.5 hover:bg-slate-100 rounded-xl transition-all uppercase text-[10px] tracking-widest">✕ Fechar</button>
          <div className="flex gap-2">
            <button onClick={handleShareWhatsApp} className="bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-black text-[10px] shadow-lg tracking-widest uppercase">WhatsApp</button>
            <button onClick={handleDownloadPDF} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] shadow-lg tracking-widest uppercase">Baixar PDF</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-12 no-scrollbar bg-slate-200/50">
          <div id="printable-receipt-content" className="bg-white p-12 md:p-16 shadow-2xl max-w-[210mm] mx-auto min-h-[297mm] text-slate-800">
            <div className="flex justify-between items-start border-b-8 border-indigo-600 pb-10 mb-12">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none uppercase">RM ELÉTRICA & SOLUÇÕES</h1>
                <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest mt-1">Serviços Profissionais</p>
                <div className="mt-8 text-xs text-slate-500 font-bold space-y-1">
                  <p>Técnico: Renan Morais</p>
                  <p>WhatsApp: (14) 99179-8868</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-slate-900 text-white px-5 py-3 rounded-xl font-black text-xs inline-block mb-2 shadow-lg">RECIBO DE SERVIÇO</div>
                <p className="text-sm font-black text-slate-400">#{service.id.slice(-6).toUpperCase()}</p>
                <p className="text-xs font-bold text-slate-500 uppercase mt-1">{new Date(service.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-10 mb-12">
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cliente / Contratante</h4>
                <p className="text-lg font-black text-slate-800 leading-tight">{customer?.name}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">{customer?.address}</p>
                <p className="text-xs text-indigo-600 font-bold mt-2">{customer?.phone}</p>
              </div>
              <div className="text-right p-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Condições Financeiras</h4>
                <p className="text-lg font-black text-slate-800 uppercase">{service.paymentMethod}</p>
                {service.paymentMethod === PaymentMethod.CREDIT_CARD && (
                  <p className="text-xs font-bold text-indigo-500">Parcelamento: {service.installments}x</p>
                )}
                <div className={`mt-3 inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${service.status === ServiceStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  Status: {service.status}
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Relato Técnico / Observações</h4>
              <div className="p-8 bg-slate-50/50 rounded-[2rem] border-l-8 border-indigo-600">
                <p className="text-sm text-slate-700 leading-relaxed italic whitespace-pre-wrap">{service.description || "Nenhuma observação técnica adicional registrada."}</p>
              </div>
            </div>

            <div className="mb-12 rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-900 text-white text-[10px] uppercase font-black tracking-wider">
                  <tr>
                    <th className="px-6 py-5 text-left">Itens / Descrição do Serviço</th>
                    <th className="px-6 py-5 text-center">Qtd</th>
                    <th className="px-6 py-5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {service.serviceItems.map((si, idx) => {
                    const type = allServiceTypes.find(t => t.id === si.serviceTypeId);
                    return (
                      <tr key={idx}>
                        <td className="px-6 py-6">
                          <p className="font-black text-slate-800">{type?.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Serviço Especializado</p>
                        </td>
                        <td className="px-6 py-6 text-center font-bold text-slate-600">{si.quantity}</td>
                        <td className="px-6 py-6 text-right font-black text-slate-900">R$ {(si.quantity * (type?.baseValue || 0)).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                  {service.materials.map((sm, idx) => {
                    const mat = allMaterials.find(m => m.id === sm.materialId);
                    return (
                      <tr key={idx} className="bg-slate-50/30">
                        <td className="px-6 py-5 text-slate-600">
                          <span className="font-bold text-slate-700">{mat?.name}</span>
                          <p className="text-[10px] uppercase opacity-50">Material Aplicado</p>
                        </td>
                        <td className="px-6 py-5 text-center font-bold text-slate-400">{sm.quantity}</td>
                        <td className="px-6 py-5 text-right font-bold text-slate-800">R$ {(sm.quantity * (mat?.sellingPrice || 0)).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-900 text-white">
                  {service.discount > 0 && (
                    <tr className="bg-rose-600">
                      <td colSpan={2} className="px-6 py-3 text-right text-[10px] font-black uppercase tracking-widest">Desconto Especial</td>
                      <td className="px-6 py-3 text-right font-black">- R$ {service.discount.toFixed(2)}</td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={2} className="px-8 py-10 text-left text-xl font-black uppercase tracking-tighter">Valor Total Investido</td>
                    <td className="px-8 py-10 text-right text-3xl font-black tracking-tighter text-indigo-400">R$ {service.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-24 grid grid-cols-2 gap-20 px-10 pt-12 border-t-2 border-dashed border-slate-200">
              <div className="text-center">
                <div className="border-b-2 border-slate-900 h-10 mb-3"></div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Renan Morais - RM Elétrica</p>
              </div>
              <div className="text-center">
                <div className="border-b-2 border-slate-900 h-10 mb-3"></div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{customer?.name || 'Assinatura do Cliente'}</p>
              </div>
            </div>
            
            <div className="mt-32 text-center">
               <p className="text-[8px] text-slate-300 font-black uppercase tracking-[0.8em]">Obrigado pela preferência • Documento Digital RM</p>
            </div>
          </div>
        </div>
      </div>
      {isGenerating && <div className="fixed inset-0 bg-indigo-900/60 flex flex-col items-center justify-center z-[400] backdrop-blur-md text-white"><div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div><p className="font-black uppercase tracking-widest">Processando PDF...</p></div>}
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId) return;

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
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Atendimentos</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest italic">Renan Morais - (14) 99179-8868</p>
        </div>
        <button onClick={() => { if(isFormOpen) {setEditingId(null); setFormData(initialForm);} setIsFormOpen(!isFormOpen); }} className={`${isFormOpen ? 'bg-slate-200 text-slate-600' : 'bg-indigo-600 text-white shadow-xl'} px-8 py-3 rounded-2xl font-black text-xs transition-all`}>
          {isFormOpen ? 'CANCELAR' : '➕ NOVO REGISTRO'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSave} className="bg-white p-6 md:p-10 rounded-[3rem] border-2 border-indigo-100 shadow-2xl space-y-10 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-4">
             <div className="bg-slate-900 text-white p-4 rounded-2xl text-2xl shadow-xl">🛠️</div>
             <div>
                <h3 className="font-black text-slate-800 uppercase tracking-tighter text-xl">Configuração do Atendimento</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">RM Elétrica & Soluções</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cliente Solicitante</label>
              <select required className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold" value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})}>
                <option value="">Selecione...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data de Realização</label>
              <input type="date" className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado do Serviço</label>
              <select className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none font-black" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as ServiceStatus})}>
                {Object.values(ServiceStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="md:col-span-3 space-y-6">
              <div className="bg-indigo-50 p-6 rounded-[2.5rem] border border-indigo-100">
                <h4 className="text-[11px] font-black text-indigo-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="bg-indigo-600 text-white p-1.5 rounded-lg">⚡</span> Lançar Serviços (Qtd)
                </h4>
                <div className="flex flex-wrap md:flex-nowrap gap-4 mb-6">
                  <select className="flex-1 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-600 outline-none font-bold text-sm shadow-sm bg-white" value={tempService.id} onChange={e => setTempService({...tempService, id: e.target.value})}>
                    <option value="">Escolher do Catálogo...</option>
                    {serviceTypes.map(t => <option key={t.id} value={t.id}>{t.name} (R$ {t.baseValue.toFixed(2)})</option>)}
                  </select>
                  <div className="flex gap-2 w-full md:w-auto">
                    <input type="number" min="1" className="w-24 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-600 outline-none font-black text-center bg-white shadow-sm" value={tempService.qty} onChange={e => setTempService({...tempService, qty: Number(e.target.value)})} />
                    <button type="button" onClick={addServiceItem} className="bg-slate-900 text-white px-8 rounded-2xl font-black text-xs hover:bg-indigo-600 transition-all shadow-lg">ADICIONAR</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {formData.serviceItems?.map((si, i) => {
                    const t = serviceTypes.find(x => x.id === si.serviceTypeId);
                    return (
                      <div key={i} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm animate-in zoom-in-95">
                        <div>
                          <p className="text-sm font-black text-slate-800">{si.quantity}x {t?.name}</p>
                          <p className="text-[9px] font-bold text-indigo-500 uppercase">R$ {(si.quantity * (t?.baseValue || 0)).toFixed(2)}</p>
                        </div>
                        <button type="button" onClick={() => setFormData({...formData, serviceItems: formData.serviceItems?.filter((_, idx) => idx !== i)})} className="bg-rose-50 text-rose-500 p-2 rounded-xl hover:bg-rose-500 hover:text-white transition-all">✕</button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-200">
                <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="bg-slate-900 text-white p-1.5 rounded-lg">📦</span> Materiais de Reposição
                </h4>
                <div className="flex flex-wrap md:flex-nowrap gap-4 mb-6">
                  <select className="flex-1 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-600 outline-none font-bold text-sm shadow-sm bg-white" value={tempMaterial.id} onChange={e => setTempMaterial({...tempMaterial, id: e.target.value})}>
                    <option value="">Escolher do Inventário...</option>
                    {materials.map(m => <option key={m.id} value={m.id}>{m.name} (Saldo: {m.stock} UN)</option>)}
                  </select>
                  <div className="flex gap-2 w-full md:w-auto">
                    <input type="number" min="1" className="w-24 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-600 outline-none font-black text-center bg-white shadow-sm" value={tempMaterial.qty} onChange={e => setTempMaterial({...tempMaterial, qty: Number(e.target.value)})} />
                    <button type="button" onClick={addMaterialItem} className="bg-slate-900 text-white px-8 rounded-2xl font-black text-xs hover:bg-indigo-600 transition-all shadow-lg">ADICIONAR</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {formData.materials?.map((sm, i) => {
                    const m = materials.find(x => x.id === sm.materialId);
                    return (
                      <div key={i} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <div>
                          <p className="text-sm font-bold text-slate-700">{sm.quantity}x {m?.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">R$ {(sm.quantity * (m?.sellingPrice || 0)).toFixed(2)}</p>
                        </div>
                        <button type="button" onClick={() => setFormData({...formData, materials: formData.materials?.filter((_, idx) => idx !== i)})} className="bg-rose-50 text-rose-500 p-2 rounded-xl hover:bg-rose-500 hover:text-white transition-all">✕</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Relato Técnico / Observações da Execução</label>
              <textarea className="w-full p-6 rounded-[2rem] bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none h-32 font-medium transition-all" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Descreva os detalhes do serviço realizado..." />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Forma de Pagamento</label>
              <select className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none font-black" value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value as PaymentMethod})}>
                {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            
            {formData.paymentMethod === PaymentMethod.CREDIT_CARD && (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Parcelas</label>
                <select className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none font-black" value={formData.installments} onChange={e => setFormData({...formData, installments: Number(e.target.value)})}>
                  {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1}x</option>)}
                </select>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">Bonificação / Desconto (R$)</label>
              <input type="number" step="0.01" className="w-full p-4 rounded-2xl bg-rose-50/50 border-2 border-transparent focus:border-rose-500 outline-none font-black text-rose-600 text-lg" value={formData.discount} onChange={e => setFormData({...formData, discount: Number(e.target.value)})} />
            </div>
          </div>

          <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-center md:text-left">
                <p className="text-[10px] opacity-40 font-black uppercase tracking-[0.4em] mb-2">Total a ser faturado</p>
                <h4 className="text-2xl font-bold flex items-center gap-3">
                   <span className="text-4xl">💰</span> Recibo Total Final
                </h4>
              </div>
              <div className="text-right">
                <p className="text-6xl font-black tracking-tighter text-indigo-400">R$ {currentTotals.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p className="text-[10px] opacity-50 uppercase font-bold mt-2">Soma de Mão de Obra + Materiais</p>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px] group-hover:bg-indigo-600/30 transition-all duration-700"></div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white p-8 rounded-[2rem] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-2xl shadow-indigo-200 transition-all text-xl transform hover:-translate-y-1">
            {editingId ? '💾 ATUALIZAR RECIBO DE SERVIÇO' : '✅ FINALIZAR E GRAVAR ATENDIMENTO'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.slice().reverse().map(s => {
          const client = customers.find(c => c.id === s.customerId);
          return (
            <div key={s.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(s.date).toLocaleDateString('pt-BR')}</span>
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase shadow-sm ${s.status === ServiceStatus.COMPLETED ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}>{s.status}</span>
              </div>
              <h4 className="text-2xl font-black text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{client?.name}</h4>
              <p className="text-xs text-slate-400 font-bold mb-8 italic line-clamp-2 leading-relaxed">{s.description || "Nenhum relato técnico"}</p>
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Valor do Recibo</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tighter">R$ {s.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setViewingId(s.id)} className="bg-slate-900 text-white p-4 rounded-2xl shadow-lg hover:bg-indigo-600 transition-all group-hover:scale-110"><span className="text-[10px] font-black uppercase tracking-widest">Recibo</span></button>
                  <button onClick={() => handleEdit(s)} className="bg-slate-100 text-slate-400 p-4 rounded-2xl hover:bg-slate-200 transition-all">✎</button>
                </div>
              </div>
              <div className="absolute -right-6 -bottom-6 opacity-[0.03] text-9xl font-black pointer-events-none group-hover:opacity-[0.06] transition-opacity uppercase select-none">RM</div>
            </div>
          );
        })}
        {services.length === 0 && !isFormOpen && (
          <div className="col-span-full py-32 text-center bg-white rounded-[3.5rem] border-4 border-dashed border-slate-100 flex flex-col items-center">
             <div className="text-7xl mb-6">🛠️</div>
             <p className="font-black text-slate-300 uppercase tracking-[0.4em] text-sm">Pronto para o próximo atendimento?</p>
             <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest">Nenhuma O.S. registrada no sistema.</p>
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
