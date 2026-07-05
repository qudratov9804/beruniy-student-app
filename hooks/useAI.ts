import { useMutation } from '@tanstack/react-query';
import { aiService } from '@/services/api';
import type { AskAIPayload, AskAIResponse } from '@/types';

export const useAskAI = (callbacks?: {
  onSuccess?: (response: AskAIResponse) => void;
  onError?: (err: unknown) => void;
}) => {
  return useMutation({
    mutationFn: (payload: AskAIPayload) => aiService.ask(payload),
    onSuccess: callbacks?.onSuccess,
    onError: callbacks?.onError,
  });
};
