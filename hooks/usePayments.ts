import { useMutation, useQuery } from '@tanstack/react-query';
import { paymentsService } from '@/services/api';
import { QUERY_KEYS } from '@/constants/config';
import type { InitiatePaymentPayload, Payment } from '@/types';

const isFinalStatus = (status?: string) =>
  status === 'completed' || status === 'failed' || status === 'cancelled';

export const useInitiatePayment = (callbacks?: {
  onSuccess?: (payment: Payment) => void;
  onError?: (err: unknown) => void;
}) => {
  return useMutation({
    mutationFn: (payload: InitiatePaymentPayload) => paymentsService.initiate(payload),
    onSuccess: callbacks?.onSuccess,
    onError: callbacks?.onError,
  });
};

export const usePaymentStatus = (transactionId: string | null) => {
  return useQuery({
    queryKey: QUERY_KEYS.PAYMENTS.STATUS(transactionId ?? ''),
    queryFn: () => paymentsService.getStatus(transactionId as string),
    enabled: !!transactionId,
    refetchInterval: (query) => (isFinalStatus(query.state.data?.status) ? false : 3000),
  });
};

export const usePayments = (params?: Parameters<typeof paymentsService.getAll>[0]) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.PAYMENTS.ALL, params],
    queryFn: () => paymentsService.getAll(params),
  });
};
