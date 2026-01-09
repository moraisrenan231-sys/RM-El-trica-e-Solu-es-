
import React, { useState, useMemo, useEffect } from 'react';
import { ServiceRecord, Customer, Material, PaymentMethod, ServiceStatus, ServiceMaterial, ServiceType } from '../types.ts';

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
  onClose: () => void 
}> = ({ service, customer, allMaterials, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleDownloadPDF = async () => {
    // @ts-ignore
    if (typeof html2pdf === 'undefined') {
      alert('Sistema de PDF carregando. Tente novamente em 2 segundos.');
      return;
    }

    setIsGenerating(true);
    const element = document.getElementById('printable-service-note');
    
    if (!element) {
      setIsGenerating(false);
      return;
    }

    const customerName = (customer?.name || 'Cliente').replace(/[^a-z0-9]/gi, '_');
    const fileName = `RM_Eletrica_Nota_${service.id.slice(-4)}_${customerName}.pdf`;

    const options = {
      margin: 5,
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 3, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      // @ts-ignore
      await html2pdf().set(options).from(element).save();
      setTimeout(() => alert('📄 Relatório PDF gerado com sucesso!'), 500);
    } catch (err) {
      console.error(err);
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  const getMaterialDetails = (sm: ServiceMaterial) => {
    return allMaterials.find(m => m.id === sm.materialId);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[300] flex items-center justify-center p-0 md:p-6 overflow-hidden">
      {isGenerating && (
        <div className="fixed inset-0 bg-indigo-900/60 z-[310] flex flex-col items-center justify-center text-white backdrop-blur-md">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-black uppercase tracking-widest text-lg">Processando PDF Profissional...</p>
        </div>
      )}

      <div className="bg-white w-full max-w-4xl h-full md:h-auto md:max-h-[95vh] md:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        <div className="p-4 md:p-6 border-b bg-slate-50 flex justify-between items-center shrink-0">
          <button onClick={onClose} className="p-3 bg-white border border-slate-200 hover:bg-slate-100 rounded-2xl transition-all">
             <span className="font-black text-slate-600">Voltar</span>
          </button>
          
          <button 
            onClick={handleDownloadPDF}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-200 flex items-center gap-3 transition-all"
          >
            <span>📥</span> BAIXAR PDF FINAL
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-12 bg-slate-200/50 no-scrollbar">
          <div id="printable-service-note" className="bg-white max-w-[210mm] mx-auto p-8 md:p-16 shadow-xl border border-slate-100 rounded-sm">
            
            <div className="flex justify-between items-start border-b-8 border-indigo-600 pb-10 mb-10">
              <div>
                <h1 className="text-3xl font-black text-slate-900 leading-none mb-2">RM ELÉTRICA & SOLUÇÕES</h1>
                <p className="text-indigo-600 font-black uppercase tracking-widest text-xs">Excelência em Instalações e Manutenções</p>
                <div className="mt-6 text-[11px] text-slate-400 font-bold uppercase tracking-tighter space-y-1">
                  <p>Especialista: Ricardo M.</p>
                  <p>Contato: (00) 99999-9999</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-slate-900 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase mb-2">Nota de Serviço</div>
                <p className="text-xs text-slate-400 font-bold"># {service.id.slice(-6)}</p>
                <p className="text-xs text-slate-500 font-bold">{new Date(service.date).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">Cliente</h4>
                <p className="text-xl font-black text-slate-800 leading-tight mb-1">{customer?.name || 'Particular'}</p>
                <div className="text-[11px] text-slate-500 font-medium space-y-0.5">
                  <p>{customer?.street}</p>
                  <p>{customer?.neighborhood ? `${customer.neighborhood}, ` : ''}{customer?.city} - {customer?.state}</p>
                  {customer?.cep && <p>CEP: {customer.cep}</p>}
                </div>
              </div>
              <div className="md:text-right flex flex-col justify-center">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pagamento</h4>
                <p className="text-lg font-black text-slate-800">{service.paymentMethod}</p>
                {service.paymentMethod === PaymentMethod.CREDIT_CARD && (
                  <p className="text-sm font-bold text-indigo-500">{service.installments}x Sem Juros</p>
                )}
                <div className={`mt-3 inline-block self-start md:self-end px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${service.status === ServiceStatus.COMPLETED ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white'}`}>
                  {service.status}
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Relatório de Execução</h4>
              <div className="bg-slate-50 p-8 rounded-[2rem] border-l-[12px] border-indigo-600 min-h-[120px]">
                <p className="text-sm text-slate-800 leading-relaxed italic whitespace-pre-wrap">{service.description}</p>
              </div>
            </div>

            <div className="mb-12 overflow-hidden rounded-3xl border border-slate-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-900 text-white text-[10px] font-black uppercase">
                    <th className="px-6 py-4 text-left">Descrição dos Serviços e Itens</th>
                    <th className="px-6 py-4 text-center">Qtd</th>
                    <th className="px-6 py-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  <tr>
                    <td className="px-6 py-5">
                      <p className="font-black text-slate-800">Mão de Obra Técnica</p>
                      <p className="text-[9px] text-slate-400 uppercase tracking-tighter">Instalação e reparos especializados</p>
                    </td>
                    <td className="px-6 py-5 text-center font-bold">1</td>
                    <td className="px-6 py-5 text-right font-black">R$ {service.serviceValue.toFixed(2)}</td>
                  </tr>
                  {service.materials.map((sm, idx) => {
                    const mat = getMaterialDetails(sm);
                    return (
                      <tr key={idx} className="text-slate-600 bg-slate-50/30">
                        <td className="px-6 py-4 font-medium">{mat?.name}</td>
                        <td className="px-6 py-4 text-center">{sm.quantity}</td>
                        <td className="px-6 py-4 text-right font-bold text-slate-800">R$ {(sm.quantity * (mat?.sellingPrice || 0)).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  {service.discount > 0 && (
                    <tr className="bg-rose-50">
                      <td colSpan={2} className="px-6 py-3 text-right text-[10px] font-black text-rose-500 uppercase">Bonificação</td>
                      <td className="px-6 py-3 text-right font-black text-rose-600">- R$ {service.discount.toFixed(2)}</td>
                    </tr>
                  )}
                  <tr className="bg-slate-900 text-white">
                    <td colSpan={2} className="px-6 py-6 text-left text-lg font-black uppercase tracking-tighter">Investimento Total</td>
                    <td className="px-6 py-6 text-right text-2xl font-black">
                      R$ {service.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-20 pt-10 border-t border-dashed border-slate-200">
              <div className="text-center">
                <div className="border-b-2 border-slate-900 w-full mb-3 h-10"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Responsável Técnico</p>
                <p className="text-xs font-black text-slate-800 mt-1 uppercase">RM ELÉTRICA & SOLUÇÕES</p>
              </div>
              <div className="text-center">
                <div className="border-b-2 border-slate-900 w-full mb-3 h-10"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assinatura do Cliente</p>
                <p className="text-xs font-black text-slate-800 mt-1 uppercase">{customer?.name || 'Cliente'}</p>
              </div>
            </div>
            
            <p className="mt-20 text-center text-[8px] text-slate-300 font-bold uppercase tracking-[0.4em]">
              Gerado Digitalmente • Obrigado pela confiança
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ServiceManager: React.FC<Props> = ({ services, setServices, customers, materials, serviceTypes }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [selectedServiceForNote, setSelectedServiceForNote] = useState<string | null>(null);
  
  const initialFormState: Partial<ServiceRecord> = {
    customerId: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    materials: [],
    paymentMethod: PaymentMethod.PIX,
    installments: 1,
    status: ServiceStatus.AWAITING_APPROVAL,
    serviceValue: 0,
    discount: 0
  };

  const [formData, setFormData] = useState<Partial<ServiceRecord>>(initialFormState);
  const [currentMaterial, setCurrentMaterial] = useState({ id: '', qty: 1 });

  const activeService = useMemo(() => 
    selectedServiceForNote ? services.find(s => s.id === selectedServiceForNote) : null
  , [selectedServiceForNote, services]);

  const activeCustomer = useMemo(() => 
    activeService ? customers.find(c => c.id === activeService.customerId) : null
  , [activeService, customers]);

  const currentTotals = useMemo(() => {
    const labor = Number(formData.serviceValue) || 0;
    const discount = Number(formData.discount) || 0;
    const mats = (formData.materials || []).reduce((acc, curr) => {
      const mat = materials.find(m => m.id === curr.materialId);
      return acc + (mat ? mat.sellingPrice * curr.quantity : 0);
    }, 0);
    const total = (labor + mats) - discount;
    return { labor, mats, discount, total: total < 0 ? 0 : total };
  }, [formData.serviceValue, formData.materials, formData.discount, materials]);

  const handleServiceTypeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const typeId = e.target.value;
    if (!typeId) return;
    const selectedType = serviceTypes.find(t => t.id === typeId);
    if (selectedType) {
      setFormData({
        ...formData,
        description: selectedType.name + (selectedType.description ? `: ${selectedType.description}` : ''),
        serviceValue: selectedType.baseValue
      });
    }
  };

  const addMaterialToService = () => {
    if (!currentMaterial.id) return;
    const existing = formData.materials?.find(m => m.materialId === currentMaterial.id);
    if (existing) {
      setFormData({
        ...formData,
        materials: formData.materials?.map(m => m.materialId === currentMaterial.id ? { ...m, quantity: m.quantity + currentMaterial.qty } : m)
      });
    } else {
      setFormData({
        ...formData,
        materials: [...(formData.materials || []), { materialId: currentMaterial.id, quantity: currentMaterial.qty }]
      });
    }
    setCurrentMaterial({ id: '', qty: 1 });
  };

  const removeMaterialFromForm = (materialId: string) => {
    setFormData({
      ...formData,
      materials: formData.materials?.filter(m => m.materialId !== materialId)
    });
  };

  const handleEditClick = (service: ServiceRecord) => {
    setFormData({
      customerId: service.customerId,
      description: service.description,
      date: service.date,
      materials: [...service.materials],
      paymentMethod: service.paymentMethod,
      installments: service.installments || 1,
      status: service.status,
      serviceValue: service.serviceValue,
      discount: service.discount || 0
    });
    setEditingServiceId(service.id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId || !formData.description) return;

    if (editingServiceId) {
      const updatedServices = services.map(s => 
        s.id === editingServiceId 
          ? { 
              ...s, 
              ...formData, 
              totalValue: currentTotals.total, 
              serviceValue: currentTotals.labor, 
              discount: currentTotals.discount,
              installments: formData.paymentMethod === PaymentMethod.CREDIT_CARD ? formData.installments : 1
            } as ServiceRecord 
          : s
      );
      setServices(updatedServices);
    } else {
      const newService: ServiceRecord = {
        id: Date.now().toString(),
        customerId: formData.customerId!,
        description: formData.description!,
        date: formData.date!,
        materials: formData.materials || [],
        paymentMethod: formData.paymentMethod as PaymentMethod,
        installments: formData.paymentMethod === PaymentMethod.CREDIT_CARD ? (formData.installments || 1) : 1,
        status: formData.status as ServiceStatus,
        serviceValue: currentTotals.labor,
        discount: currentTotals.discount,
        totalValue: currentTotals.total
      };
      setServices([...services, newService]);
    }

    setFormData(initialFormState);
    setEditingServiceId(null);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Serviços e Notas</h2>
          <p className="text-slate-500 text-sm">Registro técnico e geração de PDF profissional.</p>
        </div>
        <button 
          onClick={() => {
            if (isFormOpen) {
              setFormData(initialFormState);
              setEditingServiceId(null);
            }
            setIsFormOpen(!isFormOpen);
          }}
          className={`${isFormOpen ? 'bg-slate-200 text-slate-600' : 'bg-indigo-600 text-white shadow-lg'} px-6 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2`}
        >
          {isFormOpen ? 'Cancelar' : '🛠️ Novo Registro'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleAddService} className="bg-white p-6 md:p-8 rounded-[2.5rem] border-2 border-indigo-100 shadow-2xl space-y-8 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-100 p-3 rounded-2xl text-xl">📝</div>
             <div>
                <h3 className="font-black text-slate-800 uppercase tracking-tighter">Ficha de Atendimento</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Informações principais</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cliente Solicitante</label>
              <select required value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-500 font-bold transition-all outline-none">
                <option value="">Selecione...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data do Serviço</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-500 font-bold outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Atual</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as ServiceStatus})} className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-500 font-black outline-none">
                {Object.values(ServiceStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="md:col-span-3 bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
              <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Modelos Rápidos</label>
              <select onChange={handleServiceTypeSelect} className="w-full p-3 rounded-xl border-2 border-indigo-100 bg-white text-sm font-black text-indigo-700 outline-none">
                <option value="">Buscar sugestão do catálogo...</option>
                {serviceTypes.map(t => <option key={t.id} value={t.id}>{t.name} (Ref: R$ {t.baseValue.toFixed(2)})</option>)}
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Relatório de Serviço Executado</label>
              <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-6 rounded-3xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-500 font-medium h-32 transition-all outline-none" placeholder="O que foi feito? Quais as observações técnicas?" />
            </div>

            {/* SEÇÃO DE MATERIAIS - AGORA ABAIXO DO RELATÓRIO */}
            <div className="md:col-span-3 border-t-2 border-dashed border-slate-100 pt-8">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="bg-slate-100 p-2 rounded-lg">📦</span> Materiais Utilizados neste Atendimento
              </h4>
              <div className="flex flex-col md:flex-row gap-3 mb-6">
                <select className="flex-1 p-4 rounded-2xl border-2 border-slate-100 font-bold outline-none" value={currentMaterial.id} onChange={e => setCurrentMaterial({...currentMaterial, id: e.target.value})}>
                  <option value="">Buscar material no estoque...</option>
                  {materials.map(m => <option key={m.id} value={m.id}>{m.name} (Estoque: {m.stock} UN)</option>)}
                </select>
                <div className="flex gap-3">
                   <input type="number" min="1" className="w-20 p-4 rounded-2xl border-2 border-slate-100 text-center font-black outline-none" value={currentMaterial.qty} onChange={e => setCurrentMaterial({...currentMaterial, qty: Number(e.target.value)})} />
                   <button type="button" onClick={addMaterialToService} className="bg-slate-900 text-white px-8 rounded-2xl font-black uppercase text-xs hover:bg-slate-800 transition-all">Adicionar</button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formData.materials?.map((sm, idx) => {
                  const someMat = materials.find(m => m.id === sm.materialId);
                  return (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div>
                        <span className="font-black text-slate-700 block">{someMat?.name}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase">Qtd: {sm.quantity}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-black text-indigo-600">R$ {(someMat ? someMat.sellingPrice * sm.quantity : 0).toFixed(2)}</span>
                        <button type="button" onClick={() => removeMaterialFromForm(sm.materialId)} className="text-rose-500 hover:scale-125 transition-transform">✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor Mão de Obra (R$)</label>
              <input type="number" step="0.01" value={formData.serviceValue} onChange={e => setFormData({...formData, serviceValue: Number(e.target.value)})} className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-black text-indigo-600 outline-none" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Desconto (R$)</label>
              <input type="number" step="0.01" value={formData.discount} onChange={e => setFormData({...formData, discount: Number(e.target.value)})} className="w-full p-4 rounded-2xl border-2 border-rose-100 bg-rose-50/30 font-black text-rose-600 outline-none" />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Forma Pagto</label>
                <select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value as PaymentMethod})} className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-black outline-none">
                  {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              {formData.paymentMethod === PaymentMethod.CREDIT_CARD && (
                <div className="w-24">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Parcelas</label>
                  <select value={formData.installments} onChange={e => setFormData({...formData, installments: Number(e.target.value)})} className="w-full p-4 rounded-2xl border-2 border-indigo-100 bg-white font-black text-indigo-600 outline-none">
                    {[...Array(12)].map((_, i) => (
                      <option key={i+1} value={i+1}>{i+1}x</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="relative z-10 flex justify-between items-center">
              <div>
                 <p className="text-[10px] opacity-50 uppercase font-black tracking-[0.2em] mb-1">Total da Nota</p>
                 <p className="text-xs text-indigo-400 font-bold">Mão de obra + Materiais</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black tracking-tighter">R$ {currentTotals.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all"></div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white p-6 rounded-3xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all text-lg">
            {editingServiceId ? '💾 Atualizar Nota' : '✅ Gerar e Salvar Nota'}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {services.slice().reverse().map(s => (
          <div key={s.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 hover:border-indigo-400 hover:shadow-xl transition-all group">
            <div className="flex-1 w-full text-left">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.date}</span>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${s.status === ServiceStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {s.status}
                </span>
              </div>
              <h4 className="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{customers.find(c => c.id === s.customerId)?.name || 'Cliente Particular'}</h4>
              <p className="text-sm text-slate-500 line-clamp-1 italic font-medium">{s.description}</p>
              
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={() => setSelectedServiceForNote(s.id)} className="bg-slate-900 text-white font-black text-[10px] px-6 py-3 rounded-xl hover:bg-indigo-600 transition-all flex items-center gap-2 uppercase tracking-widest shadow-lg">
                  📄 Gerar PDF Profissional
                </button>
                <button onClick={() => handleEditClick(s)} className="text-[10px] bg-slate-100 text-slate-600 font-black px-6 py-3 rounded-xl hover:bg-slate-200 transition-all uppercase tracking-widest">
                  Editar
                </button>
              </div>
            </div>
            
            <div className="text-right border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8 w-full md:w-auto flex flex-row md:flex-col justify-between items-center md:items-end">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Total</p>
                <p className="text-2xl font-black text-slate-900 tracking-tighter">R$ {s.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <p className="text-[9px] text-indigo-600 font-black uppercase bg-indigo-50 px-3 py-1.5 rounded-lg mt-2">
                {s.paymentMethod}
              </p>
            </div>
          </div>
        ))}
        {services.length === 0 && (
          <div className="py-24 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-100 text-slate-300">
            <div className="text-5xl mb-4">🛠️</div>
            <p className="font-black uppercase tracking-widest">Nenhuma nota registrada</p>
          </div>
        )}
      </div>

      {activeService && (
        <ServiceNoteModal 
          service={activeService} 
          customer={activeCustomer}
          allMaterials={materials}
          onClose={() => setSelectedServiceForNote(null)}
        />
      )}
    </div>
  );
};

export default ServiceManager;
