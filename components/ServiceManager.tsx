
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
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Travar o scroll do fundo ao abrir o modal
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleDownloadPDF = async () => {
    // @ts-ignore
    if (typeof html2pdf === 'undefined') {
      alert('Erro: Sistema de PDF ainda carregando. Tente novamente em 2 segundos.');
      return;
    }

    setIsGenerating(true);
    const element = document.getElementById('printable-service-note');
    
    if (!element) {
      setIsGenerating(false);
      alert('Erro: Nota não encontrada para gerar arquivo.');
      return;
    }

    const customerName = (customer?.name || 'Cliente').replace(/[^a-z0-9]/gi, '_');
    const fileName = `Nota_RM_${service.id.slice(-6)}_${customerName}.pdf`;

    const options = {
      margin: 10,
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        backgroundColor: '#ffffff',
        windowWidth: 800 
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      // @ts-ignore
      await html2pdf().set(options).from(element).save();
      
      setTimeout(() => {
        alert('✅ PDF Salvo! Verifique sua pasta de Downloads ou Documentos.');
      }, 500);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Não foi possível salvar automaticamente. O sistema abrirá a opção de imprimir manualmente.');
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  const getNoteText = () => {
    const paymentStr = service.paymentMethod === PaymentMethod.CREDIT_CARD && service.installments 
      ? `${service.paymentMethod} (${service.installments}x)` 
      : service.paymentMethod;

    return `
⚡ *RM ELÉTRICA & SOLUÇÕES* ⚡
Nota de Serviço nº ${service.id.slice(-6)}
--------------------------
📅 Data: ${new Date(service.date).toLocaleDateString('pt-BR')}
👤 Cliente: ${customer?.name || 'N/A'}
🛠️ Serviço: ${service.description}
💳 Pagamento: ${paymentStr}
--------------------------
💰 Total: R$ ${service.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
    `.trim();
  };

  const handleCopy = () => {
    const text = getNoteText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const text = getNoteText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Nota RM Elétrica - ${customer?.name}`,
          text: text,
        });
      } catch (err) {
        console.error('Erro ao compartilhar:', err);
      }
    } else {
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }
  };

  const getMaterialDetails = (sm: ServiceMaterial) => {
    return allMaterials.find(m => m.id === sm.materialId);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[200] flex items-center justify-center p-0 md:p-4 print:p-0 print:bg-white print:static print:block overflow-hidden">
      {/* Overlay de Processamento */}
      {isGenerating && (
        <div className="fixed inset-0 bg-indigo-900/70 z-[210] flex flex-col items-center justify-center text-white backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-black text-xl uppercase tracking-widest">Salvando Arquivo...</p>
        </div>
      )}

      <div className="bg-white w-full max-w-3xl h-full md:h-auto md:rounded-[2.5rem] shadow-2xl flex flex-col max-h-screen md:max-h-[95vh] print:max-h-full print:shadow-none print:rounded-none overflow-hidden print:overflow-visible">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center print:hidden bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700 transition-colors">
              <span className="font-black">✕</span>
            </button>
            <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-widest hidden sm:block">Pré-visualização da Nota</h3>
          </div>
          
          <div className="flex gap-1.5 sm:gap-2">
            <button 
              onClick={handleCopy}
              className={`p-2 sm:px-4 sm:py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              <span>{copied ? '✅' : '📋'}</span>
              <span className="hidden sm:inline">{copied ? 'Copiado' : 'Texto'}</span>
            </button>
            
            <button 
              onClick={handleShare}
              className="bg-emerald-500 text-white p-2 sm:px-4 sm:py-2 rounded-xl font-bold text-xs hover:bg-emerald-600 flex items-center gap-2 transition-all"
            >
              <span>🔗</span>
              <span className="hidden sm:inline">Enviar</span>
            </button>
            
            <button 
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="bg-indigo-600 text-white p-2 sm:px-4 sm:py-2 rounded-xl font-bold text-xs hover:bg-indigo-700 flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 disabled:bg-slate-400"
            >
              <span>📥</span>
              <span className="hidden sm:inline">Baixar PDF</span>
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-12 print:overflow-visible print:p-0 bg-slate-100 md:bg-white no-scrollbar">
          <div id="printable-service-note" className="bg-white max-w-2xl mx-auto border border-slate-200 md:border-slate-100 p-6 md:p-10 rounded-2xl md:rounded-3xl print:border-none print:p-0 shadow-sm md:shadow-none">
            <div className="flex flex-col sm:flex-row justify-between items-start border-b-4 border-indigo-600 pb-6 mb-8 gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-1">RM Elétrica & Soluções</h1>
                <p className="text-sm text-indigo-600 font-bold uppercase tracking-wider">Serviços Elétricos Profissionais</p>
                <div className="text-[11px] text-slate-400 mt-4 font-medium space-y-0.5">
                  <p>WhatsApp: (00) 99999-9999</p>
                  <p>CNPJ: 00.000.000/0001-00</p>
                </div>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto">
                <div className="bg-slate-900 text-white px-4 py-2 rounded-lg font-black text-[10px] inline-block mb-2 uppercase tracking-widest">
                  Nota de Serviço
                </div>
                <p className="text-xs text-slate-400 font-bold">Nº {service.id.slice(-6)}</p>
                <p className="text-xs text-slate-500 font-medium">Emissão: {new Date(service.date).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Dados do Cliente</h4>
                <p className="font-black text-slate-800 text-lg mb-1 leading-tight">{customer?.name || 'Cliente Particular'}</p>
                <p className="text-[11px] text-slate-500 leading-tight mb-2">{customer?.address || 'Endereço não informado'}</p>
                <p className="text-sm text-indigo-600 font-black">{customer?.phone}</p>
              </div>
              <div className="sm:text-right p-5 border-2 border-indigo-50 rounded-2xl flex flex-col sm:items-end justify-center">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pagamento Escolhido</h4>
                <p className="text-base text-slate-900 font-black">
                  {service.paymentMethod} {service.paymentMethod === PaymentMethod.CREDIT_CARD && service.installments ? `(${service.installments}x)` : ''}
                </p>
                <div className={`mt-3 inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase ${service.status === ServiceStatus.COMPLETED ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white'}`}>
                  {service.status}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Relatório de Serviços Executados</h4>
              <div className="text-sm text-slate-800 leading-relaxed bg-slate-50/50 p-6 rounded-2xl italic border-l-8 border-indigo-500 whitespace-pre-wrap min-h-[120px]">
                {service.description}
              </div>
            </div>

            <div className="mb-8 overflow-hidden rounded-2xl border border-slate-100">
              <table className="w-full text-[11px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-left">
                    <th className="px-4 py-3 text-slate-400 font-black uppercase text-[9px]">Discriminação</th>
                    <th className="px-4 py-3 text-center text-slate-400 font-black uppercase text-[9px]">Qtd</th>
                    <th className="px-4 py-3 text-right text-slate-400 font-black uppercase text-[9px]">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-4">
                       <p className="font-black text-slate-800">Mão de Obra Profissional</p>
                       <p className="text-[9px] text-slate-400">Serviços elétricos especializados</p>
                    </td>
                    <td className="px-4 py-4 text-center">1</td>
                    <td className="px-4 py-4 text-right font-black text-slate-900">R$ {service.serviceValue.toFixed(2)}</td>
                  </tr>
                  {service.materials.map((sm, i) => {
                    const mat = getMaterialDetails(sm);
                    const unitPrice = mat?.sellingPrice || 0;
                    return (
                      <tr key={i} className="text-slate-600">
                        <td className="px-4 py-3">
                           <p className="font-bold text-slate-700">{mat?.name}</p>
                        </td>
                        <td className="px-4 py-3 text-center">{sm.quantity}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-800">R$ {(sm.quantity * unitPrice).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="border-t-2 border-slate-900">
                  {service.discount > 0 && (
                    <tr className="bg-rose-50/50">
                      <td colSpan={2} className="px-4 py-2 text-right text-rose-500 font-bold uppercase text-[9px]">Desconto Especial</td>
                      <td className="px-4 py-2 text-right font-black text-rose-600">- R$ {service.discount.toFixed(2)}</td>
                    </tr>
                  )}
                  <tr className="bg-slate-900 text-white">
                    <td colSpan={2} className="px-6 py-5 text-left font-black uppercase tracking-tighter text-sm">Investimento Total</td>
                    <td className="px-6 py-5 text-right font-black text-xl">
                      R$ {service.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 gap-16 pt-8 border-t border-dashed border-slate-200">
              <div className="text-center">
                <div className="border-b-2 border-slate-200 w-full mb-3 h-10"></div>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Responsável Técnico</p>
                <p className="text-[10px] text-slate-800 font-bold mt-1 uppercase tracking-tighter">RM Elétrica & Soluções</p>
              </div>
              <div className="text-center">
                <div className="border-b-2 border-slate-200 w-full mb-3 h-10"></div>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Assinatura do Cliente</p>
                <p className="text-[10px] text-slate-800 font-bold mt-1 uppercase tracking-tighter">{customer?.name || 'Cliente'}</p>
              </div>
            </div>
            
            <div className="mt-12 text-center pb-8">
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Documento gerado digitalmente • Obrigado pela preferência!</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #printable-service-note, #printable-service-note * { visibility: visible !important; }
          #printable-service-note {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
          }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
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

  // Obter o serviço e cliente ativos para o modal de forma segura
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
          <h2 className="text-2xl font-bold text-slate-800">Serviços</h2>
          <p className="text-slate-500">Controle de atendimentos e orçamentos.</p>
        </div>
        <button 
          onClick={() => {
            if (isFormOpen) {
              setFormData(initialFormState);
              setEditingServiceId(null);
            }
            setIsFormOpen(!isFormOpen);
          }}
          className={`${isFormOpen ? 'bg-slate-200 text-slate-600' : 'bg-indigo-600 text-white shadow-lg'} px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2`}
        >
          {isFormOpen ? 'Cancelar' : '🛠️ Novo Registro'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleAddService} className="bg-white p-6 rounded-2xl border-2 border-indigo-100 shadow-xl space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-indigo-600 text-xl">{editingServiceId ? '✏️' : '✨'}</span>
            <h3 className="font-black text-slate-800 uppercase tracking-tight">
              {editingServiceId ? 'Editando Registro' : 'Novo Registro de Serviço'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
              <select 
                required 
                value={formData.customerId} 
                onChange={e => setFormData({...formData, customerId: e.target.value})}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="">Selecione um cliente...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select 
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value as ServiceStatus})}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
              >
                {Object.values(ServiceStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="md:col-span-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
              <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Sugestão do Catálogo (Opcional)</label>
              <select 
                onChange={handleServiceTypeSelect}
                className="w-full p-2 rounded-lg border border-slate-300 bg-white text-sm font-bold text-slate-700"
              >
                <option value="">Selecione para preencher preço e descrição...</option>
                {serviceTypes.map(t => <option key={t.id} value={t.id}>{t.name} (Ref: R$ {t.baseValue.toFixed(2)})</option>)}
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
              <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-300 h-20" placeholder="O que foi executado?" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mão de Obra (R$)</label>
              <input type="number" step="0.01" value={formData.serviceValue} onChange={e => setFormData({...formData, serviceValue: Number(e.target.value)})} className="w-full p-2.5 rounded-lg border border-slate-300 font-bold" />
            </div>

            <div>
              <label className="block text-sm font-medium text-rose-700 mb-1">Desconto (R$)</label>
              <input type="number" step="0.01" value={formData.discount} onChange={e => setFormData({...formData, discount: Number(e.target.value)})} className="w-full p-2.5 rounded-lg border-2 border-rose-100 font-bold text-rose-600" />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Pagamento</label>
                <select 
                  value={formData.paymentMethod} 
                  onChange={e => setFormData({...formData, paymentMethod: e.target.value as PaymentMethod})} 
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
                >
                  {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              {formData.paymentMethod === PaymentMethod.CREDIT_CARD && (
                <div className="w-24 animate-in slide-in-from-left duration-200">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Parcelas</label>
                  <select 
                    value={formData.installments} 
                    onChange={e => setFormData({...formData, installments: Number(e.target.value)})} 
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-bold text-indigo-600"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i+1} value={i+1}>{i+1}x</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
               <span>📦</span> Materiais do Estoque
            </h4>
            <div className="flex gap-2 mb-4">
              <select 
                className="flex-1 p-2.5 rounded-lg border border-slate-300 bg-white text-sm"
                value={currentMaterial.id}
                onChange={e => setCurrentMaterial({...currentMaterial, id: e.target.value})}
              >
                <option value="">Buscar material...</option>
                {materials.map(m => <option key={m.id} value={m.id}>{m.name} (R$ {m.sellingPrice})</option>)}
              </select>
              <input type="number" min="1" className="w-20 p-2.5 rounded-lg border border-slate-300" value={currentMaterial.qty} onChange={e => setCurrentMaterial({...currentMaterial, qty: Number(e.target.value)})} />
              <button type="button" onClick={addMaterialToService} className="bg-indigo-50 text-indigo-600 px-4 rounded-lg font-bold hover:bg-indigo-100 transition-colors">Add</button>
            </div>
            
            <div className="space-y-2">
              {formData.materials?.map((sm, idx) => {
                const someMat = materials.find(m => m.id === sm.materialId);
                return (
                  <div key={idx} className="flex justify-between items-center text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="font-bold text-slate-700">{someMat?.name}</span>
                      <span className="ml-2 text-slate-400">x{sm.quantity}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-slate-900">R$ {(someMat ? someMat.sellingPrice * sm.quantity : 0).toFixed(2)}</span>
                      <button type="button" onClick={() => removeMaterialFromForm(sm.materialId)} className="text-rose-500 font-bold p-1">✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg border-4 border-indigo-500/30">
            <div className="flex justify-between items-center">
              <div>
                 <p className="text-[10px] opacity-60 uppercase font-black tracking-widest">Resumo Financeiro</p>
                 <p className="text-xs text-indigo-300">Mão de obra + Materiais - Desconto</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-white">R$ {currentTotals.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white p-4 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl transition-all">
            {editingServiceId ? 'Salvar Alterações' : 'Concluir Registro'}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {services.slice().reverse().map(s => (
          <div key={s.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 hover:border-indigo-200 transition-all">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">{s.date}</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${s.status === ServiceStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {s.status}
                </span>
              </div>
              <h4 className="text-lg font-black text-slate-800">{customers.find(c => c.id === s.customerId)?.name || 'Cliente Particular'}</h4>
              <p className="text-sm text-slate-500 line-clamp-1 italic">{s.description}</p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <button 
                  onClick={() => setSelectedServiceForNote(s.id)} 
                  className="text-[10px] bg-indigo-50 text-indigo-600 font-black px-4 py-2.5 rounded-xl hover:bg-indigo-100 transition-all flex items-center gap-2"
                >
                  📄 VER NOTA / PDF
                </button>
                <button onClick={() => handleEditClick(s)} className="text-[10px] bg-slate-100 text-slate-600 font-black px-4 py-2.5 rounded-xl hover:bg-slate-200 transition-all">
                  ✏️ EDITAR
                </button>
              </div>
            </div>
            <div className="text-right border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[150px]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">VALOR LÍQUIDO</p>
              <p className="text-2xl font-black text-slate-900">R$ {s.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-[9px] text-indigo-500 font-bold uppercase mt-1">
                {s.paymentMethod} {s.paymentMethod === PaymentMethod.CREDIT_CARD && s.installments ? `(${s.installments}x)` : ''}
              </p>
            </div>
          </div>
        ))}
        {services.length === 0 && (
          <div className="py-20 text-center text-slate-400 bg-white rounded-3xl border-4 border-dashed border-slate-100">
            <p className="font-bold">Nenhum serviço registrado.</p>
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
