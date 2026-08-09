export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  pricePerUnit: number;
  subtotal: number;
}

export interface InvoiceCustomer {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
}

export interface InvoiceOrganization {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  logoUrl: string | null;
  currency: string;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: string;
  issuedAt: string | null;
  dueAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoicePayment {
  id: string;
  amount: number;
  method: string;
  status: string;
  transactionId: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface InvoiceSecurityDeposit {
  id: string;
  amount: number;
  deductedAmount: number;
  refundedAmount: number;
  status: string;
  collectedAt: string | null;
  settledAt: string | null;
  notes: string | null;
}

export interface InvoiceDamageReport {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: string;
  description: string | null;
  repairCost: number;
  resolved: boolean;
}

export interface InvoiceData {
  invoice: InvoiceRecord | null;
  organization: InvoiceOrganization;
  customer: InvoiceCustomer;
  rental: {
    id: string;
    rentalNumber: string;
    startDate: string;
    endDate: string;
    actualPickupAt: string | null;
    actualReturnAt: string | null;
    status: string;
    notes: string | null;
  };
  items: InvoiceItem[];
  charges: {
    subtotal: number;
    discount: number;
    tax: number;
    lateFee: number;
    damageCharges: number;
    totalAmount: number;
  };
  securityDeposit: InvoiceSecurityDeposit | null;
  payments: {
    transactions: InvoicePayment[];
    totalPaid: number;
    balanceDue: number;
  };
  pickup: {
    id: string;
    scheduledAt: string | null;
    status: string;
    confirmedAt: string | null;
    notes: string | null;
  } | null;
  return: {
    id: string;
    scheduledAt: string | null;
    returnedAt: string | null;
    status: string;
    condition: string | null;
    lateByMinutes: number;
    lateFee: number;
  } | null;
  damageReports: InvoiceDamageReport[];
  summary: {
    subtotal: number;
    discount: number;
    tax: number;
    lateFee: number;
    damageCharges: number;
    totalAmount: number;
    securityDeposit: number;
    deductedDeposit: number;
    refundedDeposit: number;
    totalPaid: number;
    balanceDue: number;
    refundAmount: number;
  };
}
