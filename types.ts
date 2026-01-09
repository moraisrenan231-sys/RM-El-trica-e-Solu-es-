
export interface Customer {
  id: string;
  name: string;
  phone: string;
  cep?: string;
  state?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
  address: string; // Campo legado para compatibilidade, será montado a partir dos novos campos
}

export interface Material {
  id: string;
  name: string;
  description: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
}

export interface ServiceType {
  id: string;
  name: string;
  description: string;
  baseValue: number;
}

export enum PaymentMethod {
  PIX = 'PIX',
  CREDIT_CARD = 'Cartão de Crédito',
  DEBIT_CARD = 'Cartão de Débito',
  CASH = 'Dinheiro'
}

export enum ServiceStatus {
  AWAITING_APPROVAL = 'Aguardando Aprovação',
  IN_PROGRESS = 'Em Andamento',
  COMPLETED = 'Concluído'
}

export interface ServiceMaterial {
  materialId: string;
  quantity: number;
}

export interface ServiceRecord {
  id: string;
  customerId: string;
  description: string;
  date: string;
  materials: ServiceMaterial[];
  paymentMethod: PaymentMethod;
  installments?: number; 
  status: ServiceStatus;
  serviceValue: number; 
  discount: number; 
  totalValue: number; 
}

export interface AppState {
  customers: Customer[];
  materials: Material[];
  serviceTypes: ServiceType[];
  services: ServiceRecord[];
}
