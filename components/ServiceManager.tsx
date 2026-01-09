
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
      alert('Carregando biblioteca de PDF... Tente novamente em um instante.');
      return;
    }

    setIsGenerating(true);
    const element = document.getElementById('professional-invoice-template');
    
    if (!element) {
      setIsGenerating(false);
      return;
    }

    const customerName = (customer?.name || 'Cliente').replace(/[^a-z0-9]/gi, '_');
    const fileName = `RM_Eletrica_Servico_${service.id.slice(-4)}_${customerName}.pdf`;

    const options = {
      margin: [10, 10, 10, 10],
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 3, 
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
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[300] flex items-center justify-center p-4 md:p-10 overflow-hidden">
      {isGenerating && (
        <div className="fixed inset-0 bg-indigo-900/60 z-[310] flex flex-col items-center justify-center text-white backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-bold uppercase tracking-widest">Gerando PDF em Alta Resolução...</p>
        </div>
      )}

      <div className="bg-slate-100 w-full max-w-5xl h-full flex flex-col rounded-[2rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
        
        {/* Barra de Ferramentas do Modal */}
        <div className="p-4 bg-white border-b flex justify-between items-center shadow-sm shrink-0">
          <button onClick={onClose} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all flex items-center gap-2">
            <span>✕</span> Fechar Visualização
          </button>
          
          <button 
            onClick={handleDownloadPDF}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-black text-sm shadow-xl shadow-indigo-200 flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95"
          >
            <span>📄</span> BAIXAR PDF PROFISSIONAL
          </button>
        </div>

        {/* Área de Visualização do Documento */}
        <div className="flex-1 overflow-y-auto p-4 md:p-12 no-scrollbar bg-slate-300/30">
          
          {/* TEMPLATE DO PDF PROFISSIONAL */}
          <div id="professional-invoice-template" className="bg-white w-full max-w-[210mm] mx-auto p-12 md:p-16 shadow-2xl rounded-sm text-slate-800" style={{ minHeight: '297mm' }}>
            
            {/* Cabeçalho */}
            <div className="flex justify-between items-start border-b-4 border-indigo-600 pb-10 mb-12">
              <div className="space-y-1">
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">RM ELÉTRICA</h1>
                <h2 className="text-lg font-bold text-indigo-600 uppercase tracking-widest">Soluções & Manutenção</h2>
                <div className="mt-6 text-xs text-slate-500 font-medium space-y-1">
                  <p className="flex items-center gap-2"><span className="text-indigo-400">📍</span> Ricardo M. - Especialista Técnico</p>
                  <p className="flex items-center gap-2"><span className="text-indigo-400">📞</span> Contato: (00) 99999-9999</p>
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="bg-slate-900 text-white px-6 py-3 rounded-xl inline-block">
                  <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Relatório de Serviço</p>
                  <p className="text-xl font-black"># {service.id.slice(-6).toUpperCase()}</p>
                </div>
                <p className="text-xs font-bold text-slate-400">{new Date(service.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            {/* Dados das Partes */}
            <div className="grid grid-cols-2 gap-12 mb-12">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest border-b border-indigo-100 pb-2">Informações do Cliente</h4>
                <div className="space-y-1">
                  <p className="text-xl font-black text-slate-800 leading-tight">{customer?.name || 'Cliente Particular'}</p>
                  <p className="text-sm font-medium text-slate-500">{customer?.street}, {customer?.neighborhood}</p>
                  <p className="text-sm font-medium text-slate-500">{customer?.city} - {customer?.state} | CEP: {customer?.cep}</p>
                  <p className="text-sm font-bold text-slate-700 mt-2">Tel: {customer?.phone}</p>
                </div>
              </div>
              <div className="space-y-4 text-right">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Condições de Pagamento</h4>
                <div className="space-y-1">
                  <p className="text-lg font-black text-slate-800">{service.paymentMethod}</p>
                  {service.paymentMethod === PaymentMethod.CREDIT_CARD && (
                    <p className="text-sm font-bold text-indigo-500">Parcelamento: {service.installments}x</p>
                  )}
                  <div className={`mt-2 inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${service.status === ServiceStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    Status: {service.status}
                  </div>
                </div>
              </div>
            </div>

            {/* Descrição Técnica */}
            <div className="mb-12">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Relatório Técnico de Execução</h4>
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 relative min-h-[120px]">
                <p className="text-sm text-slate-700 leading-relaxed italic whitespace-pre-wrap">{service.description}</p>
                <div className="absolute top-4 right-4 opacity-5 text-4xl">🛠️</div>
              </div>
            </div>

            {/* Tabela de Valores */}
            <div className="mb-16">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Detalhamento Financeiro</h4>
              <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
                      <th className="px-8 py-5 text-left">Item / Descrição do Serviço</th>
                      <th className="px-8 py-5 text-center">Qtd</th>
                      <th className="px-8 py-5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    <tr>
                      <td className="px-8 py-6">
                        <p className="font-black text-slate-800">Mão de Obra Técnica Especializada</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-tight">Serviços de instalação, reparo e manutenção</p>
                      </td>
                      <td className="px-8 py-6 text-center font-bold">1</td>
                      <td className="px-8 py-6 text-right font-black">R$ {service.serviceValue.toFixed(2)}</td>
                    </tr>
                    {service.materials.map((sm, idx) => {
                      const mat = getMaterialDetails(sm);
                      return (
                        <tr key={idx} className="bg-slate-50/50">
                          <td className="px-8 py-5 text-slate-600">
                             <span className="font-bold text-slate-700">{mat?.name}</span>
                             <p className="text-[10px] opacity-60">Material de reposição/instalação</p>
                          </td>
                          <td className="px-8 py-5 text-center font-medium">{sm.quantity}</td>
                          <td className="px-8 py-5 text-right font-bold">R$ {(sm.quantity * (mat?.sellingPrice || 0)).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-900 text-white">
                    {service.discount > 0 && (
                      <tr className="bg-rose-600">
                        <td colSpan={2} className="px-8 py-3 text-right text-[10px] font-black uppercase">Desconto Especial / Bonificação</td>
                        <td className="px-8 py-3 text-right font-black">- R$ {service.discount.toFixed(2)}</td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={2} className="px-8 py-8 text-left text-xl font-black uppercase tracking-tighter">Investimento Total Final</td>
                      <td className="px-8 py-8 text-right text-3xl font-black">
                        R$ {service.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Assinaturas */}
            <div className="mt-20 grid grid-cols-2 gap-24 px-12 pt-12 border-t border-dashed border-slate-200">
              <div className="text-center space-y-3">
                <div className="border-b-2 border-slate-900 w-full h-8"></div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ricardo M. - RM Elétrica</p>
              </div>
              <div className="text-center space-y-3">
                <div className="border-b-2 border-slate-900 w-full h-8"></div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{customer?.name || 'Assinatura do Cliente'}</p>
              </div>
            </div>

            <div className="mt-32 text-center">
               <p className="text-[8px] text-slate-300 font-bold uppercase tracking-[0.5em]">Obrigado pela preferência • Documento gerado digitalmente</p>
            </div>
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
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Atendimentos</h2>
          <p className="text-slate-500 text-sm">Registro de serviços e notas fiscais de serviço.</p>
        </div>
        <button 
          onClick={() => {
            if (isFormOpen) {
              setFormData(initialFormState);
              setEditingServiceId(null);
            }
            setIsFormOpen(!isFormOpen);
          }}
          className={`${isFormOpen ? 'bg-slate-200 text-slate-600' : 'bg-indigo-600 text-white shadow-lg'} px-8 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2`}
        >
          {isFormOpen ? 'Cancelar' : '➕ Novo Registro'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleAddService} className="bg-white p-6 md:p-10 rounded-[2.5rem] border-2 border-indigo-100 shadow-2xl space-y-10 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-4">
             <div className="bg-indigo-600 text-white p-4 rounded-2xl text-2xl shadow-lg shadow-indigo-200">📝</div>
             <div>
                <h3 className="font-black text-slate-800 uppercase tracking-tighter text-xl">Ficha de Atendimento Profissional</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">Configuração do relatório final</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Cliente do Atendimento</label>
              <select required value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-500 font-bold transition-all outline-none">
                <option value="">Selecione um cliente...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Data da Execução</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-500 font-bold outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Estado do Serviço</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as ServiceStatus})} className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-500 font-black outline-none">
                {Object.values(ServiceStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="md:col-span-3 bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 flex flex-col md:flex-row items-center gap-4">
              <span className="text-xl">📋</span>
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Modelos Rápidos do Catálogo</label>
                <select onChange={handleServiceTypeSelect} className="w-full p-3 rounded-xl border-2 border-indigo-100 bg-white text-sm font-black text-indigo-700 outline-none">
                  <option value="">Aplicar sugestão pré-definida...</option>
                  {serviceTypes.map(t => <option key={t.id} value={t.id}>{t.name} (Ref: R$ {t.baseValue.toFixed(2)})</option>)}
                </select>
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Relatório Técnico do Serviço</label>
              <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-6 rounded-3xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-500 font-medium h-40 transition-all outline-none" placeholder="Descreva aqui o que foi executado..." />
            </div>

            {/* SEÇÃO DE MATERIAIS - ABAIXO DO RELATÓRIO */}
            <div className="md:col-span-3 border-t-2 border-indigo-50 pt-10">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
                  <span className="bg-slate-900 text-white p-2 rounded-lg text-xs">📦</span> Materiais de Reposição e Uso
                </h4>
                <span className="text-[10px] font-black text-slate-400 uppercase">Estoque Integrado</span>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <select className="flex-1 p-4 rounded-2xl border-2 border-slate-100 font-bold outline-none bg-white" value={currentMaterial.id} onChange={e => setCurrentMaterial({...currentMaterial, id: e.target.value})}>
                  <option value="">Escolher material do inventário...</option>
                  {materials.map(m => <option key={m.id} value={m.id}>{m.name} (Saldo: {m.stock} UN)</option>)}
                </select>
                <div className="flex gap-4">
                   <input type="number" min="1" className="w-24 p-4 rounded-2xl border-2 border-slate-100 text-center font-black outline-none bg-white" value={currentMaterial.qty} onChange={e => setCurrentMaterial({...currentMaterial, qty: Number(e.target.value)})} />
                   <button type="button" onClick={addMaterialToService} className="bg-slate-900 text-white px-10 rounded-2xl font-black uppercase text-xs hover:bg-slate-700 transition-all shadow-lg">Lançar</button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {formData.materials?.map((sm, idx) => {
                  const someMat = materials.find(m => m.id === sm.materialId);
                  return (
                    <div key={idx} className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm animate-in zoom-in-95">
                      <div>
                        <span className="font-black text-slate-800 block text-sm">{someMat?.name}</span>
                        <span className="text-[10px] font-black text-indigo-500 uppercase">Qtd: {sm.quantity}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-slate-400 text-sm">R$ {(someMat ? someMat.sellingPrice * sm.quantity : 0).toFixed(2)}</span>
                        <button type="button" onClick={() => removeMaterialFromForm(sm.materialId)} className="bg-rose-50 text-rose-500 p-2 rounded-lg hover:bg-rose-500 hover:text-white transition-all">✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mão de Obra (R$)</label>
              <input type="number" step="0.01" value={formData.serviceValue} onChange={e => setFormData({...formData, serviceValue: Number(e.target.value)})} className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-black text-indigo-600 outline-none text-lg" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Desconto (R$)</label>
              <input type="number" step="0.01" value={formData.discount} onChange={e => setFormData({...formData, discount: Number(e.target.value)})} className="w-full p-4 rounded-2xl border-2 border-rose-100 bg-rose-50/30 font-black text-rose-600 outline-none text-lg" />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Meio de Pagamento</label>
                <select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value as PaymentMethod})} className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-black outline-none">
                  {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              {formData.paymentMethod === PaymentMethod.CREDIT_CARD && (
                <div className="w-24">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Vezes</label>
                  <select value={formData.installments} onChange={e => setFormData({...formData, installments: Number(e.target.value)})} className="w-full p-4 rounded-2xl border-2 border-indigo-100 bg-white font-black text-indigo-600 outline-none">
                    {[...Array(12)].map((_, i) => (
                      <option key={i+1} value={i+1}>{i+1}x</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                 <p className="text-[10px] opacity-40 uppercase font-black tracking-[0.4em] mb-2">Total a ser cobrado</p>
                 <div className="flex items-center gap-3">
                    <span className="text-3xl">💵</span>
                    <h4 className="text-xl font-bold">Investimento Final do Atendimento</h4>
                 </div>
              </div>
              <div className="text-right">
                <p className="text-5xl font-black tracking-tighter text-indigo-400">R$ {currentTotals.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] group-hover:bg-indigo-600/40 transition-all"></div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white p-8 rounded-3xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-2xl shadow-indigo-200 transition-all text-xl transform hover:-translate-y-1">
            {editingServiceId ? '💾 Atualizar Relatório de Serviço' : '✅ Gravar Atendimento e Finalizar'}
          </button>
        </form>
      )}

      {/* Lista de Registros */}
      <div className="space-y-4">
        {services.slice().reverse().map(s => (
          <div key={s.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 hover:border-indigo-500 hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="flex-1 w-full text-left relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(s.date).toLocaleDateString('pt-BR')}</span>
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${s.status === ServiceStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {s.status}
                </span>
              </div>
              <h4 className="text-2xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight mb-2">
                {customers.find(c => c.id === s.customerId)?.name || 'Cliente Particular'}
              </h4>
              <p className="text-sm text-slate-500 line-clamp-1 italic font-medium max-w-2xl">{s.description}</p>
              
              <div className="mt-8 flex flex-wrap gap-3">
                <button 
                  onClick={() => setSelectedServiceForNote(s.id)} 
                  className="bg-slate-900 text-white font-black text-[10px] px-8 py-4 rounded-2xl hover:bg-indigo-600 transition-all flex items-center gap-3 uppercase tracking-widest shadow-lg shadow-slate-200"
                >
                  <span className="text-base">📄</span> VER PDF PROFISSIONAL
                </button>
                <button 
                  onClick={() => handleEditClick(s)} 
                  className="text-[10px] bg-slate-100 text-slate-600 font-black px-8 py-4 rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest"
                >
                  Editar Dados
                </button>
              </div>
            </div>
            
            <div className="text-right border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-10 w-full md:w-auto flex flex-row md:flex-col justify-between items-center md:items-end relative z-10">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Valor do Serviço</p>
                <p className="text-3xl font-black text-slate-900 tracking-tighter">R$ {s.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <p className="text-[10px] text-indigo-600 font-black uppercase bg-indigo-50 px-4 py-2 rounded-xl mt-4 inline-block border border-indigo-100">
                {s.paymentMethod} {s.paymentMethod === PaymentMethod.CREDIT_CARD ? `(${s.installments}x)` : ''}
              </p>
            </div>
            
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-9xl font-black select-none pointer-events-none group-hover:opacity-[0.06] transition-opacity">
               RM
            </div>
          </div>
        ))}
        {services.length === 0 && (
          <div className="py-32 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-100 text-slate-300">
            <div className="text-6xl mb-6">🛠️</div>
            <p className="font-black uppercase tracking-[0.3em] text-sm">Pronto para o próximo atendimento?</p>
            <p className="text-xs font-bold mt-2">Nenhuma nota registrada até o momento.</p>
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
