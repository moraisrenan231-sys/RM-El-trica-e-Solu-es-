
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
      alert('O sistema de PDF ainda está carregando. Aguarde 3 segundos.');
      return;
    }

    setIsGenerating(true);
    
    // Pequeno delay para garantir que o modal está 100% renderizado na tela
    await new Promise(resolve => setTimeout(resolve, 500));

    const element = document.getElementById('receipt-pdf-content');
    if (!element) {
      alert('Erro crítico: Conteúdo do recibo não encontrado.');
      setIsGenerating(false);
      return;
    }

    const customerName = (customer?.name || 'Cliente').replace(/[^a-z0-9]/gi, '_');
    const fileName = `RM_Recibo_${service.id.slice(-6)}_${customerName}.pdf`;

    const options = {
      margin: 0,
      filename: fileName,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        logging: false,
        backgroundColor: '#FFFFFF'
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      // @ts-ignore
      const pdf = html2pdf().set(options).from(element);
      
      // No mobile/APK, gerar como Blob e disparar o download via URL temporária é mais seguro
      const blob = await pdf.toPdf().output('blob');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      console.error('Erro PDF:', err);
      alert('Não foi possível salvar o PDF automaticamente. Tente tirar um print da tela.');
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
*NOTA DE SERVIÇO #${service.id.slice(-6).toUpperCase()}*
--------------------------------
*Cliente:* ${customer.name}
*Data:* ${new Date(service.date).toLocaleDateString('pt-BR')}

*RELATÓRIO:*
${service.description || 'Atendimento técnico realizado.'}

*ITENS:*
${serviceItemsStr}
${materialItemsStr}

*INVESTIMENTO TOTAL:* R$ ${service.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
*PAGAMENTO:* ${service.paymentMethod}
--------------------------------
*Técnico:* Renan Morais
*WhatsApp:* (14) 99179-8868`;

    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 z-[500] flex items-center justify-center p-0 md:p-4 backdrop-blur-md overflow-hidden">
      <div className="bg-white w-full max-w-5xl h-full md:h-[98vh] flex flex-col overflow-hidden">
        
        {/* CABEÇALHO DO MODAL (BOTÕES) */}
        <div className="p-4 border-b flex flex-wrap gap-2 justify-between items-center bg-slate-50 shrink-0">
          <button onClick={onClose} className="px-5 py-2 text-slate-500 font-black text-[10px] uppercase hover:bg-slate-200 rounded-xl transition-all">✕ Fechar</button>
          <div className="flex gap-2">
            <button onClick={handleShareWhatsApp} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-black text-[10px] shadow-lg flex items-center gap-2 uppercase tracking-widest">
               📱 WhatsApp
            </button>
            <button onClick={handleDownloadPDF} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-black text-[10px] shadow-lg flex items-center gap-2 uppercase tracking-widest">
               📥 Baixar PDF
            </button>
          </div>
        </div>

        {/* ÁREA DE VISUALIZAÇÃO (O QUE VIRA PDF) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-slate-200/50 flex flex-col items-center">
          
          <div id="receipt-pdf-content" className="bg-white w-[210mm] min-h-[297mm] text-slate-900 flex flex-col font-sans p-[20mm] shadow-2xl origin-top scale-[0.4] md:scale-100">
            
            {/* CABEÇALHO (FOTO 1) */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-[26pt] font-black text-slate-900 tracking-tighter uppercase leading-none">RM ELÉTRICA & SOLUÇÕES</h1>
                <p className="text-[10pt] font-bold text-indigo-600 uppercase tracking-[0.2em] mt-2">EXCELÊNCIA EM INSTALAÇÕES E MANUTENÇÕES</p>
                <div className="mt-10 text-[9.5pt] text-slate-500 font-bold space-y-1 uppercase tracking-wider">
                  <p>ESPECIALISTA: RENAN MORAIS</p>
                  <p>CONTATO: (14) 99179-8868</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-[#1e293b] text-white px-6 py-3 rounded-xl font-black text-[10pt] uppercase tracking-[0.2em] mb-4 inline-block">NOTA DE SERVIÇO</div>
                <p className="text-[10pt] font-black text-slate-300"># {service.id.slice(-6).toUpperCase()}</p>
                <p className="text-[10pt] font-black text-slate-400 mt-1">{new Date(service.date).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            {/* LINHA AZUL IDENTIDADE */}
            <div className="w-full h-[6px] bg-[#4f46e5] mb-12 mt-4"></div>

            {/* BOX CLIENTE (FOTO 1) */}
            <div className="mb-12">
               <div className="p-10 bg-[#f8fafc] rounded-[2.5rem] border border-slate-100 max-w-[140mm]">
                  <h4 className="text-[8pt] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">CLIENTE</h4>
                  <p className="text-[24pt] font-black text-slate-900 leading-none mb-4">{customer?.name}</p>
                  <div className="text-[10pt] text-slate-500 font-medium space-y-1">
                    <p>{customer?.street || 'Endereço não informado'}</p>
                    <p>{customer?.neighborhood ? `${customer.neighborhood}, ` : ''}{customer?.city || ''} - {customer?.state || ''}</p>
                    <p>CEP: {customer?.cep || '00000-000'}</p>
                  </div>
               </div>
            </div>

            {/* PAGAMENTO */}
            <div className="mb-12">
                <h4 className="text-[8pt] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">PAGAMENTO</h4>
                <p className="text-[20pt] font-black text-slate-900 uppercase">{service.paymentMethod}</p>
                <div className="mt-4 inline-block bg-[#1e293b] text-white px-5 py-2 rounded-full text-[8pt] font-black uppercase tracking-[0.2em]">
                   {service.status.toUpperCase()}
                </div>
            </div>

            {/* RELATÓRIO DE EXECUÇÃO */}
            <div className="mb-12">
               <h4 className="text-[8pt] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">RELATÓRIO DE EXECUÇÃO</h4>
               <div className="flex gap-5">
                  <div className="w-[6px] h-auto bg-[#4f46e5] rounded-full shrink-0"></div>
                  <div className="bg-[#f8fafc] p-10 rounded-[2.5rem] flex-1">
                    <p className="text-[12pt] text-slate-600 leading-relaxed italic font-medium italic">
                      {service.description || "Infelizmente nenhuma observação detalhada foi fornecida para este atendimento técnico."}
                    </p>
                  </div>
               </div>
            </div>

            {/* TABELA DE VALORES (FOTO 1) */}
            <div className="flex-1">
               <div className="rounded-[1.5rem] overflow-hidden border border-slate-100">
                  <table className="w-full text-[10pt]">
                    <thead className="bg-[#0f172a] text-white uppercase text-[8pt] font-black">
                      <tr>
                        <th className="px-10 py-6 text-left tracking-[0.2em]">DESCRIÇÃO DOS SERVIÇOS E ITENS</th>
                        <th className="px-10 py-6 text-center tracking-[0.2em]">QTD</th>
                        <th className="px-10 py-6 text-right tracking-[0.2em]">SUBTOTAL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {service.serviceItems.map((si, idx) => {
                        const type = allServiceTypes.find(t => t.id === si.serviceTypeId);
                        return (
                          <tr key={idx}>
                            <td className="px-10 py-8">
                              <p className="font-black text-slate-900 text-[11pt]">{type?.name}</p>
                              <p className="text-[7.5pt] text-slate-400 font-bold uppercase tracking-widest mt-1">INSTALAÇÃO E REPAROS ESPECIALIZADOS</p>
                            </td>
                            <td className="px-10 py-8 text-center font-bold text-slate-600">{si.quantity}</td>
                            <td className="px-10 py-8 text-right font-black text-slate-900 text-[11pt]">R$ {(si.quantity * (type?.baseValue || 0)).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                      {service.materials.map((sm, idx) => {
                        const mat = allMaterials.find(m => m.id === sm.materialId);
                        return (
                          <tr key={idx}>
                            <td className="px-10 py-8 text-slate-500 font-bold">
                              {mat?.name}
                            </td>
                            <td className="px-10 py-8 text-center font-bold text-slate-400">{sm.quantity}</td>
                            <td className="px-10 py-8 text-right font-bold text-slate-600">R$ {(sm.quantity * (mat?.sellingPrice || 0)).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                      {service.discount > 0 && (
                        <tr className="bg-rose-50/40">
                          <td colSpan={2} className="px-10 py-5 text-right text-[8pt] font-black text-rose-500 uppercase tracking-[0.3em]">BONIFICAÇÃO</td>
                          <td className="px-10 py-5 text-right font-black text-rose-600 text-[11pt]">- R$ {service.discount.toFixed(2)}</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-[#0f172a] text-white">
                        <td colSpan={2} className="px-12 py-12 text-left font-black text-[18pt] uppercase tracking-tighter">INVESTIMENTO TOTAL</td>
                        <td className="px-12 py-12 text-right text-[26pt] font-black tracking-tighter">
                          R$ {service.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
               </div>
            </div>

            {/* PÁGINA 2 / ASSINATURAS (FOTO 2) */}
            <div className="mt-24 pt-24 border-t-2 border-dashed border-slate-200">
               <div className="grid grid-cols-1 gap-24 px-10">
                  <div className="text-center">
                    <div className="w-full h-[1.5pt] bg-slate-900 mb-4"></div>
                    <p className="text-[8pt] font-black text-slate-400 uppercase tracking-[0.4em] mb-1">RESPONSÁVEL TÉCNICO</p>
                    <p className="text-[12pt] font-black text-slate-900 uppercase">RM ELÉTRICA & SOLUÇÕES</p>
                  </div>
                  <div className="text-center">
                    <div className="w-full h-[1.5pt] bg-slate-900 mb-4"></div>
                    <p className="text-[8pt] font-black text-slate-400 uppercase tracking-[0.4em] mb-1">ASSINATURA DO CLIENTE</p>
                    <p className="text-[12pt] font-black text-slate-900 uppercase">{customer?.name || 'A'}</p>
                  </div>
               </div>
               
               <div className="mt-32 text-center text-[7.5pt] font-black text-slate-300 uppercase tracking-[0.6em] pb-10">
                  GERADO DIGITALMENTE • OBRIGADO PELA CONFIANÇA
               </div>
            </div>

          </div>
        </div>
      </div>

      {/* OVERLAY DE CARREGAMENTO */}
      {isGenerating && (
        <div className="fixed inset-0 bg-[#0f172a]/95 z-[600] flex flex-col items-center justify-center text-white backdrop-blur-xl">
          <div className="w-20 h-20 border-[6px] border-white border-t-transparent rounded-full animate-spin mb-8"></div>
          <p className="font-black uppercase tracking-[0.5em] text-sm animate-pulse">GERANDO ARQUIVO PDF...</p>
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
    if (confirm('Excluir permanentemente este registro?')) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId) {
        alert("Escolha um cliente.");
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
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest italic">Responsável: Renan Morais - (14) 99179-8868</p>
        </div>
        <button onClick={() => { if(isFormOpen) {setEditingId(null); setFormData(initialForm);} setIsFormOpen(!isFormOpen); }} className={`${isFormOpen ? 'bg-slate-200 text-slate-600' : 'bg-indigo-600 text-white shadow-xl'} px-8 py-3 rounded-2xl font-black text-xs transition-all uppercase tracking-widest`}>
          {isFormOpen ? 'CANCELAR' : '➕ NOVO REGISTRO'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSave} className="bg-white p-6 md:p-10 rounded-[3rem] border-2 border-indigo-100 shadow-2xl space-y-10 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-4">
             <div className="bg-slate-900 text-white p-4 rounded-2xl text-2xl shadow-xl">🛠️</div>
             <div>
                <h3 className="font-black text-slate-800 uppercase tracking-tighter text-xl leading-none">Nova Ordem de Serviço</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">RM Elétrica & Soluções</p>
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
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data</label>
              <input type="date" className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
              <select className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none font-black" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as ServiceStatus})}>
                {Object.values(ServiceStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="md:col-span-3 space-y-6">
              <div className="bg-indigo-50 p-6 rounded-[2.5rem] border border-indigo-100">
                <h4 className="text-[11px] font-black text-indigo-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="bg-indigo-600 text-white p-1.5 rounded-lg">⚡</span> Adicionar Serviços
                </h4>
                <div className="flex flex-wrap md:flex-nowrap gap-4 mb-6">
                  <select className="flex-1 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-600 outline-none font-bold text-sm shadow-sm bg-white" value={tempService.id} onChange={e => setTempService({...tempService, id: e.target.value})}>
                    <option value="">Escolher...</option>
                    {serviceTypes.map(t => <option key={t.id} value={t.id}>{t.name} (R$ {t.baseValue.toFixed(2)})</option>)}
                  </select>
                  <div className="flex gap-2 w-full md:w-auto">
                    <input type="number" min="1" className="w-24 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-600 outline-none font-black text-center bg-white shadow-sm" value={tempService.qty} onChange={e => setTempService({...tempService, qty: Number(e.target.value)})} />
                    <button type="button" onClick={addServiceItem} className="bg-slate-900 text-white px-8 rounded-2xl font-black text-[10px] hover:bg-indigo-600 transition-all shadow-lg uppercase tracking-widest">Adicionar</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {formData.serviceItems?.map((si, i) => {
                    const t = serviceTypes.find(x => x.id === si.serviceTypeId);
                    return (
                      <div key={i} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm">
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-800 truncate">{si.quantity}x {t?.name}</p>
                          <p className="text-[9px] font-bold text-indigo-500 uppercase">R$ {(si.quantity * (t?.baseValue || 0)).toFixed(2)}</p>
                        </div>
                        <button type="button" onClick={() => setFormData({...formData, serviceItems: formData.serviceItems?.filter((_, idx) => idx !== i)})} className="bg-rose-50 text-rose-500 p-2.5 rounded-xl hover:bg-rose-500 hover:text-white transition-all">✕</button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-200">
                <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="bg-slate-900 text-white p-1.5 rounded-lg">📦</span> Adicionar Materiais
                </h4>
                <div className="flex flex-wrap md:flex-nowrap gap-4 mb-6">
                  <select className="flex-1 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-600 outline-none font-bold text-sm shadow-sm bg-white" value={tempMaterial.id} onChange={e => setTempMaterial({...tempMaterial, id: e.target.value})}>
                    <option value="">Escolher...</option>
                    {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <div className="flex gap-2 w-full md:w-auto">
                    <input type="number" min="1" className="w-24 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-600 outline-none font-black text-center bg-white shadow-sm" value={tempMaterial.qty} onChange={e => setTempMaterial({...tempMaterial, qty: Number(e.target.value)})} />
                    <button type="button" onClick={addMaterialItem} className="bg-slate-900 text-white px-8 rounded-2xl font-black text-[10px] hover:bg-indigo-600 transition-all shadow-lg uppercase tracking-widest">Adicionar</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {formData.materials?.map((sm, i) => {
                    const m = materials.find(x => x.id === sm.materialId);
                    return (
                      <div key={i} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-700 truncate">{sm.quantity}x {m?.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">R$ {(sm.quantity * (m?.sellingPrice || 0)).toFixed(2)}</p>
                        </div>
                        <button type="button" onClick={() => setFormData({...formData, materials: formData.materials?.filter((_, idx) => idx !== i)})} className="bg-rose-50 text-rose-500 p-2.5 rounded-xl hover:bg-rose-500 hover:text-white transition-all">✕</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Relato do Atendimento</label>
              <textarea className="w-full p-6 rounded-[2rem] bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none h-32 font-medium" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Descreva os procedimentos realizados..." />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pagamento</label>
              <select className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none font-black" value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value as PaymentMethod})}>
                {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">Desconto/Bonificação (R$)</label>
              <input type="number" step="0.01" className="w-full p-4 rounded-2xl bg-rose-50/50 border-2 border-transparent focus:border-rose-500 outline-none font-black text-rose-600 text-lg" value={formData.discount} onChange={e => setFormData({...formData, discount: Number(e.target.value)})} />
            </div>
          </div>

          <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] shadow-2xl flex justify-between items-center">
            <div>
              <p className="text-[10px] opacity-40 font-black uppercase tracking-[0.4em] mb-2">Total Consolidado</p>
              <h4 className="text-3xl font-black tracking-tighter text-indigo-400 italic">R$ {currentTotals.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
            </div>
            <button type="submit" className="bg-indigo-600 text-white px-12 py-5 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl transition-all">
               SALVAR ATENDIMENTO
            </button>
          </div>
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
              <h4 className="text-2xl font-black text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">{client?.name || 'Cliente Particular'}</h4>
              <p className="text-xs text-slate-400 font-bold mb-8 italic line-clamp-2 leading-relaxed min-h-[32px]">{s.description || "Sem relato registrado"}</p>
              
              <div className="flex justify-between items-end border-t border-slate-50 pt-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Total</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tighter">R$ {s.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setViewingId(s.id)} className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-lg hover:bg-indigo-600 transition-all" title="Ver Recibo"><span className="text-[10px] font-black uppercase">Recibo</span></button>
                  <button onClick={() => handleEdit(s)} className="bg-slate-100 text-slate-400 p-3.5 rounded-2xl hover:bg-slate-200 transition-all" title="Editar">✎</button>
                  <button onClick={() => handleRemove(s.id)} className="bg-rose-50 text-rose-500 p-3.5 rounded-2xl hover:bg-rose-500 transition-all" title="Excluir">🗑️</button>
                </div>
              </div>
            </div>
          );
        })}
        {services.length === 0 && !isFormOpen && (
          <div className="col-span-full py-32 text-center bg-white rounded-[3.5rem] border-4 border-dashed border-slate-100 flex flex-col items-center">
             <div className="text-7xl mb-6 opacity-20">⚡</div>
             <p className="font-black text-slate-300 uppercase tracking-[0.4em] text-sm">Nenhum atendimento realizado ainda</p>
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
