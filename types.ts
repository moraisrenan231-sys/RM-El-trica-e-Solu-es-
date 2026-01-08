
export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
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
  installments?: number; // Added for Credit Card
  status: ServiceStatus;
  serviceValue: number; // Labor cost only
  discount: number; // Discount in R$
  totalValue: number; // Labor + Materials - Discount
}

export interface AppState {
  customers: Customer[];
  materials: Material[];
  serviceTypes: ServiceType[];
  services: ServiceRecord[];
}
