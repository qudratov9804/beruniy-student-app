import { apiClient } from './client';
import type { ApiResponse, Payment, InitiatePaymentPayload, PaymentStatus, PaymentProvider } from '@/types';

export const paymentsService = {
  initiate: async (payload: InitiatePaymentPayload): Promise<Payment> => {
    const res = await apiClient.post<ApiResponse<Payment>>('/payments/initiate', payload);
    return res.data.data;
  },

  getAll: async (params?: {
    status?: PaymentStatus;
    provider?: PaymentProvider;
  }): Promise<Payment[]> => {
    const res = await apiClient.get<ApiResponse<Payment[]>>('/payments', { params });
    return res.data.data;
  },

  getStatus: async (transactionId: string): Promise<Payment> => {
    const res = await apiClient.get<ApiResponse<Payment>>(`/payments/${transactionId}`);
    return res.data.data;
  },
};
